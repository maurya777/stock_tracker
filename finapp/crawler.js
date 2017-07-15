var mongodb = require('mongodb');
var request = require('request').defaults({'proxy': 'http://www-proxy.idc.oracle.com:80'});
var numeral = require('numeral');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/meteor';

// Use connect method to connect to the Server
MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    // do some work here with the database.
    var collection = db.collection('stocks');
    collection.find({}).toArray(function(err, result) {
      if (err) {
        console.log(err);
      } else if (result.length) {
        var symbols = result.map(stock => stock.name + '.NS');
        var stocks = [];
        result.forEach(stock => {
          stocks[stock.name] = stock;
        });
        request('https://query1.finance.yahoo.com/v7/finance/quote?symbols='+symbols.join(',')+'&fields=regularMarketPrice', function (error, response, body) {
            if (!error && response.statusCode === 200) {
              body = JSON.parse(body);
              body.quoteResponse.result.map(function(quote){
                var stock = stocks[quote.symbol.split('.')[0]];
                var price = stock.price;
                var currPrice = quote.regularMarketPrice;
                var change = (currPrice - price) / (price / 100);
                var trend = change > 15 ? 'BUY-2' :
                            change > 10 ? 'BUY-1' :
                            change > 5  ? 'BUY-0' :
                            change > 1  ? 'BUY'   :
                            change < -15 ? 'SELL-2'    :
                            change < -10 ? 'SELL-1'  :
                            change < -5? 'SELL-0'  :
                            change < -1? 'SELL'  : 'WAIT';

                price = numeral(price).format('0.00');
                currPrice = numeral(currPrice).format('0.00');
                change = numeral(change).format('-0.00');
                collection.update({name: quote.symbol.split('.')[0]}, {$set: {
                  price,
                  currPrice,
                  change,
                  trend
                }});
              });
              //Close connection
              db.close();
            }
        });
      } else {
        console.log('No stocks(s) found in the collection!');
      }
    });
  }
});

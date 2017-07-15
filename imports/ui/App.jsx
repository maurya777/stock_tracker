import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { createContainer } from 'meteor/react-meteor-data';

import { Stocks } from '../api/stocks.js';

import Stock from './Stock.jsx';

// App component - represents the whole app
class App extends Component {
  handleSubmit(event) {
    event.preventDefault();
    // Find the text field via the React ref
    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim().toUpperCase();
    const price = ReactDOM.findDOMNode(this.refs.priceInput).value.trim() * 1;
    const qty = ReactDOM.findDOMNode(this.refs.qtyInput).value.trim() * 1;
    if (!price && !qty) {
      alert('niether price nor quantity given');
      return;
    }
    let stock = Stocks.find({name:text}).fetch();
    if (stock.length > 0) {
      if (price && qty && !stock[0].qty) {
        alert('Existing quantity unknown');
        return;
      }
      const oldPrice = stock[0].price * 1;
      const newQty   = (stock[0].qty || 0) + qty;
      const newPrice = price ? ((oldPrice * (stock[0].qty || 1)) + (price * (qty || 1))) / newQty : oldPrice;
      Stocks.update({_id: stock[0]._id}, {$set: {
        price: newPrice,
        qty: newQty
      }}, function (err, affectedRows) {
        console.log(err);
        console.log(affectedRows);
      });
    } else {
      Stocks.insert({
        name: text,
        price: price,
        qty: qty,
        currPrice: price,
        change: 0,
        createdAt: new Date(), // current time
      });
    }

    // Clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';
    ReactDOM.findDOMNode(this.refs.priceInput).value = '';
    ReactDOM.findDOMNode(this.refs.qtyInput).value = '';
  }

  renderStocks() {
    return this.props.stocks.map((stock) => (
      <Stock key={stock._id} stock={stock} />
    ));
  }

  render() {
    return (
      <div className="container">
        <header>
          <h1>Stock List</h1>
          <form className="new-stock" onSubmit={this.handleSubmit.bind(this)} >
            <input
              type="text"
              ref="textInput"
              placeholder="Stock name"
            />
            <input
              type="text"
              ref="priceInput"
              placeholder="Price"
            />
            <input
              type="text"
              ref="qtyInput"
              placeholder="Quantity"
            />
          <input type="submit" value="Add" />
          </form>
        </header>
        <ul>
          <li className="heading">
            <span className="text symbol">SYMBOL</span>
            <span className="text">COST</span>
            <span className="text">QTY</span>
            <span className="text">CURRENT</span>
            <span className="text">CHANGE</span>
            <span className="text">NET</span>
          </li>
          {this.renderStocks()}
        </ul>
      </div>
    );
  }
}

App.propTypes = {
  stocks: PropTypes.array.isRequired,
}

export default createContainer(() => {
  return {
    stocks: Stocks.find({}, { sort: { createdAt: -1 } }).fetch()
  };
}, App);

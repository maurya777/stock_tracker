import React, { Component, PropTypes } from 'react';
import { Stocks } from '../api/stocks.js';

// Stock component - represents a single todo item
export default class Stock extends Component {
  deleteThisStock() {
    Stocks.remove(this.props.stock._id);
  }

  render() {
    // Give stocks a different className when they are checked off,
    // so that we can style them nicely in CSS
    const stockClassName = this.props.stock.trend ? this.props.stock.trend.toLowerCase() : 'wait';
    const netChange = (this.props.stock.currPrice - this.props.stock.price) * parseInt(this.props.stock.qty || 0);

    return (
      <li className={stockClassName}>
        <button className="delete" onClick={this.deleteThisStock.bind(this)}>
          &times;
        </button>
        <span className="text symbol">{this.props.stock.name}</span>
        <span className="text">{parseFloat(Math.round(this.props.stock.price * 100) / 100).toFixed(2)}</span>
        <span className="text">{this.props.stock.qty || 0}</span>
        <span className="text">{this.props.stock.currPrice}</span>
        <span className="text">{this.props.stock.change}</span>
        <span className="text">{parseFloat(Math.round(netChange * 100) / 100).toFixed(2)}</span>
      </li>
    );
  }
}

Stock.propTypes = {
  // This component gets the stock to display through a React prop.
  // We can use propTypes to indicate it is required
  stock: PropTypes.object.isRequired,
};

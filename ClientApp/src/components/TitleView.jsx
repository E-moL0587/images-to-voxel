import React, { Component } from 'react';
import { Mibrim } from './Mibrim';

export class TitleView extends Component {
  render() {
    return (
      <div>
        <h1>Title View</h1>
        <Mibrim />
        <button onClick={this.props.switchToMain}>Go to Main View</button>
        <button onClick={this.props.switchToExplan}>Go to Explan View</button>
      </div>
    );
  }
}

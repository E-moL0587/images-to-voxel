import React, { Component } from 'react';

export class TitleView extends Component {
  render() {
    return (
      <div>
        <h1>Title View</h1>
        <button onClick={this.props.switchToMain}>Go to Main View</button>
        <button onClick={this.props.switchToExplan}>Go to Explan View</button>
      </div>
    );
  }
}

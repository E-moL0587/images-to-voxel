import React, { Component } from 'react';

export class ActiveView extends Component {
  render() {
    return (
      <>
        <div>
          <h1>Active View</h1>
          <button onClick={this.props.switchToTitle}>Go to Title View</button>
        </div>
      </>
    );
  }
}

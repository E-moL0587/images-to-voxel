import React, { Component } from 'react';

export class FetchData extends Component {
  constructor(props) {
    super(props);
    this.state = { result: null, inputNumber: '', loading: false };
  }

  handleChange = (event) => {
    this.setState({ inputNumber: event.target.value });
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    this.setState({ loading: true });
    const response = await fetch('weatherforecast/addone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ number: parseInt(this.state.inputNumber) })
    });
    const data = await response.json();
    this.setState({ result: data.result, loading: false });
  }

  render() {
    return (
      <div>
        <h1>Number Incrementer</h1>
        <form onSubmit={this.handleSubmit}>
          <label>
            Enter a number:
            <input type="number" value={this.state.inputNumber} onChange={this.handleChange} />
          </label>
          <button type="submit">Submit</button>
        </form>
        {this.state.loading ? <p><em>Loading...</em></p> : <p>Result: {this.state.result}</p>}
      </div>
    );
  }
}

import React, { Component } from 'react';

export class FetchData extends Component {
  static displayName = FetchData.name;

  constructor(props) {
    super(props);
    this.state = { temperatureF: null };
  }

  componentDidMount() {
    this.populateWeatherData();
  }

  async populateWeatherData() {
    const response = await fetch('weatherforecast');
    const data = await response.json();
    this.setState({ temperatureF: data.temperatureF });
  }

  async incrementTemperature() {
    const response = await fetch('weatherforecast/increment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ temperatureF: this.state.temperatureF })
    });
    const data = await response.json();
    this.setState({ temperatureF: data.temperatureF });
  }

  render() {
    return (
      <div>
        <h1>Temperature (F)</h1>
        <p>{this.state.temperatureF !== null ? this.state.temperatureF : 'Loading...'}</p>
        <button onClick={() => this.incrementTemperature()}>Increment</button>
      </div>
    );
  }
}

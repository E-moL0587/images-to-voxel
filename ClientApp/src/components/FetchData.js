import React, { Component } from 'react';

export class FetchData extends Component {
  static displayName = FetchData.name;

  constructor(props) {
    super(props);
    this.state = { temperatureF: null, randomizedString: '', uploadedImageUrl: '' };
    this.fileInput = React.createRef();
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

  async randomizeString(inputString) {
    const response = await fetch('weatherforecast/randomize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputString })
    });
    const data = await response.json();
    this.setState({ randomizedString: data.randomizedString });
  }

  handleRandomizeClick = () => {
    const inputString = prompt('Enter a string to randomize:');
    if (inputString) {
      this.randomizeString(inputString);
    }
  };

  handleFileUpload = async (event) => {
    event.preventDefault();
    const file = this.fileInput.current.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result.split(',')[1];
        const response = await fetch('weatherforecast/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64String })
        });

        if (response.ok) {
          const data = await response.json();
          const url = `data:image/png;base64,${data.base64String}`;
          this.setState({ uploadedImageUrl: url });
        } else {
          alert('File upload failed');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  render() {
    return (
      <div>
        <h1>Temperature (F)</h1>
        <p>{this.state.temperatureF !== null ? this.state.temperatureF : 'Loading...'}</p>
        <button onClick={() => this.incrementTemperature()}>Increment</button>

        <h2>Randomized String</h2>
        <p>{this.state.randomizedString}</p>
        <button onClick={this.handleRandomizeClick}>Randomize String</button>

        <h2>Upload Image</h2>
        <form onSubmit={this.handleFileUpload}>
          <input type="file" ref={this.fileInput} />
          <button type="submit">Upload</button>
        </form>
        {this.state.uploadedImageUrl && (
          <div>
            <h3>Uploaded Image</h3>
            <img src={this.state.uploadedImageUrl} alt="Uploaded" />
          </div>
        )}
      </div>
    );
  }
}

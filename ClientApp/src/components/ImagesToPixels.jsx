import React, { Component } from 'react';

export class ImagesToPixels extends Component {
  constructor(props) {
    super(props);
    this.state = { frontImageBinaryData: '', sideImageBinaryData: '', topImageBinaryData: '' };
    this.fileInputs = { front: React.createRef(), side: React.createRef(), top: React.createRef() };
  }

  componentDidMount() { this.loadInitialImages(); }

  loadInitialImages = async () => {
    await this.loadAndUploadInitialImage('/images/front.png', 'frontImageBinaryData');
    await this.loadAndUploadInitialImage('/images/side.png', 'sideImageBinaryData');
    await this.loadAndUploadInitialImage('/images/top.png', 'topImageBinaryData');
  };

  loadAndUploadInitialImage = async (filePath, stateKey) => {
    const response = await fetch(filePath);
    const blob = await response.blob();
    this.readFileAndUpload(blob, stateKey);
  };

  readFileAndUpload = (file, stateKey) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result.split(',')[1];
      await this.uploadImage(base64String, stateKey);
    };
    reader.readAsDataURL(file);
  };

  uploadImage = async (base64String, stateKey) => {
    const response = await fetch('weatherforecast/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64String })
    });

    if (response.ok) {
      const data = await response.json();
      this.setState({ [stateKey]: data.binaryData });
    }
  };

  handleInputChange = async (event, stateKey) => {
    const file = event.target.files[0];
    if (file) { this.readFileAndUpload(file, stateKey); }
  };

  render() {
    return (
      <>
        <input type="file" ref={this.fileInputs.front} onChange={(e) => this.handleInputChange(e, 'frontImageBinaryData')} />
        <input type="file" ref={this.fileInputs.side} onChange={(e) => this.handleInputChange(e, 'sideImageBinaryData')} />
        <input type="file" ref={this.fileInputs.top} onChange={(e) => this.handleInputChange(e, 'topImageBinaryData')} />
        {this.state.frontImageBinaryData && <pre>{this.state.frontImageBinaryData}</pre>}
        {this.state.sideImageBinaryData && <pre>{this.state.sideImageBinaryData}</pre>}
        {this.state.topImageBinaryData && <pre>{this.state.topImageBinaryData}</pre>}
      </>
    );
  }
}

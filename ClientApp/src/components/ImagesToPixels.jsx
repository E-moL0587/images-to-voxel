import React, { Component } from 'react';

export class ImagesToPixels extends Component {
  constructor(props) {
    super(props);
    this.state = {
      frontImageBinaryData: '', sideImageBinaryData: '', topImageBinaryData: '',
      frontImageFile: null, sideImageFile: null, topImageFile: null,
      size: 20
    };
    this.fileInputs = { front: React.createRef(), side: React.createRef(), top: React.createRef() };
  }

  componentDidMount() { this.loadInitialImages(); }

  componentDidUpdate(_prevProps, prevState) {
    if (prevState.frontImageBinaryData !== this.state.frontImageBinaryData) this.drawBinaryImage('frontCanvas', this.state.frontImageBinaryData);
    if (prevState.sideImageBinaryData !== this.state.sideImageBinaryData) this.drawBinaryImage('sideCanvas', this.state.sideImageBinaryData);
    if (prevState.topImageBinaryData !== this.state.topImageBinaryData) this.drawBinaryImage('topCanvas', this.state.topImageBinaryData);
  }

  loadInitialImages = async () => {
    await this.loadAndUploadInitialImage('/images/front.png', 'frontImageBinaryData', 'frontImageFile');
    await this.loadAndUploadInitialImage('/images/side.png', 'sideImageBinaryData', 'sideImageFile');
    await this.loadAndUploadInitialImage('/images/top.png', 'topImageBinaryData', 'topImageFile');
  };

  loadAndUploadInitialImage = async (filePath, dataKey, fileKey) => {
    const response = await fetch(filePath);
    const blob = await response.blob();
    this.setState({ [fileKey]: blob });
    this.readFileAndUpload(blob, dataKey);
  };

  readFileAndUpload = (file, dataKey) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result.split(',')[1];
      await this.uploadImage(base64String, dataKey);
    };
    reader.readAsDataURL(file);
  };

  uploadImage = async (base64String, dataKey) => {
    const response = await fetch('weatherforecast/upload', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64String, size: this.state.size })
    });
    if (response.ok) {
      const data = await response.json();
      this.setState({ [dataKey]: data.binaryData });
    }
  };

  handleInputChange = async (event, dataKey, fileKey) => {
    const file = event.target.files[0];
    if (file) {
      this.setState({ [fileKey]: file });
      this.readFileAndUpload(file, dataKey);
    }
  };

  handleSizeChange = async (change) => {
    this.setState(prevState => {
      const newSize = Math.max(1, prevState.size + change);
      return { size: newSize };
    }, async () => {
      if (this.state.frontImageFile) this.readFileAndUpload(this.state.frontImageFile, 'frontImageBinaryData');
      if (this.state.sideImageFile) this.readFileAndUpload(this.state.sideImageFile, 'sideImageBinaryData');
      if (this.state.topImageFile) this.readFileAndUpload(this.state.topImageFile, 'topImageBinaryData');
    });
  };

  drawBinaryImage = (canvasId, binaryData) => {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const size = this.state.size;
    const scale = canvas.clientWidth / size;
    canvas.width = size * scale;
    canvas.height = size * scale;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const pixelIndex = y * size + x;
        const color = binaryData[pixelIndex] === '0' ? '#0f0f0f' : '#f0f0f0';
        ctx.fillStyle = color;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  };

  render() {
    return (
      <>
        <div>
          <button onClick={() => this.handleSizeChange(-1)}>-</button>
          <span>{this.state.size}</span>
          <button onClick={() => this.handleSizeChange(1)}>+</button>
        </div>
        <input type="file" ref={this.fileInputs.front} onChange={(e) => this.handleInputChange(e, 'frontImageBinaryData', 'frontImageFile')} />
        <input type="file" ref={this.fileInputs.side} onChange={(e) => this.handleInputChange(e, 'sideImageBinaryData', 'sideImageFile')} />
        <input type="file" ref={this.fileInputs.top} onChange={(e) => this.handleInputChange(e, 'topImageBinaryData', 'topImageFile')} />
        <canvas id="frontCanvas"></canvas>
        <canvas id="sideCanvas"></canvas>
        <canvas id="topCanvas"></canvas>
      </>
    );
  }
}

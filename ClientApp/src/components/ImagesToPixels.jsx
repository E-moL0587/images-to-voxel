import React, { Component } from 'react';

export class ImagesToPixels extends Component {
  constructor(props) {
    super(props);
    this.state = { frontImageBinaryData: '', sideImageBinaryData: '', topImageBinaryData: '', voxelData: [], voxelWidth: 20 };
    this.fileInputs = { front: React.createRef(), side: React.createRef(), top: React.createRef() };
  }

  componentDidMount() { this.loadInitialImages(); }

  componentDidUpdate(_prevProps, prevState) {
    if (prevState.frontImageBinaryData !== this.state.frontImageBinaryData) {
      this.drawBinaryImage('frontCanvas', this.state.frontImageBinaryData);
    }
    if (prevState.sideImageBinaryData !== this.state.sideImageBinaryData) {
      this.drawBinaryImage('sideCanvas', this.state.sideImageBinaryData);
    }
    if (prevState.topImageBinaryData !== this.state.topImageBinaryData) {
      this.drawBinaryImage('topCanvas', this.state.topImageBinaryData);
    }
    if (
      prevState.frontImageBinaryData !== this.state.frontImageBinaryData ||
      prevState.sideImageBinaryData !== this.state.sideImageBinaryData ||
      prevState.topImageBinaryData !== this.state.topImageBinaryData
    ) {
      this.convertToVoxels();
    }
  }

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
    if (file) {
      this.readFileAndUpload(file, stateKey);
    }
  };

  handleVoxelSizeChange = (event) => { this.setState({ voxelWidth: event.target.value }); };

  convertToVoxels = async () => {
    const { frontImageBinaryData, sideImageBinaryData, topImageBinaryData, voxelWidth } = this.state;
    if (!frontImageBinaryData || !sideImageBinaryData || !topImageBinaryData) return;

    const response = await fetch('weatherforecast/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        frontData: frontImageBinaryData,
        sideData: sideImageBinaryData,
        topData: topImageBinaryData,
        width: voxelWidth
      })
    });

    if (response.ok) {
      const data = await response.json();
      this.setState({ voxelData: data.voxelData });
    }
  };

  drawBinaryImage = (canvasId, binaryData) => {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const size = 20;
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
        <input type="file" ref={this.fileInputs.front} onChange={(e) => this.handleInputChange(e, 'frontImageBinaryData')} />
        <input type="file" ref={this.fileInputs.side} onChange={(e) => this.handleInputChange(e, 'sideImageBinaryData')} />
        <input type="file" ref={this.fileInputs.top} onChange={(e) => this.handleInputChange(e, 'topImageBinaryData')} />
        <canvas id="frontCanvas"></canvas>
        <canvas id="sideCanvas"></canvas>
        <canvas id="topCanvas"></canvas>
        <input type="number" value={this.state.voxelWidth} onChange={this.handleVoxelSizeChange} />
        <pre>{this.state.voxelData}</pre>
      </>
    );
  }
}

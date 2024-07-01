import React, { Component } from 'react';

export class MainView extends Component {
  constructor(props) {
    super(props);
    this.fileInputs = { front: React.createRef(), side: React.createRef(), top: React.createRef() };
    this.state = {
      binaryData: { front: '', side: '', top: '' },
      files: { front: null, side: null, top: null },
      size: 20,
      voxelData: null, meshData: null, smoothData: null
    };
  }

  componentDidMount() { this.loadInitialImages(); }

  componentDidUpdate(_prevProps, prevState) {
    const { binaryData } = this.state;
    if (prevState.binaryData.front !== binaryData.front) this.drawBinaryImage('frontCanvas', binaryData.front);
    if (prevState.binaryData.side !== binaryData.side) this.drawBinaryImage('sideCanvas', binaryData.side);
    if (prevState.binaryData.top !== binaryData.top) this.drawBinaryImage('topCanvas', binaryData.top);

    if (prevState.binaryData.front !== binaryData.front || prevState.binaryData.side !== binaryData.side || prevState.binaryData.top !== binaryData.top) {
      this.transformToVoxel();
    }
  }

  loadInitialImages = async () => {
    await this.loadAndUploadInitialImage('/images/front.png', 'front');
    await this.loadAndUploadInitialImage('/images/side.png', 'side');
    await this.loadAndUploadInitialImage('/images/top.png', 'top');
  };

  loadAndUploadInitialImage = async (filePath, key) => {
    const response = await fetch(filePath);
    const blob = await response.blob();
    this.setState(prevState => ({ files: { ...prevState.files, [key]: blob } }));
    this.readFileAndUpload(blob, key);
  };

  readFileAndUpload = (file, key) => {
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64String = reader.result.split(',')[1];
      await this.uploadImage(base64String, key);
    };

    reader.readAsDataURL(file);
  };

  uploadImage = async (base64String, key) => {
    const response = await fetch('weatherforecast/upload', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64String, size: this.state.size })
    });

    if (response.ok) {
      const data = await response.json();
      this.setState(prevState => ({ binaryData: { ...prevState.binaryData, [key]: data.binaryData } }));
    }
  };

  handleInputChange = async (event, key) => {
    const file = event.target.files[0];

    if (file) {
      this.setState(prevState => ({ files: { ...prevState.files, [key]: file } }));
      this.readFileAndUpload(file, key);
    }
  };

  handleSizeChange = async (change) => {
    this.setState(prevState => {
      const newSize = Math.max(1, prevState.size + change);
      return { size: newSize };
    }, async () => {
      const { files } = this.state;
      if (files.front) this.readFileAndUpload(files.front, 'front');
      if (files.side) this.readFileAndUpload(files.side, 'side');
      if (files.top) this.readFileAndUpload(files.top, 'top');
    });
  };

  drawBinaryImage = (canvasId, binaryData) => {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const { size } = this.state;
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

  transformToVoxel = async () => {
    const { binaryData, size } = this.state;
    if (binaryData.front && binaryData.side && binaryData.top) {
      const response = await fetch('weatherforecast/voxel', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frontData: binaryData.front, sideData: binaryData.side, topData: binaryData.top, size })
      });
      if (response.ok) {
        const data = await response.json();
        this.setState({ voxelData: data.voxelData, meshData: data.meshData, smoothData: data.smoothData });
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
        <input type="file" ref={this.fileInputs.front} onChange={(e) => this.handleInputChange(e, 'front')} />
        <input type="file" ref={this.fileInputs.side} onChange={(e) => this.handleInputChange(e, 'side')} />
        <input type="file" ref={this.fileInputs.top} onChange={(e) => this.handleInputChange(e, 'top')} />
        <canvas id="frontCanvas"></canvas>
        <canvas id="sideCanvas"></canvas>
        <canvas id="topCanvas"></canvas>
        <div>{this.state.voxelData}</div>
        <div>{this.state.meshData}</div>
        <div>{this.state.smoothData}</div>
      </>
    );
  }
}

import React, { Component } from 'react';
import { binarizeImage } from './ImagesToPixels';

export class ImagesToVoxel extends Component {
  state = {
    voxelData: null,
    selectedImages: { front: '/images/front.png', side: '/images/side.png', top: '/images/top.png' },
    width: 20,
    binaryData: { front: null, side: null, top: null },
    color: { r: 255, g: 100, b: 255 }
  };

  componentDidMount() { this.processImages(); }
  componentDidUpdate(prevState) {
    if (prevState.width !== this.state.width || prevState.selectedImages !== this.state.selectedImages) {
      this.processImages();
    }
  }

  processImages = async () => {
    const { front, side, top } = this.state.selectedImages;
    const { width } = this.state;
    const [frontBinary, sideBinary, topBinary] = await Promise.all(
      [front, side, top].map(image => binarizeImage(image, width))
    );

    const response = await fetch('weatherforecast/processtovoxel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frontData: frontBinary, sideData: sideBinary, topData: topBinary, width })
    });
    const voxelData = await response.json();
    this.setState({ voxelData, binaryData: { front: frontBinary, side: sideBinary, top: topBinary } });
  }

  handleImageChange = (type) => (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      this.setState(prevState => ({
        selectedImages: { ...prevState.selectedImages, [type]: e.target.result }
      }));
    };
    reader.readAsDataURL(file);
  }

  handleWidthChange = (delta) => {
    this.setState(prevState => {
      const newWidth = Math.max(5, Math.min(50, prevState.width + delta));
      return { width: newWidth };
    });
  }

  handleColorChange = (color) => (event) => {
    const value = parseInt(event.target.value, 10);
    this.setState(prevState => ({
      color: { ...prevState.color, [color]: value }
    }));
  }

  renderImage = (binaryString) => {
    const { r, g, b } = this.state.color;
    const color = `rgb(${r}, ${g}, ${b})`;
    return binaryString ? (
      <div className="image">
        {binaryString.match(new RegExp(`.{1,${this.state.width}}`, 'g')).map((row, i) => (
          <div key={i} className="pixel-row">
            {row.split('').map((bit, j) => (
              <div key={j} className="pixel" style={{ backgroundColor: bit === '1' ? color : '#f0f0f0' }}></div>
            ))}
          </div>
        ))}
      </div>
    ) : null;
  }

  render() {
    const { front, side, top } = this.state.binaryData;
    const { r, g, b } = this.state.color;

    return (
      <>
        <input type="file" onChange={this.handleImageChange('front')} />
        <input type="file" onChange={this.handleImageChange('side')} />
        <input type="file" onChange={this.handleImageChange('top')} />
        <button onClick={() => this.handleWidthChange(1)}>+</button>
        <button onClick={() => this.handleWidthChange(-1)}>-</button>
        <input type="range" min="0" max="255" value={r} onChange={this.handleColorChange('r')} />
        <input type="range" min="0" max="255" value={g} onChange={this.handleColorChange('g')} />
        <input type="range" min="0" max="255" value={b} onChange={this.handleColorChange('b')} />
        <div className="pixels">
          {this.renderImage(front)}
          {this.renderImage(side)}
          {this.renderImage(top)}
        </div>
        {this.state.voxelData && <div>{this.state.voxelData}</div>}
        <style>
          {`
            .pixels { display: flex; justify-content: space-between; }
            .image { width: calc(100vw / 3); }
            .pixel-row { display: flex; }
            .pixel { width: calc(100% / ${this.state.width}); padding-top: calc(100% / ${this.state.width}); }
          `}
        </style>
      </>
    );
  }
}

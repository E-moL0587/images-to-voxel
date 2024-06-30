import React, { Component } from 'react';

export class ImagesToVoxel extends Component {
  state = {
    voxelData: null,
    selectedImages: { front: null, side: null, top: null },
    width: 20,
    binaryData: { front: null, side: null, top: null },
    color: { r: 255, g: 100, b: 255 },
  };

  componentDidMount() {
    this.processInitialImages();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.width !== this.state.width || prevState.selectedImages !== this.state.selectedImages) {
      this.processImages();
    }
  }

  processInitialImages = () => {
    const initialImages = [
      { id: 'front', url: '/images/front.png' },
      { id: 'side', url: '/images/side.png' },
      { id: 'top', url: '/images/top.png' },
    ];

    initialImages.forEach(image => {
      fetch(image.url)
        .then(response => response.blob())
        .then(blob => {
          const file = new File([blob], image.url.split('/').pop() || '', { type: 'image/png' });
          this.setImageFile(file, image.id);
        });
    });
  }

  setImageFile = (file, id) => {
    this.setState((prevState) => ({
      selectedImages: { ...prevState.selectedImages, [id]: file }
    }));
  }

  processImages = async () => {
    const { front, side, top } = this.state.selectedImages;
    const { width } = this.state;

    const binaryData = await Promise.all(
      [front, side, top].map((image) => this.uploadAndPixelizeImage(image, width))
    );

    const response = await fetch('weatherforecast/processtovoxel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frontData: binaryData[0], sideData: binaryData[1], topData: binaryData[2], width })
    });
    
    const voxelData = await response.json();
    this.setState({ voxelData, binaryData: { front: binaryData[0], side: binaryData[1], top: binaryData[2] } });
  }

  uploadAndPixelizeImage = async (imageFile, width) => {
    const formData = new FormData();
    formData.append('imageFile', imageFile);
    formData.append('pixelSize', width);

    const response = await fetch('weatherforecast/pixelize', {
      method: 'POST',
      body: formData
    });

    const binaryData = await response.text();
    return binaryData;
  }

  handleImageChange = (type) => (event) => {
    const file = event.target.files[0];
    this.setImageFile(file, type);
  }

  handleWidthChange = (delta) => {
    this.setState((prevState) => ({
      width: Math.max(5, Math.min(50, prevState.width + delta))
    }));
  }

  handleColorChange = (color) => (event) => {
    const value = parseInt(event.target.value, 10);
    this.setState((prevState) => ({
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
    const { width } = this.state;

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
        <div>Current width: {width}</div>
        <div className="pixels">
          {front && this.renderImage(front)}
          {side && this.renderImage(side)}
          {top && this.renderImage(top)}
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

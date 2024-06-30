import React, { Component } from 'react';

export class FetchData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      voxelData: null,
      selectedImages: { front: '/images/front.png', side: '/images/side.png', top: '/images/top.png' },
      width: 20,
      frontBinary: null,
      sideBinary: null,
      topBinary: null
    };
  }

  componentDidMount() {
    this.processImages();
  }

  processImages = async () => {
    const binarizeImage = async (imageSrc) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = this.state.width;
          canvas.height = this.state.width;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, this.state.width, this.state.width);
          const imageData = ctx.getImageData(0, 0, this.state.width, this.state.width);
          let binaryString = '';
          for (let i = 0; i < this.state.width; i++) {
            for (let j = 0; j < this.state.width; j++) {
              const index = (i * 4) * this.state.width + (j * 4);
              const r = imageData.data[index];
              const g = imageData.data[index + 1];
              const b = imageData.data[index + 2];
              const grayscale = (r + g + b) / 3;
              binaryString += grayscale > 128 ? '1' : '0';
            }
          }
          resolve(binaryString);
        };
      });
    };

    const { front, side, top } = this.state.selectedImages;
    const [frontBinary, sideBinary, topBinary] = await Promise.all(
      [front, side, top].map(image => binarizeImage(image))
    );

    const response = await fetch('weatherforecast/processtovoxel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ frontData: frontBinary, sideData: sideBinary, topData: topBinary, width: this.state.width })
    });
    const voxelData = await response.json();
    this.setState({ voxelData, frontBinary, sideBinary, topBinary });
  }

  handleImageChange = (type) => (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      this.setState(prevState => ({
        selectedImages: { ...prevState.selectedImages, [type]: e.target.result }
      }), this.processImages);
    };
    reader.readAsDataURL(file);
  }

  handleWidthChange = (delta) => {
    this.setState(prevState => {
      const newWidth = Math.max(5, Math.min(50, prevState.width + delta));
      return { width: newWidth };
    }, this.processImages);
  }

  renderImage = (binaryString) => {
    const pixels = [];
    for (let i = 0; i < binaryString.length; i += this.state.width) {
      const row = binaryString.slice(i, i + this.state.width);
      const pixelRow = (
        <div key={i} className="pixel-row">
          {row.split('').map((bit, j) => (
            <div key={j} className="pixel" style={{ backgroundColor: bit === '1' ? 'black' : 'white' }}></div>
          ))}
        </div>
      );
      pixels.push(pixelRow);
    }
    return pixels;
  }

  render() {
    return (
      <div>
        <h1>Voxel Processor</h1>
        <label>
          Upload front image:
          <input type="file" onChange={this.handleImageChange('front')} />
        </label>
        <br />
        <label>
          Upload side image:
          <input type="file" onChange={this.handleImageChange('side')} />
        </label>
        <br />
        <label>
          Upload top image:
          <input type="file" onChange={this.handleImageChange('top')} />
        </label>
        <br />
        <button onClick={() => this.handleWidthChange(1)}>Increase Width</button>
        <button onClick={() => this.handleWidthChange(-1)}>Decrease Width</button>
        <div className="pixels">
          {this.state.frontBinary && (
            <div className="image">
              <h2>Front Image:</h2>
              {this.renderImage(this.state.frontBinary)}
            </div>
          )}
          {this.state.sideBinary && (
            <div className="image">
              <h2>Side Image:</h2>
              {this.renderImage(this.state.sideBinary)}
            </div>
          )}
          {this.state.topBinary && (
            <div className="image">
              <h2>Top Image:</h2>
              {this.renderImage(this.state.topBinary)}
            </div>
          )}
        </div>
        {this.state.voxelData && (
          <div>
            <h2>Voxel Data:</h2>
            <pre>{JSON.stringify(this.state.voxelData, null, 2)}</pre>
          </div>
        )}
        <style>
          {`
            .pixels { display: flex; justify-content: space-between; }
            .image { width: calc(100vw / 3); }
            .pixel-row { display: flex; }
            .pixel { width: calc(100% / ${this.state.width}); padding-top: calc(100% / ${this.state.width}); }
          `}
        </style>
      </div>
    );
  }
}

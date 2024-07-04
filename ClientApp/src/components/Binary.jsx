import React, { Component } from 'react';

export class Binary extends Component {
  componentDidUpdate(prevProps) {
    if (prevProps.binaryData !== this.props.binaryData || prevProps.color !== this.props.color) {
      this.drawBinaryImage();
    }
  }

  drawBinaryImage = () => {
    const { canvasId, binaryData, size, color } = this.props;
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const scale = canvas.clientWidth / size;
    canvas.width = size * scale;
    canvas.height = size * scale;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const pixelIndex = y * size + x;
        const pixelColor = binaryData[pixelIndex] === '0' ? color : '#f0f0f0';
        ctx.fillStyle = pixelColor;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
  };

  render() {
    const { canvasId } = this.props;
    return <canvas id={canvasId} style={{ width: '30%', height: 'auto', border: '3px solid #00ffcc', borderRadius: '10px' }}></canvas>;
  }
}

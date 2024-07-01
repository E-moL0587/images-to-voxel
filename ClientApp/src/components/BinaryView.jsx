import React, { Component } from 'react';

export class BinaryView extends Component {
  componentDidUpdate(prevProps) {
    if (prevProps.binaryData !== this.props.binaryData) { this.drawBinaryImage(); }
  }

  drawBinaryImage = () => {
    const { canvasId, binaryData, size } = this.props;
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
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
    const { canvasId } = this.props;
    return <canvas id={canvasId}></canvas>;
  }
}

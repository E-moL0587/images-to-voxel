import React, { FunctionComponent, useState } from "react";

export const ImageUploader: FunctionComponent = () => {
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [sideFile, setSideFile] = useState<File | null>(null);
  const [topFile, setTopFile] = useState<File | null>(null);
  const [pixelSize, setPixelSize] = useState<number>(20);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, position: 'front' | 'side' | 'top') => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      switch (position) {
        case 'front':
          setFrontFile(file);
          uploadAndDraw(file, 'frontCanvas');
          break;
        case 'side':
          setSideFile(file);
          uploadAndDraw(file, 'sideCanvas');
          break;
        case 'top':
          setTopFile(file);
          uploadAndDraw(file, 'topCanvas');
          break;
      }
    }
  };

  const uploadAndDraw = (file: File, canvasId: string) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("pixelSize", pixelSize.toString());

    fetch('http://localhost:5002/api/home', { method: 'POST', body: formData })
      .then((response) => response.text())
      .then((binaryData) => {
        drawCanvas(canvasId, binaryData);
      })
      .catch((err) => { console.log(err.message); });
  };

  const drawCanvas = (canvasId: string, binaryData: string) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const size = pixelSize;
    const scale = canvas.clientWidth / size;
    canvas.width = size * scale;
    canvas.height = size * scale;

    if (ctx) {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const pixelIndex = y * size + x;
          const color = binaryData[pixelIndex] === '0' ? '#0f0f0f' : '#f0f0f0';
          ctx.fillStyle = color;
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }
  };

  return (
    <>
      <h2>Image Uploader</h2>
      <div>
        <label>Pixel Size:</label>
        <input
          type="number"
          value={pixelSize}
          onChange={(event) => setPixelSize(parseInt(event.target.value, 10))}
          min="1"
          max="100"
        />
      </div>
      <div>
        <label>Front Image:</label>
        <input type="file" onChange={(event) => handleFileChange(event, 'front')} />
      </div>
      <div>
        <label>Side Image:</label>
        <input type="file" onChange={(event) => handleFileChange(event, 'side')} />
      </div>
      <div>
        <label>Top Image:</label>
        <input type="file" onChange={(event) => handleFileChange(event, 'top')} />
      </div>
      <section className="pixels">
        <canvas id="frontCanvas" className="pixel"></canvas>
        <canvas id="sideCanvas" className="pixel"></canvas>
        <canvas id="topCanvas" className="pixel"></canvas>
      </section>

      <style>
        {`
          .pixels { display: flex; justify-content: space-between; }
          .pixel { width: calc(100vw / 3); height: calc(100vw / 3); }
        `}
      </style>
    </>
  );
};

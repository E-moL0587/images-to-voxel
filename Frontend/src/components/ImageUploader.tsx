import React, { FunctionComponent, useState, useEffect } from "react";

export const ImageUploader: FunctionComponent = () => {
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [sideFile, setSideFile] = useState<File | null>(null);
  const [topFile, setTopFile] = useState<File | null>(null);
  const [pixelSize, setPixelSize] = useState<number>(20);

  useEffect(() => {
    fetchAndDrawInitialImages();
  }, []);

  useEffect(() => {
    if (frontFile) uploadAndDraw(frontFile, 'frontCanvas');
    if (sideFile) uploadAndDraw(sideFile, 'sideCanvas');
    if (topFile) uploadAndDraw(topFile, 'topCanvas');
  }, [pixelSize]);

  const fetchAndDrawInitialImages = () => {
    const initialImages = [
      { id: 'frontCanvas', url: '/images/front.png' },
      { id: 'sideCanvas', url: '/images/side.png' },
      { id: 'topCanvas', url: '/images/top.png' },
    ];

    initialImages.forEach(image => {
      fetch(image.url)
        .then(response => response.blob())
        .then(blob => {
          const file = new File([blob], image.url.split('/').pop() || '', { type: 'image/png' });
          switch (image.id) {
            case 'frontCanvas': setFrontFile(file); break;
            case 'sideCanvas': setSideFile(file); break;
            case 'topCanvas': setTopFile(file); break;
          }
          uploadAndDraw(file, image.id);
        });
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, position: 'front' | 'side' | 'top') => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      switch (position) {
        case 'front': setFrontFile(file); uploadAndDraw(file, 'frontCanvas'); break;
        case 'side': setSideFile(file); uploadAndDraw(file, 'sideCanvas'); break;
        case 'top': setTopFile(file); uploadAndDraw(file, 'topCanvas'); break;
      }
    }
  };

  const uploadAndDraw = (file: File, canvasId: string) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("pixelSize", pixelSize.toString());

    fetch('http://localhost:5002/api/home', { method: 'POST', body: formData })
      .then((response) => response.text())
      .then((binaryData) => { drawCanvas(canvasId, binaryData); })
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

  const increasePixelSize = () => { setPixelSize(prevSize => (prevSize < 50 ? prevSize + 1 : 50)); };
  const decreasePixelSize = () => { setPixelSize(prevSize => (prevSize > 5 ? prevSize - 1 : 5)); };

  return (
    <>
      <h1>Image Uploader</h1>
      <div>
        <button onClick={decreasePixelSize}>-</button>
        <h3>{pixelSize}</h3>
        <button onClick={increasePixelSize}>+</button>
      </div>

      <div>
        <h3>Front</h3>
        <input type="file" onChange={(event) => handleFileChange(event, 'front')} />
        <h3>Side</h3>
        <input type="file" onChange={(event) => handleFileChange(event, 'side')} />
        <h3>Top</h3>
        <input type="file" onChange={(event) => handleFileChange(event, 'top')} />
      </div>

      <div className="pixels">
        <canvas id="frontCanvas" className="pixel"></canvas>
        <canvas id="sideCanvas" className="pixel"></canvas>
        <canvas id="topCanvas" className="pixel"></canvas>
      </div>

      <style>
        {`
          .pixels { display: flex; justify-content: space-between; }
          .pixel { width: calc(100vw / 3); height: calc(100vw / 3); }
        `}
      </style>
    </>
  );
};

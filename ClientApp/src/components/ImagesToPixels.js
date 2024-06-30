export const binarizeImage = (imageSrc, width) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = width;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, width);
      const imageData = ctx.getImageData(0, 0, width, width);
      let binaryString = '';
      for (let i = 0; i < width; i++) {
        for (let j = 0; j < width; j++) {
          const index = (i * 4) * width + (j * 4);
          const r = imageData.data[index];
          const g = imageData.data[index + 1];
          const b = imageData.data[index + 2];
          const grayscale = (r + g + b) / 3;
          binaryString += grayscale > 128 ? '0' : '1';
        }
      }
      resolve(binaryString);
    };
  });
};

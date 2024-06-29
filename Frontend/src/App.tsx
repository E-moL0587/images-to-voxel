import React, { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';

function App() {
  const [activePage, setActivePage] = useState<string>('title');

  return (
    <>
      {activePage === 'title' && <ImageUploader />}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css?family=M+PLUS+Rounded+1c');
          * { font-family: 'M PLUS Rounded 1c', sans-serif; }
          ::-webkit-scrollbar { display: none; }
        `}
      </style>
    </>
  );
}

export default App;

import React, { Component } from 'react';
import { BinaryView } from './BinaryView';
import { DisplayView } from './DisplayView';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

export class MainView extends Component {
  constructor(props) {
    super(props);
    this.fileInputs = { front: React.createRef(), side: React.createRef(), top: React.createRef() };
    this.displayRef = React.createRef();
    this.state = {
      binaryData: { front: '', side: '', top: '' },
      files: { front: null, side: null, top: null },
      size: 20,
      iterations: 2,
      lambda: 0.5,
      displayType: 'voxel',
      voxelData: null, meshData: null, smoothData: null,
      red: 0, green: 128, blue: 255,
      tempSize: 20,
      tempIterations: 2,
      tempLambda: 0.5
    };
  }

  componentDidMount() { this.loadInitialImages(); }

  componentDidUpdate(_prevProps, prevState) {
    const { binaryData } = this.state;
    if (prevState.binaryData.front !== binaryData.front ||
        prevState.binaryData.side !== binaryData.side ||
        prevState.binaryData.top !== binaryData.top) {
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

  handleSizeChange = (e) => { this.setState({ tempSize: parseInt(e.target.value, 10) }); };
  
  handleIterationsChange = (e) => { this.setState({ tempIterations: parseInt(e.target.value, 10) }); };
  
  handleLambdaChange = (e) => { this.setState({ tempLambda: parseFloat(e.target.value) }); };

  applyChanges = async () => {
    this.setState(
      { size: this.state.tempSize, iterations: this.state.tempIterations, lambda: this.state.tempLambda },
      () => {
        const { files } = this.state;
        if (files.front) this.readFileAndUpload(files.front, 'front');
        if (files.side) this.readFileAndUpload(files.side, 'side');
        if (files.top) this.readFileAndUpload(files.top, 'top');
      }
    );
  };

  transformToVoxel = async () => {
    const { binaryData, size, iterations, lambda } = this.state;
    if (binaryData.front && binaryData.side && binaryData.top) {
      const response = await fetch('weatherforecast/voxel', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frontData: binaryData.front,
          sideData: binaryData.side,
          topData: binaryData.top,
          size,
          iterations,
          lambda
        })
      });
      if (response.ok) {
        const data = await response.json();
        this.setState({ voxelData: data.voxelData, meshData: data.meshData, smoothData: data.smoothData });
      }
    }
  };

  setDisplayType = (type) => { this.setState({ displayType: type }); };

  handleColorChange = (color, value) => { this.setState({ [color]: value }); };

  handleCanvasClick = (key) => { this.fileInputs[key].current.click(); };

  exportGLB = () => {
    if (this.displayRef.current) {
      if (window.confirm('Do you want to export the 3D model?')) {
        const exporter = new GLTFExporter();
        const options = { binary: true };
        const scene = new THREE.Scene();

        this.displayRef.current.meshes.forEach(mesh => {
          const clonedMesh = mesh.clone();
          clonedMesh.material = new THREE.MeshStandardMaterial({
            color: mesh.material.color,
            roughness: 1,
            metalness: 0
          });
          scene.add(clonedMesh);
        });

        exporter.parse(scene, (result) => {
          if (result instanceof ArrayBuffer) {
            const blob = new Blob([result], { type: 'model/gltf-binary' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'model.glb';
            a.click();
            URL.revokeObjectURL(url);
          } else {
            console.error('GLTF Export Error: Result is not an ArrayBuffer.');
          }
        }, (error) => {
          console.error('GLTF Export Error:', error);
        }, options);
      }
    } else {
      console.error('DisplayView reference is not available.');
    }
  };

  render() {
    const { binaryData, size, displayType, voxelData, meshData, smoothData, red, green, blue, tempSize, tempIterations, tempLambda } = this.state;

    return (
      <>
        <div className="mainContainer">
          <div className="displayContainer">
            <DisplayView
              ref={this.displayRef}
              displayType={displayType}
              voxelData={voxelData}
              meshData={meshData}
              smoothData={smoothData}
              color={`rgb(${red},${green},${blue})`}
            />
          </div>

          <div className="binaryContainer">
            <BinaryView canvasId="frontCanvas" onClick={() => this.handleCanvasClick('front')} binaryData={binaryData.front} size={size} color={`rgb(${red},${green},${blue})`} />
            <BinaryView canvasId="sideCanvas" onClick={() => this.handleCanvasClick('side')} binaryData={binaryData.side} size={size} color={`rgb(${red},${green},${blue})`} />
            <BinaryView canvasId="topCanvas" onClick={() => this.handleCanvasClick('top')} binaryData={binaryData.top} size={size} color={`rgb(${red},${green},${blue})`} />
          </div>

          <div className="controls">
            <div className="colorControls">
              <input type="range" min="0" max="255" value={red} onChange={(e) => this.handleColorChange('red', parseInt(e.target.value))} />
              <input type="range" min="0" max="255" value={green} onChange={(e) => this.handleColorChange('green', parseInt(e.target.value))} />
              <input type="range" min="0" max="255" value={blue} onChange={(e) => this.handleColorChange('blue', parseInt(e.target.value))} />
            </div>

            <div className="sizeControls">
              <label>Size: {tempSize}</label>
              <input type="range" min="5" max="50" value={tempSize} onChange={this.handleSizeChange} />
            </div>

            <div className="iterationControls">
              <label>Iterations: {tempIterations}</label>
              <input type="range" min="1" max="10" value={tempIterations} onChange={this.handleIterationsChange} />
            </div>

            <div className="lambdaControls">
              <label>Lambda: {tempLambda}</label>
              <input type="range" min="0.1" max="1.0" step="0.1" value={tempLambda} onChange={this.handleLambdaChange} />
            </div>

            <button onClick={this.applyChanges}>Update</button>

            <div className="displayControls">
              <button onClick={() => this.setDisplayType('voxel')} disabled={displayType === 'voxel'}>Voxel</button>
              <button onClick={() => this.setDisplayType('mesh')} disabled={displayType === 'mesh'}>Mesh</button>
              <button onClick={() => this.setDisplayType('smooth')} disabled={displayType === 'smooth'}>Smooth</button>
            </div>

            <button onClick={this.exportGLB}>Export GLB</button>
            <input type="file" accept="image/*" ref={this.fileInputs.front} onChange={(event) => this.handleInputChange(event, 'front')} />
            <input type="file" accept="image/*" ref={this.fileInputs.side} onChange={(event) => this.handleInputChange(event, 'side')} />
            <input type="file" accept="image/*" ref={this.fileInputs.top} onChange={(event) => this.handleInputChange(event, 'top')} />
          </div>
        </div>
      </>
    );
  }
}

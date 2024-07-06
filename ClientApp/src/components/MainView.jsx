import React, { Component } from 'react';
import { Binary } from './Binary';
import { Display } from './Display';
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
      size: 25, iterations: 2, lambda: 0.5,
      displayType: 'voxel',
      voxelData: null, meshData: null, smoothData: null,
      red: 0, green: 128, blue: 255
    };
  }

  componentDidMount() { this.loadInitialImages(); }

  componentDidUpdate(_prevProps, prevState) {
    const { binaryData } = this.state;
    if (prevState.binaryData.front !== binaryData.front || prevState.binaryData.side !== binaryData.side || prevState.binaryData.top !== binaryData.top) {
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

  transformToVoxel = async () => {
    const { binaryData, size, iterations, lambda } = this.state;
    if (binaryData.front && binaryData.side && binaryData.top) {
      const response = await fetch('weatherforecast/voxel', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frontData: binaryData.front, sideData: binaryData.side, topData: binaryData.top, size, iterations, lambda
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

  exportGLB = () => {
    const { displayType, voxelData, red, green, blue } = this.state;

    if (this.displayRef.current) {
      if (window.confirm('3Dモデルを出力しますか？')) {
        const exporter = new GLTFExporter();
        const options = { binary: true };
        const scene = new THREE.Scene();

        if (displayType === 'voxel' && voxelData) {
          voxelData.forEach(([x, y, z]) => {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshStandardMaterial({ color: new THREE.Color(`rgb(${red},${green},${blue})`) });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(-x, -y, -z);
            scene.add(cube);
          });
        } else {
          this.displayRef.current.meshes.forEach(mesh => {
            const clonedMesh = mesh.clone();
            clonedMesh.material = new THREE.MeshStandardMaterial({
              color: mesh.material.color, roughness: 1, metalness: 0
            });
            scene.add(clonedMesh);
          });
        }

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
    const { binaryData, size, displayType, voxelData, meshData, smoothData, red, green, blue } = this.state;

    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 col-md-8">
            <div className="card full-height">
              <Display ref={this.displayRef} displayType={displayType} voxelData={voxelData} meshData={meshData} smoothData={smoothData} color={`rgb(${red},${green},${blue})`} />
            </div>
          </div>

          <div className="col-12 col-md-4 overflow-auto full-height">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">ピクセル画像（2値化）</h5>
                <div className="d-flex justify-content-around">
                  <Binary canvasId="frontCanvas" binaryData={binaryData.front} size={size} color={`rgb(${red},${green},${blue})`} />
                  <Binary canvasId="sideCanvas" binaryData={binaryData.side} size={size} color={`rgb(${red},${green},${blue})`} />
                  <Binary canvasId="topCanvas" binaryData={binaryData.top} size={size} color={`rgb(${red},${green},${blue})`} />
                </div>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">コントロールパネル</h5>

                {/* <textarea value={JSON.stringify(voxelData)} readOnly />
                <textarea value={JSON.stringify(meshData)} readOnly />
                <textarea value={JSON.stringify(smoothData)} readOnly /> */}

                <div className="mb-4">
                  <label className="form-label">色の変更</label>
                  <input type="range" className="form-range" min="0" max="255" value={red} onChange={(e) => this.handleColorChange('red', parseInt(e.target.value))} />
                  <input type="range" className="form-range" min="0" max="255" value={green} onChange={(e) => this.handleColorChange('green', parseInt(e.target.value))} />
                  <input type="range" className="form-range" min="0" max="255" value={blue} onChange={(e) => this.handleColorChange('blue', parseInt(e.target.value))} />
                </div>

                <div className="btn-group d-flex flex-column mb-4" role="group" aria-label="Display Type">
                  <div className="d-flex justify-content-between">
                    <button type="button" className={`btn btn-outline-primary ${displayType === 'voxel' ? 'active' : ''}`} onClick={() => this.setDisplayType('voxel')}>ボクセル</button>
                    <button type="button" className={`btn btn-outline-primary ${displayType === 'mesh' ? 'active' : ''}`} onClick={() => this.setDisplayType('mesh')}>メッシュ</button>
                    <button type="button" className={`btn btn-outline-primary ${displayType === 'smooth' ? 'active' : ''}`} onClick={() => this.setDisplayType('smooth')}>スムーズ</button>
                  </div>
                  <button type="button" className="btn btn-success mt-2" style={{ borderRadius: '0.4rem' }} onClick={this.exportGLB}>GLB形式で出力</button>
                </div>

                <div className="mb-4">
                  <label className="form-label">画像の変更（入力）</label>
                  <input type="file" className="form-control mb-2" accept="image/*" ref={this.fileInputs.front} onChange={(event) => this.handleInputChange(event, 'front')} />
                  <input type="file" className="form-control mb-2" accept="image/*" ref={this.fileInputs.side} onChange={(event) => this.handleInputChange(event, 'side')} />
                  <input type="file" className="form-control" accept="image/*" ref={this.fileInputs.top} onChange={(event) => this.handleInputChange(event, 'top')} />
                </div>
              </div>
            </div>

            <button type="button" className="btn btn-secondary w-100" onClick={this.props.switchToTitle}>タイトルへもどる</button>
          </div>
        </div>

        <style>
          {`
            .full-height { height: 100vh; display: flex; flex-direction: column; }
            .overflow-auto { overflow-y: auto; }
            @media (max-width: 768px) { .full-height { height: 50vh; } }
          `}
        </style>
      </div>
    );
  }
}

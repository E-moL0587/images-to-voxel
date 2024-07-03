import React, { Component, createRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';

export class DisplayView extends Component {
  constructor(props) {
    super(props);
    this.materialRef = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide });
    this.sceneRef = createRef();
  }

  componentDidMount() {
    this.materialRef.color.set(this.props.color);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.color !== this.props.color) {
      this.materialRef.color.set(this.props.color);
    }
  }

  addVoxels = (data) => {
    if (!data) return [];
    const surfaceVoxels = this.getSurfaceVoxels(data);
    const center = this.computeBoundingBox(surfaceVoxels).getCenter(new THREE.Vector3());
    return surfaceVoxels.map(([x, y, z], index) => (
      <mesh key={index} position={[-x + center.x, -y + center.y, -z + center.z]} material={this.materialRef}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
    ));
  };

  addMesh = (data) => {
    if (!data) return null;
    const center = this.computeBoundingBox(data).getCenter(new THREE.Vector3());
    const vertices = new Float32Array(data.flatMap(([x, y, z]) => [-x + center.x, -y + center.y, -z + center.z]));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    return (
      <mesh geometry={geometry} material={this.materialRef} />
    );
  };

  getSurfaceVoxels = (data) => {
    const directions = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [-1, 0], [0, 0, 1], [0, 0, -1]];
    return data.filter(([x, y, z]) =>
      directions.some(([dx, dy, dz]) =>
        !data.some(([nx, ny, nz]) =>
          nx === x + dx && ny === y + dy && nz === z + dz
        )
      )
    );
  };

  computeBoundingBox = (data) => {
    const box = new THREE.Box3();
    if (data) data.forEach(([x, y, z]) => box.expandByPoint(new THREE.Vector3(x, y, z)));
    return box;
  };

  exportGLB = () => {
    if (this.sceneRef.current) {
      if (window.confirm('Do you want to export the 3D model?')) {
        const exporter = new GLTFExporter();
        const options = { binary: true };
        exporter.parse(this.sceneRef.current, (result) => {
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
      console.error('Scene reference is not available.');
    }
  };

  render() {
    const { displayType, voxelData, meshData, smoothData } = this.props;
    return (
      <>
        <Canvas style={{ width: '100vw', height: '100vw' }} ref={this.sceneRef}>
          <ambientLight intensity={1.0} />
          <directionalLight position={[10, 5, 10]} intensity={2.0} />
          <directionalLight position={[-10, 5, 10]} intensity={2.0} />
          <directionalLight position={[0, 5, -10]} intensity={2.0} />
          <OrbitControls />
          {displayType === 'voxel' && this.addVoxels(voxelData)}
          {(displayType === 'mesh' || displayType === 'smooth') && this.addMesh(displayType === 'mesh' ? meshData : smoothData)}
        </Canvas>
        <button onClick={this.exportGLB} style={{ position: 'absolute', top: '10px', right: '10px' }}>Export GLB</button>
      </>
    );
  }
}

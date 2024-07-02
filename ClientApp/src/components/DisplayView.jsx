import React, { Component, createRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

export class DisplayView extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = createRef();
  }

  getSurfaceVoxels(data) {
    if (!data) return [];
    
    const isSurfaceVoxel = (x, y, z, data) => {
      const directions = [
        [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]
      ];
      return directions.some(([dx, dy, dz]) => !data.some(([nx, ny, nz]) => nx === x + dx && ny === y + dy && nz === z + dz));
    };

    return data.filter(([x, y, z]) => isSurfaceVoxel(x, y, z, data));
  }

  VoxelScene = ({ data, color }) => {
    const surfaceVoxels = this.getSurfaceVoxels(data);

    return (
      <group>
        {surfaceVoxels.map(([x, y, z], i) => (
          <mesh key={i} position={[-x, -y, -z]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshPhongMaterial color={color} />
          </mesh>
        ))}
      </group>
    );
  };

  MeshScene = ({ data, color }) => {
    if (!data) return null;

    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array(data.flat());
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();

    return (
      <group>
        <mesh geometry={geometry}>
          <meshPhongMaterial color={color} />
        </mesh>
      </group>
    );
  };

  SceneWrapper = ({ displayType, voxelData, meshData, smoothData, color }) => {
    return (
      <>
        {displayType === 'voxel' && <this.VoxelScene data={voxelData} color={color} />}
        {displayType === 'mesh' && <this.MeshScene data={meshData} color={color} />}
        {displayType === 'smooth' && <this.MeshScene data={smoothData} color={color} />}
      </>
    );
  };

  render() {
    const { displayType, voxelData, meshData, smoothData, color } = this.props;

    return (
      <Canvas ref={this.canvasRef} style={{ width: '100vw', height: '100vw' }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 7.5]} intensity={1} />
        <OrbitControls />
        <this.SceneWrapper
          displayType={displayType}
          voxelData={voxelData}
          meshData={meshData}
          smoothData={smoothData}
          color={color}
        />
      </Canvas>
    );
  }
}

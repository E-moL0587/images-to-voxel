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
    const directions = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    return data.filter(([x, y, z]) => directions.some(([dx, dy, dz]) => !data.some(([nx, ny, nz]) => nx === x + dx && ny === y + dy && nz === z + dz)));
  }

  computeBoundingBox(data) {
    const box = new THREE.Box3();
    if (data) data.forEach(([x, y, z]) => box.expandByPoint(new THREE.Vector3(x, y, z)));
    return box;
  }

  VoxelScene = ({ data, color }) => {
    const surfaceVoxels = this.getSurfaceVoxels(data);
    const center = this.computeBoundingBox(surfaceVoxels).getCenter(new THREE.Vector3());
    return (
      <group>
        {surfaceVoxels.map(([x, y, z], i) => (
          <mesh key={i} position={[-x + center.x, -y + center.y, -z + center.z]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshPhongMaterial color={color} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
    );
  };

  MeshScene = ({ data, color }) => {
    if (!data) return null;
    const center = this.computeBoundingBox(data).getCenter(new THREE.Vector3());
    const vertices = new Float32Array(data.map(([x, y, z]) => [-x + center.x, -y + center.y, -z + center.z]).flat());
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    return (
      <mesh geometry={geometry}>
        <meshPhongMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
    );
  };

  SceneWrapper = ({ displayType, voxelData, meshData, smoothData, color }) => (
    <>
      {displayType === 'voxel' && <this.VoxelScene data={voxelData} color={color} />}
      {displayType === 'mesh' && <this.MeshScene data={meshData} color={color} />}
      {displayType === 'smooth' && <this.MeshScene data={smoothData} color={color} />}
    </>
  );

  render() {
    const { displayType, voxelData, meshData, smoothData, color } = this.props;
    return (
      <Canvas ref={this.canvasRef} camera={{ position: [0, 0, 20] }}>
        <ambientLight intensity={1.0} />
        <directionalLight position={[10, 5, 10]} intensity={2.0} />
        <directionalLight position={[-10, 5, 10]} intensity={2.0} />
        <directionalLight position={[0, 5, -10]} intensity={2.0} />
        <OrbitControls />
        <this.SceneWrapper displayType={displayType} voxelData={voxelData} meshData={meshData} smoothData={smoothData} color={color} />
      </Canvas>
    );
  }
}

import React, { Component, createRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

export class DisplayView extends Component {
  constructor(props) {
    super(props);
    this.sceneRef = createRef();
    this.meshes = [];
    this.materialRef = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide });
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
    return surfaceVoxels.map(([x, y, z], index) => {
      const position = new THREE.Vector3(-x + center.x, -y + center.y, -z + center.z);
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        this.materialRef
      );
      mesh.position.copy(position);
      this.meshes.push(mesh);
      return (
        <primitive object={mesh} key={index} />
      );
    });
  };

  addMesh = (data) => {
    if (!data) return null;
    const center = this.computeBoundingBox(data).getCenter(new THREE.Vector3());
    const vertices = new Float32Array(data.flatMap(([x, y, z]) => [-x + center.x, -y + center.y, -z + center.z]));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, this.materialRef);
    this.meshes.push(mesh);
    return <primitive object={mesh} />;
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

  render() {
    const { displayType, voxelData, meshData, smoothData } = this.props;
    this.meshes = [];
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
      </>
    );
  }
}

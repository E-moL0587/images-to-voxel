import React, { Component } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

export class TitleCat extends Component {
  constructor(props) {
    super(props);
    this.state = { points: this.createDefaultPoints() };
  }

  createDefaultPoints = () => {
    return [
      new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, -1, -1), new THREE.Vector3(1, 1, -1), new THREE.Vector3(-1, 1, -1),
      new THREE.Vector3(-1, -1, 1), new THREE.Vector3(1, -1, 1), new THREE.Vector3(1, 1, 1), new THREE.Vector3(-1, 1, 1)
    ];
  };

  renderPoints = () => {
    const { points } = this.state;
    if (points.length === 0) return null;

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.PointsMaterial({ size: 0.1, color: '#ff0000' });
    return <points geometry={geometry} material={material} />;
  };

  render() {
    return (
      <div>
        <Canvas>
          <ambientLight intensity={1.0} />
          <directionalLight position={[10, 5, 10]} intensity={1.0} />
          <directionalLight position={[-10, 5, 10]} intensity={1.0} />
          <directionalLight position={[0, 5, -10]} intensity={1.0} />
          <OrbitControls />
          {this.renderPoints()}
        </Canvas>
      </div>
    );
  }
}

import React, { Component } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import pointsArray from './pointsArray';

export class Mibrim extends Component {
  constructor(props) {
    super(props);
    this.state = {
      points: this.centerPoints(pointsArray[0]),
      currentIndex: 0
    };
    this.switchInterval = 100;
  }

  componentDidMount() {
    this.interval = setInterval(this.switchPoints, this.switchInterval);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  switchPoints = () => {
    this.setState((prevState) => {
      const nextIndex = (prevState.currentIndex + 1) % pointsArray.length;
      return {
        points: this.centerPoints(pointsArray[nextIndex]),
        currentIndex: nextIndex
      };
    });
  };

  centerPoints = (points) => {
    if (!points || points.length === 0) return points;

    const vectors = points.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const boundingBox = new THREE.Box3().setFromPoints(vectors);
    const center = boundingBox.getCenter(new THREE.Vector3());

    return points.map(([x, y, z]) => [-x + center.x, -y + center.y, -z + center.z]);
  };

  renderPoints = () => {
    const { points } = this.state;
    if (points.length === 0) return null;

    const vertices = points.map(p => new THREE.Vector3(...p));
    const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
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

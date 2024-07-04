import React, { Component } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import pointsArray from './pointsArray';

export class Particle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      points: this.centerPoints(pointsArray[0]),
      randomPoints: this.generateRandomPoints(pointsArray[0]),
      currentIndex: 0,
      interpolationProgress: 0,
      initialInterpolationDone: false
    };
    this.switchInterval = 4000;
    this.interpolationDuration = 3000;
    this.startTime = null;
    this.animationFrameId = null;
  }

  componentDidMount() {
    this.startTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.interpolatePoints);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    cancelAnimationFrame(this.animationFrameId);
  }

  generateRandomPoints = (points) => {
    if (!points || points.length === 0) return points;
    return points.map(() => [
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 100
    ]);
  };

  interpolatePoints = (timestamp) => {
    if (!this.startTime) this.startTime = timestamp;
    const progress = (timestamp - this.startTime) / this.interpolationDuration;

    if (progress < 1) {
      this.setState({ interpolationProgress: progress });
      this.animationFrameId = requestAnimationFrame(this.interpolatePoints);
    } else {
      this.setState({ interpolationProgress: 1, initialInterpolationDone: true });
      this.interval = setInterval(this.switchPoints, this.switchInterval);
    }
  };

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
    const { points, randomPoints, interpolationProgress, initialInterpolationDone } = this.state;
    if (points.length === 0 || randomPoints.length === 0) return null;

    const displayPoints = initialInterpolationDone ? points : points.map((p, i) => [
      randomPoints[i][0] * (1 - interpolationProgress) + p[0] * interpolationProgress,
      randomPoints[i][1] * (1 - interpolationProgress) + p[1] * interpolationProgress,
      randomPoints[i][2] * (1 - interpolationProgress) + p[2] * interpolationProgress,
    ]);

    const vertices = displayPoints.map(p => new THREE.Vector3(...p));
    const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    const material = new THREE.PointsMaterial({ size: 0.2, color: '#ff00ff' });
    return <points geometry={geometry} material={material} />;
  };

  render() {
    return (
      <>
        <Canvas style={{ width: '100vw', height: '100vh', background: '#0f0f0f' }} camera={{ position: [0, 0, 50] }}>
          <ambientLight intensity={1.0} />
          <directionalLight position={[10, 5, 10]} intensity={1.0} />
          <directionalLight position={[-10, 5, 10]} intensity={1.0} />
          <directionalLight position={[0, 5, -10]} intensity={1.0} />
          <OrbitControls />
          {this.renderPoints()}
        </Canvas>
      </>
    );
  }
}

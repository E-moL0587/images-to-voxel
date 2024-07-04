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
      currentPoints: this.centerPoints(pointsArray[0]),
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
      const nextPoints = this.centerPoints(pointsArray[nextIndex]);
      const updatedNextPoints = this.matchPointCounts(prevState.points, nextPoints);
      this.startSmoothTransition(prevState.points, updatedNextPoints);
      return {
        points: updatedNextPoints,
        currentIndex: nextIndex
      };
    });
  };

  matchPointCounts = (currentPoints, newPoints) => {
    const currentCount = currentPoints.length;
    const newCount = newPoints.length;

    if (currentCount === newCount) return newPoints;

    const updatedPoints = [...newPoints];
    if (currentCount > newCount) {
      while (updatedPoints.length < currentCount) {
        const randomIndex = Math.floor(Math.random() * newCount);
        updatedPoints.push(newPoints[randomIndex]);
      }
    } else {
      while (updatedPoints.length > currentCount) {
        updatedPoints.pop();
      }
    }
    return updatedPoints;
  };

  startSmoothTransition = (startPoints, endPoints) => {
    this.startTime = performance.now();
    this.setState({ currentPoints: startPoints, interpolationProgress: 0 });
    const interpolate = (timestamp) => {
      const progress = (timestamp - this.startTime) / this.interpolationDuration;
      if (progress < 1) {
        this.setState({
          currentPoints: startPoints.map((p, i) => [
            p[0] * (1 - progress) + endPoints[i][0] * progress,
            p[1] * (1 - progress) + endPoints[i][1] * progress,
            p[2] * (1 - progress) + endPoints[i][2] * progress,
          ]),
          interpolationProgress: progress
        });
        this.animationFrameId = requestAnimationFrame(interpolate);
      } else {
        this.setState({ currentPoints: endPoints, interpolationProgress: 1 });
      }
    };
    this.animationFrameId = requestAnimationFrame(interpolate);
  };

  centerPoints = (points) => {
    if (!points || points.length === 0) return points;

    const vectors = points.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const boundingBox = new THREE.Box3().setFromPoints(vectors);
    const center = boundingBox.getCenter(new THREE.Vector3());

    return points.map(([x, y, z]) => [-x + center.x, -y + center.y, -z + center.z]);
  };

  renderPoints = () => {
    const { currentPoints, randomPoints, interpolationProgress, initialInterpolationDone } = this.state;
    if (currentPoints.length === 0 || randomPoints.length === 0) return null;

    const displayPoints = initialInterpolationDone ? currentPoints : currentPoints.map((p, i) => [
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
      <Canvas style={{ width: '100vw', height: '100vh', background: '#0f0f0f' }} camera={{ position: [0, 0, 50] }}>
        <ambientLight intensity={1.0} />
        <directionalLight position={[10, 5, 10]} intensity={1.0} />
        <directionalLight position={[-10, 5, 10]} intensity={1.0} />
        <directionalLight position={[0, 5, -10]} intensity={1.0} />
        <OrbitControls />
        {this.renderPoints()}
      </Canvas>
    );
  }
}

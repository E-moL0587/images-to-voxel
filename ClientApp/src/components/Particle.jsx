import React, { Component } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import pointsArray from './mibrim';

export class Particle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      points: this.centerPoints(pointsArray[0]),
      randomPoints: this.generateRandomPoints(pointsArray[0]),
      currentPoints: this.centerPoints(pointsArray[0]),
      currentIndex: 0,
      interpolationProgress: 0,
      initialInterpolationDone: false,
      burstPoints: [],
      burstProgress: 0,
      burstDirections: [],
      rotation: { x: 0, y: 0, z: 0 }
    };
    this.switchInterval = 4000;
    this.interpolationDuration = 2000;
    this.burstDuration = 2000;
    this.startTime = null;
    this.animationFrameId = null;
  }

  componentDidMount() {
    this.startTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.interpolatePoints);
    this.animate();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    cancelAnimationFrame(this.animationFrameId);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.initialInterpolationDone && prevState.currentIndex !== this.state.currentIndex) {
      this.startSmoothTransition(prevState.points, this.state.points);
    }
  }

  generateRandomPoints = (points) => {
    if (!points || points.length === 0) return points;
    return points.map(() => [
      (Math.random() - 0.5) * 50,
      (Math.random() - 0.5) * 50,
      (Math.random() - 0.5) * 50
    ]);
  };

  generateBurstDirections = (points) => {
    if (!points || points.length === 0) return points;
    return points.map(() => [
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    ]);
  };

  animate = () => {
    if (this.mesh) {
      this.mesh.rotation.x += 0.003;
      this.mesh.rotation.y += 0.003;
      this.mesh.rotation.z += 0.003;
    }
    this.animationFrameId = requestAnimationFrame(this.animate);
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
    const { currentPoints, randomPoints, interpolationProgress, initialInterpolationDone, burstPoints, burstProgress, burstDirections } = this.state;
    if (currentPoints.length === 0 || randomPoints.length === 0) return null;

    let displayPoints;
    if (burstPoints.length > 0) {
      displayPoints = burstPoints.map((p, i) => [
        p[0] + burstDirections[i][0] * 100 * burstProgress,
        p[1] + burstDirections[i][1] * 100 * burstProgress,
        p[2] + burstDirections[i][2] * 100 * burstProgress,
      ]);
    } else {
      displayPoints = initialInterpolationDone ? currentPoints : currentPoints.map((p, i) => [
        randomPoints[i][0] * (1 - interpolationProgress) + p[0] * interpolationProgress,
        randomPoints[i][1] * (1 - interpolationProgress) + p[1] * interpolationProgress,
        randomPoints[i][2] * (1 - interpolationProgress) + p[2] * interpolationProgress,
      ]);
    }

    const vertices = displayPoints.map(p => new THREE.Vector3(...p));
    const geometry = new THREE.BufferGeometry().setFromPoints(vertices);
    const material = new THREE.PointsMaterial({ size: 0.2, color: '#ff00ff', transparent: true });

    return (
      <points ref={mesh => { this.mesh = mesh; }} geometry={geometry} material={material} />
    );
  };

  handleBurst = () => {
    this.setState({
      burstPoints: this.state.currentPoints,
      burstDirections: this.generateBurstDirections(this.state.currentPoints),
      burstProgress: 0
    });
    const startBurstTime = performance.now();
    const animateBurst = (timestamp) => {
      const burstProgress = (timestamp - startBurstTime) / this.burstDuration;
      if (burstProgress < 1) {
        this.setState({ burstProgress });
        this.animationFrameId = requestAnimationFrame(animateBurst);
      } else {
        this.setState({ burstPoints: [] });
      }
    };
    this.animationFrameId = requestAnimationFrame(animateBurst);
  };

  render() {
    return (
      <>
        <Canvas style={{ width: '100vw', height: '100vh' }} camera={{ position: [0, 0, 50] }}>
          <ambientLight intensity={1.0} />
          <directionalLight position={[10, 5, 10]} intensity={1.0} />
          <directionalLight position={[-10, 5, 10]} intensity={1.0} />
          <directionalLight position={[0, 5, -10]} intensity={1.0} />
          <OrbitControls enablePan={false} enableZoom={false} />
          {this.renderPoints()}
        </Canvas>
      </>
    );
  }
}

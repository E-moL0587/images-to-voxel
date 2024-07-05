import React, { Component, createRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

export class Display extends Component {
  constructor(props) {
    super(props);
    this.state = { points: [], transitionPoints: [], transitionInProgress: false };
    this.sceneRef = createRef();
    this.meshes = [];
    this.materialRef = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide });
    this.startTransitionTime = null;
    this.transitionDuration = 1000;

    this.pointsGeometry = new THREE.BufferGeometry();
    this.pointsMaterial = new THREE.PointsMaterial({ size: 0.1, color: props.color });
    this.pointsMesh = new THREE.Points(this.pointsGeometry, this.pointsMaterial);
  }

  componentDidMount() {
    this.materialRef.color.set(this.props.color);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.color !== this.props.color) {
      this.materialRef.color.set(this.props.color);
      this.pointsMaterial.color.set(this.props.color);
    }
    if (prevProps.displayType !== this.props.displayType) {
      this.startTransition();
    }
  }

  startTransition = () => {
    const { displayType, voxelData, meshData, smoothData } = this.props;
    let newPoints = [];

    if (displayType === 'voxel') {
      newPoints = this.convertToPoints(this.getSurfaceVoxels(voxelData));
    } else if (displayType === 'mesh' || displayType === 'smooth') {
      newPoints = this.convertToPoints(displayType === 'mesh' ? meshData : smoothData);
    }

    this.setState({ points: newPoints, transitionInProgress: true, transitionPoints: [] }, () => {
      this.startTransitionTime = Date.now();
      this.animateTransition();
    });
  };

  animateTransition = () => {
    const { points, transitionPoints } = this.state;
    const now = Date.now();
    const elapsed = now - this.startTransitionTime;
    const t = Math.min(elapsed / this.transitionDuration, 1);
    const easeT = this.easeInOutQuad(t);

    const newTransitionPoints = points.map((point, index) => {
      const start = transitionPoints[index] || new THREE.Vector3();
      return new THREE.Vector3().lerpVectors(start, point, easeT);
    });

    const positions = new Float32Array(newTransitionPoints.length * 3);
    newTransitionPoints.forEach((point, index) => {
      positions[index * 3] = point.x;
      positions[index * 3 + 1] = point.y;
      positions[index * 3 + 2] = point.z;
    });

    this.pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.pointsGeometry.attributes.position.needsUpdate = true;

    if (t < 1) {
      this.setState({ transitionPoints: newTransitionPoints }, () => {
        requestAnimationFrame(this.animateTransition);
      });
    } else {
      this.setState({ transitionInProgress: false });
    }
  };

  easeInOutQuad = (t) => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  };

  convertToPoints = (data) => {
    if (!data) return [];
    const center = this.computeBoundingBox(data).getCenter(new THREE.Vector3());
    return data.map(([x, y, z]) => new THREE.Vector3(-x + center.x, -y + center.y, -z + center.z));
  };

  addVoxels = (data) => {
    if (!data) return null;
    const surfaceVoxels = this.getSurfaceVoxels(data);
    const center = this.computeBoundingBox(surfaceVoxels).getCenter(new THREE.Vector3());
    const instancedMesh = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 1, 1),
      this.materialRef,
      surfaceVoxels.length
    );
    surfaceVoxels.forEach(([x, y, z], index) => {
      const position = new THREE.Vector3(-x + center.x, -y + center.y, -z + center.z);
      const matrix = new THREE.Matrix4().makeTranslation(position.x, position.y, position.z);
      instancedMesh.setMatrixAt(index, matrix);
    });
    this.meshes.push(instancedMesh);
    return <primitive object={instancedMesh} />;
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
    if (!data) return [];
    const voxelSet = new Set(data.map(([x, y, z]) => `${x},${y},${z}`));
    const directions = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];

    return data.filter(([x, y, z]) =>
      directions.some(([dx, dy, dz]) =>
        !voxelSet.has(`${x + dx},${y + dy},${z + dz}`)
      )
    );
  };

  computeBoundingBox = (data) => {
    const box = new THREE.Box3();
    if (data) data.forEach(([x, y, z]) => box.expandByPoint(new THREE.Vector3(x, y, z)));
    return box;
  };

  renderPoints = () => {
    return <primitive object={this.pointsMesh} />;
  };

  render() {
    const { displayType, voxelData, meshData, smoothData } = this.props;
    const { transitionInProgress } = this.state;
    this.meshes = [];

    return (
      <>
        <Canvas ref={this.sceneRef} camera={{ position: [0, 0, 20] }}>
          <ambientLight intensity={1.0} />
          <directionalLight position={[10, 5, 10]} intensity={1.0} />
          <directionalLight position={[-10, 5, 10]} intensity={1.0} />
          <directionalLight position={[0, 5, -10]} intensity={1.0} />
          <OrbitControls />
          {transitionInProgress ? (
            this.renderPoints()
          ) : (
            <>
              {displayType === 'voxel' && this.addVoxels(voxelData)}
              {(displayType === 'mesh' || displayType === 'smooth') && this.addMesh(displayType === 'mesh' ? meshData : smoothData)}
            </>
          )}
        </Canvas>
      </>
    );
  }
}

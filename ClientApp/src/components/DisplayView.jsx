import React, { Component, createRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Function component to load and render a GLB model using useGLTF
function GLBModel({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export class DisplayView extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = createRef();
    this.material = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide });
  }

  componentDidMount() {
    this.initThree();
  }

  componentDidUpdate() {
    this.updateThree();
  }

  initThree() {
    const width = this.canvasRef.current.clientWidth;
    const height = this.canvasRef.current.clientHeight;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 20;
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvasRef.current });
    this.renderer.setSize(width, height);
    this.scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    this.addDirectionalLight(10, 5, 10);
    this.addDirectionalLight(-10, 5, 10);
    this.addDirectionalLight(0, 5, -10);
    this.updateThree();
    this.animate();
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };

  updateThree() {
    while (this.scene.children.length > 4) this.scene.remove(this.scene.children[4]);
    const { displayType, voxelData, meshData, smoothData, color, glbUrl } = this.props;
    this.material.color.set(color);
    if (displayType === 'voxel') this.addVoxels(voxelData);
    else if (displayType === 'mesh' || displayType === 'smooth') this.addMesh(displayType === 'mesh' ? meshData : smoothData);
  }

  addDirectionalLight(x, y, z) {
    const light = new THREE.DirectionalLight(0xffffff, 2.0);
    light.position.set(x, y, z);
    this.scene.add(light);
  }

  addVoxels(data) {
    const surfaceVoxels = this.getSurfaceVoxels(data);
    const center = this.computeBoundingBox(surfaceVoxels).getCenter(new THREE.Vector3());
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    surfaceVoxels.forEach(([x, y, z]) => {
      const cube = new THREE.Mesh(geometry, this.material);
      cube.position.set(-x + center.x, -y + center.y, -z + center.z);
      this.scene.add(cube);
    });
  }

  addMesh(data) {
    if (!data) return;
    const center = this.computeBoundingBox(data).getCenter(new THREE.Vector3());
    const vertices = new Float32Array(data.flatMap(([x, y, z]) => [-x + center.x, -y + center.y, -z + center.z]));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(mesh);
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

  render() {
    const { displayType, glbUrl } = this.props;
    return (
      <Canvas ref={this.canvasRef} style={{ width: '100vw', height: '100vw' }}>
        <ambientLight intensity={1.0} />
        <directionalLight position={[10, 5, 10]} intensity={2.0} />
        <directionalLight position={[-10, 5, 10]} intensity={2.0} />
        <directionalLight position={[0, 5, -10]} intensity={2.0} />
        <OrbitControls />
        {displayType === 'glb' && glbUrl && <GLBModel url={glbUrl} />}
        {displayType !== 'glb' && (
          <primitive object={this.scene} />
        )}
      </Canvas>
    );
  }
}

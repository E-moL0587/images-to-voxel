import React, { Component, createRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class DisplayView extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = createRef();
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

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 20;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvasRef.current });
    this.renderer.setSize(width, height);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    this.scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLight1.position.set(10, 5, 10);
    this.scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLight2.position.set(-10, 5, 10);
    this.scene.add(directionalLight2);

    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 2.0);
    directionalLight3.position.set(0, 5, -10);
    this.scene.add(directionalLight3);

    // Initial render
    this.updateThree();

    // Animation loop
    this.animate();
  }

  animate = () => {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  updateThree() {
    // Clear previous objects
    while (this.scene.children.length > 4) {
      this.scene.remove(this.scene.children[4]);
    }

    const { displayType, voxelData, meshData, smoothData, color } = this.props;

    if (displayType === 'voxel') {
      this.addVoxels(voxelData, color);
    } else if (displayType === 'mesh') {
      this.addMesh(meshData, color);
    } else if (displayType === 'smooth') {
      this.addMesh(smoothData, color);
    }
  }

  addVoxels(data, color) {
    const surfaceVoxels = this.getSurfaceVoxels(data);
    const center = this.computeBoundingBox(surfaceVoxels).getCenter(new THREE.Vector3());

    surfaceVoxels.forEach(([x, y, z], i) => {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshPhongMaterial({ color, side: THREE.DoubleSide });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(-x + center.x, -y + center.y, -z + center.z);
      this.scene.add(cube);
    });
  }

  addMesh(data, color) {
    if (!data) return;

    const center = this.computeBoundingBox(data).getCenter(new THREE.Vector3());
    const vertices = new Float32Array(data.map(([x, y, z]) => [-x + center.x, -y + center.y, -z + center.z]).flat());
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    const material = new THREE.MeshPhongMaterial({ color, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
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
    return <canvas ref={this.canvasRef} style={{ width: '100%', height: '100%' }} />;
  }
}

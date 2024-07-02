import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export const DisplayView = ({ displayType, voxelData, meshData, smoothData, color }) => {
  const canvasRef = useRef(null);
  const scenes = useRef({
    voxel: new THREE.Scene(),
    mesh: new THREE.Scene(),
    smooth: new THREE.Scene()
  }).current;
  const renderer = useRef(null);
  const camera = useRef(null);
  const controls = useRef(null);

  const isSurfaceVoxel = useCallback((x, y, z, data) => {
    const directions = [
      [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]
    ];
    for (let [dx, dy, dz] of directions) {
      if (!data.some(([nx, ny, nz]) => nx === x + dx && ny === y + dy && nz === z + dz)) {
        return true;
      }
    }
    return false;
  }, []);

  const getSurfaceVoxels = useCallback((data) => {
    return data.filter(([x, y, z]) => isSurfaceVoxel(x, y, z, data));
  }, [isSurfaceVoxel]);

  const initScene = useCallback((scene, data, isVoxel) => {
    if (!data) return;
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7.5).normalize();
    scene.add(light);

    const boundingBox = new THREE.Box3();
    data.forEach(([x, y, z]) => boundingBox.expandByPoint(new THREE.Vector3(x, y, z)));
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);

    const material = new THREE.MeshPhongMaterial({ color: new THREE.Color(color) });

    if (isVoxel) {
      const surfaceData = getSurfaceVoxels(data);
      surfaceData.forEach(([x, y, z]) => {
        const voxelMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
        voxelMesh.position.set(-(x - center.x), -(y - center.y), -(z - center.z));
        scene.add(voxelMesh);
      });
    } else {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      data.forEach(point => {
        vertices.push(-(point[0] - center.x), -(point[1] - center.y), -(point[2] - center.z));
      });
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.computeVertexNormals();
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
    }
  }, [getSurfaceVoxels, color]);

  const initScenes = useCallback(() => {
    initScene(scenes.voxel, voxelData, true);
    initScene(scenes.mesh, meshData, false);
    initScene(scenes.smooth, smoothData, false);
  }, [initScene, scenes, voxelData, meshData, smoothData]);

  const switchScene = useCallback((sceneName) => {
    switch (sceneName) {
      case 'voxel':
        renderer.current.render(scenes.voxel, camera.current);
        break;
      case 'mesh':
        renderer.current.render(scenes.mesh, camera.current);
        break;
      case 'smooth':
        renderer.current.render(scenes.smooth, camera.current);
        break;
      default:
        renderer.current.render(scenes.voxel, camera.current);
    }
  }, [scenes]);

  const animate = useCallback(() => {
    requestAnimationFrame(animate);
    controls.current.update();
    switchScene(displayType);
  }, [switchScene, displayType]);

  useEffect(() => {
    const mainCanvas = canvasRef.current;
    renderer.current = new THREE.WebGLRenderer({ canvas: mainCanvas });
    const width = mainCanvas.clientWidth;
    const height = mainCanvas.clientHeight;
    renderer.current.setSize(width, height, false);

    camera.current = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.current.position.set(0, 0, 40);
    controls.current = new OrbitControls(camera.current, renderer.current.domElement);

    initScenes();
    animate();

    return () => {
      renderer.current.dispose();
      Object.values(scenes).forEach(scene => scene.clear());
    };
  }, [initScenes, animate, scenes]);

  useEffect(() => {
    switchScene(displayType);
  }, [switchScene, displayType]);

  return <canvas ref={canvasRef} id="mainCanvas" style={{ width: '100vw', height: '100vw' }} />;
};

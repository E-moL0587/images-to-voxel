import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

export const DisplayView = ({ displayType, voxelData, meshData, smoothData, color }) => {
  const materialRef = useRef(new THREE.MeshPhongMaterial({ side: THREE.DoubleSide }));
  materialRef.current.color.set(color);

  useEffect(() => {
    materialRef.current.color.set(color);
  }, [color]);

  const addVoxels = (data) => {
    if (!data) return [];
    const surfaceVoxels = getSurfaceVoxels(data);
    const center = computeBoundingBox(surfaceVoxels).getCenter(new THREE.Vector3());
    return surfaceVoxels.map(([x, y, z], index) => (
      <mesh key={index} position={[-x + center.x, -y + center.y, -z + center.z]} material={materialRef.current}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
    ));
  };

  const addMesh = (data) => {
    if (!data) return null;
    const center = computeBoundingBox(data).getCenter(new THREE.Vector3());
    const vertices = new Float32Array(data.flatMap(([x, y, z]) => [-x + center.x, -y + center.y, -z + center.z]));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();
    return (
      <mesh geometry={geometry} material={materialRef.current} />
    );
  };

  const getSurfaceVoxels = (data) => {
    const directions = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    return data.filter(([x, y, z]) =>
      directions.some(([dx, dy, dz]) =>
        !data.some(([nx, ny, nz]) =>
          nx === x + dx && ny === y + dy && nz === z + dz
        )
      )
    );
  };

  const computeBoundingBox = (data) => {
    const box = new THREE.Box3();
    if (data) data.forEach(([x, y, z]) => box.expandByPoint(new THREE.Vector3(x, y, z)));
    return box;
  };

  return (
    <Canvas style={{ width: '100vw', height: '100vw' }}>
      <ambientLight intensity={1.0} />
      <directionalLight position={[10, 5, 10]} intensity={2.0} />
      <directionalLight position={[-10, 5, 10]} intensity={2.0} />
      <directionalLight position={[0, 5, -10]} intensity={2.0} />
      <OrbitControls />
      {displayType === 'voxel' && addVoxels(voxelData)}
      {(displayType === 'mesh' || displayType === 'smooth') && addMesh(displayType === 'mesh' ? meshData : smoothData)}
    </Canvas>
  );
};

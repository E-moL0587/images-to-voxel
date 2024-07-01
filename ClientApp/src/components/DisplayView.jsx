import React from 'react';

export const DisplayView = ({ displayType, voxelData, meshData, smoothData }) => {
  let displayContent;

  if (displayType === 'voxel') { displayContent = <div>{voxelData}</div>; }
  else if (displayType === 'mesh') { displayContent = <div>{meshData}</div>; }
  else { displayContent = <div>{smoothData}</div>; }

  return <div>{displayContent}</div>;
};

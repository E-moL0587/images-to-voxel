import React, { Component } from 'react';
import { Particle } from './Particle';

export class TitleView extends Component {
  handleStartClick = () => {
    setTimeout(() => {
      this.props.switchToMain();
    }, 2000);
    this.particleRef.handleBurst();
  };

  render() {
    return (
      <>
        <div className="title-container">
          <Particle className="background" ref={ref => this.particleRef = ref} />
          <h1 className="title">Images to Voxel</h1>
          <button className="start-button" onClick={this.handleStartClick}>Tap to Start</button>
        </div>

        <style>
          {`
            .title-container { position: relative; height: 100vh; display: flex; flex-direction: column; justify-content: space-between; }
            .background { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; }
            .title { position: absolute; top: 20%; left: 50%; transform: translate(-50%, -50%); color: #f0f0f0; }
            .start-button { position: absolute; bottom: 20%; left: 50%; transform: translate(-50%, 50%); }
          `}
        </style>
      </>
    );
  }
}

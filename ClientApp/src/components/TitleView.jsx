import React, { Component } from 'react';
import { Particle } from './Particle';

export class TitleView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fadeIn: true,
      fadeOut: false,
    };
  }

  componentDidMount() {
    this.setState({ fadeIn: false });
  }

  handleStartClick = () => {
    this.setState({ fadeOut: true });
    setTimeout(() => {
      this.props.switchToMain();
    }, 2000);
    this.particleRef.handleBurst();
  };

  render() {
    const { fadeIn, fadeOut } = this.state;

    return (
      <>
        <div className={`title-container ${fadeIn ? 'fade-in' : ''} ${fadeOut ? 'fade-out' : ''}`}>
          <Particle className="background" ref={ref => this.particleRef = ref} />
          <h1 className="title">Images to Voxel</h1>
          <button className="start-button" onClick={this.handleStartClick}>Tap to Start</button>
        </div>

        <style>
          {`
            .title-container { position: relative; height: 100vh; display: flex; flex-direction: column; justify-content: space-between; opacity: 1; transition: opacity 2s ease; }
            .fade-in { opacity: 0; }
            .fade-out { opacity: 0; }
            .background { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; }
            .title { position: absolute; top: 20%; left: 50%; transform: translate(-50%, -50%); color: #f0f0f0; }
            .start-button { position: absolute; bottom: 20%; left: 50%; transform: translate(-50%, 50%); }
          `}
        </style>
      </>
    );
  }
}

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
    this.particleRef.handleBurst();
    this.setState({ fadeOut: true });
    setTimeout(() => {
      this.props.switchToMain();
    }, 2000);
  };

  render() {
    const { fadeIn, fadeOut } = this.state;

    return (
      <>
        <div className={`title-container ${fadeIn ? 'fade-in' : ''} ${fadeOut ? 'fade-out' : ''}`}>
          <Particle className="background" ref={ref => this.particleRef = ref} />
          <h1 className="title">Images to Voxel</h1>
          <h3 className="subtitle">技育博2024 vol.3 / エモル</h3>
          <button className="btn btn-primary start-button" onClick={this.handleStartClick}>はじめる</button>
        </div>

        <style>
          {`
            .title-container { position: relative; height: 100vh; display: grid; place-items: center; opacity: 1; transition: opacity 2s ease; }
            .fade-in { opacity: 0; }
            .fade-out { opacity: 0; }
            .background { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; }
            .title { position: absolute; font-size: 2.5em; font-weight: bold; top: 20%; color: #f0f0f0; }
            .subtitle { position: absolute; font-size: 1.0em; bottom: 20%; color: #f0f0f0; }
            .start-button { position: absolute; bottom: 30%; }
          `}
        </style>
      </>
    );
  }
}

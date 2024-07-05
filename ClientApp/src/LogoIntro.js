import React, { Component } from 'react';

const logos = [
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original-wordmark.svg",
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dot-net/dot-net-original-wordmark.svg",
  "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original-wordmark.svg"
];

export default class LogoIntro extends Component {
  constructor(props) {
    super(props);
    this.state = { currentLogo: 0 };
    this.animationTimeout = null;
  }

  componentDidMount() { this.animateLogos(); }
  componentWillUnmount() { clearTimeout(this.animationTimeout); }

  animateLogos = () => {
    this.animationTimeout = setTimeout(() => {
      const nextLogo = this.state.currentLogo + 1;
      if (nextLogo === logos.length) {
        this.props.onFinish();
      } else {
        this.setState({ currentLogo: nextLogo }, this.animateLogos);
      }
    }, 2000);
  };

  handleSkip = () => {
    clearTimeout(this.animationTimeout);
    const nextLogo = this.state.currentLogo + 1;
    if (nextLogo === logos.length) {
      this.props.onFinish();
    } else {
      this.setState({ currentLogo: nextLogo }, this.animateLogos);
    }
  };

  render() {
    const { currentLogo } = this.state;

    return (
      <>
        <div onClick={this.handleSkip} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0' }}>
          <img key={currentLogo} src={logos[currentLogo]} alt="Logo" style={{ width: '200px', height: '200px', opacity: 0, animation: 'fade 2s ease-in-out' }} />
        </div>

        <style>
          {`
            @keyframes fade { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
          `}
        </style>
      </>
    );
  }
}

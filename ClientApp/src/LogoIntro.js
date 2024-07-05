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
  }

  componentDidMount() { this.interval = setInterval(this.showNextLogo, 2000); }
  componentWillUnmount() { clearInterval(this.interval); }

  showNextLogo = () => {
    this.setState((prevState) => {
      const nextLogo = prevState.currentLogo + 1;
      if (nextLogo === logos.length) {
        clearInterval(this.interval);
        this.props.onFinish();
        return { currentLogo: prevState.currentLogo };
      }
      return { currentLogo: nextLogo };
    });
  }

  handleSkip = () => { this.showNextLogo(); }

  render() {
    const { currentLogo } = this.state;
    return (
      <>
        <div onClick={this.handleSkip} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0' }}>
          <img key={currentLogo} src={logos[currentLogo]} alt="Logo" style={{ width: '200px', height: '200px', animation: 'fade 2s ease-in-out' }} />
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

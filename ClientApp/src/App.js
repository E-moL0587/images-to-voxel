import React, { Component } from 'react';
import LogoIntro from './LogoIntro';
import { MainView } from './components/MainView';
import { TitleView } from './components/TitleView';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = { view: 'intro' };
  }

  switchToTitle = () => { this.setState({ view: 'title' }); };
  switchToMain = () => { this.setState({ view: 'main' }); };

  finishIntro = () => { this.setState({ view: 'title' }); };

  render() {
    const { view } = this.state;

    return (
      <>
        {view === 'intro' ? (
          <LogoIntro onFinish={this.finishIntro} />
        ) : view === 'title' ? (
          <TitleView switchToMain={this.switchToMain} />
        ) : (
          <MainView switchToTitle={this.switchToTitle} />
        )}
      </>
    );
  }
}

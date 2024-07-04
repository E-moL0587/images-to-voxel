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
        <div>
          {view === 'intro' ? <LogoIntro onFinish={this.finishIntro} /> : null}
          {view === 'title' ? <TitleView switchToMain={this.switchToMain} /> : null}
          {view === 'main' ? <MainView switchToTitle={this.switchToTitle} /> : null}
        </div>

        <style>
          {`
            @import url('https://fonts.googleapis.com/css?family=M+PLUS+Rounded+1c');
            * { font-family: 'M PLUS Rounded 1c', sans-serif; }
            ::-webkit-scrollbar { display: none; }
            body { background-color: #0f0f0f; }
          `}
        </style>
      </>
    );
  }
}

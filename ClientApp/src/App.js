import React, { Component } from 'react';
import { MainView } from './components/MainView';
import { TitleView } from './components/TitleView';
import { ActiveView } from './components/ActiveView';
import { ExplanView } from './components/ExplanView';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = { view: 'title' };
  }

  switchToTitle = () => { this.setState({ view: 'title' }); };
  switchToMain = () => { this.setState({ view: 'main' }); };
  switchToExplan = () => { this.setState({ view: 'explan' }); };

  render() {
    const { view } = this.state;

    return (
      <>
        {view === 'title' ? (
          <TitleView switchToMain={this.switchToMain} switchToExplan={this.switchToExplan} />
        ) : view === 'main' ? (
          <>
            <ActiveView switchToTitle={this.switchToTitle} />
            <MainView />
          </>
        ) : (
          <>
            <ActiveView switchToTitle={this.switchToTitle} />
            <ExplanView />
          </>
        )}
      </>
    );
  }
}

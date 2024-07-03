import React, { Component } from 'react';
import { MainView } from './components/MainView';
import { TitleView } from './components/TitleView';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = { view: 'title' };
  }

  switchToTitle = () => { this.setState({ view: 'title' }); };
  switchToMain = () => { this.setState({ view: 'main' }); };

  render() {
    const { view } = this.state;

    return (
      <>
        {view === 'title' ? (
          <TitleView switchToMain={this.switchToMain} />
        ) : (
          <MainView switchToTitle={this.switchToTitle} />
        )}
      </>
    );
  }
}

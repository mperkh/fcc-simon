import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class App extends Component {
  render() {
    return (
      <div className="App">
Hello World
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

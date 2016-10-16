import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './bootstrap-theme.min.css'

/*
*
*
* http://www.waitingforfriday.com/index.php/Reverse_engineering_an_MB_Electronic_Simon_game
*
*/

class SimonGame extends Component {
  constructor(props) {
    super(props);

    this.sequence = Array(20).fill(0).map(() => {
      return Math.round(Math.random() * 3) + 1
    });

    this.count = 0;
    this.pos = 0;
    this.input = 0;
    this.difficulty = 420;
    this.timeoutID = undefined;

    this.Sounds = [515, 310, 252, 209, 42];

    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    this.audioCtx = new AudioContext();

    this.state = {
      status: 'paused',
      field: 0,
      strict: false
    }

    this.handleStart = this.handleStart.bind(this);
    this.handleStrict = this.handleStrict.bind(this);
  }

  startTimeout() {
    clearTimeout(this.timeoutID);
    this.timeoutID = undefined;
    if (!this.timeoutID) {
      this.timeoutID = setTimeout(() => {
        this.doError()
      }, 3000)
    }
  }

  playNote(freq, duration) {
    // create Oscillator node
    let oscillator = this.audioCtx.createOscillator();

    oscillator.type = 'square';
    oscillator.frequency.value = freq; // value in hertz
    oscillator.connect(this.audioCtx.destination);
    oscillator.start();
    oscillator.stop(this.audioCtx.currentTime + duration);
  }

  playTone(pos, speed) {
    this.setState({
      field: pos
    }, () => {
      setTimeout(() => {
        this.setState({
          field: 0
        })
      }, (pos === 5) ? 1500 : speed)
    })
    if (pos === 5) {
      this.playNote(this.Sounds[4], 1.5)
    } else {
      this.playNote(this.Sounds[pos - 1], speed / 1000)
    }
  }

  playTones(speed) {
    clearTimeout(this.timeoutID);
    this.playTone(this.sequence[this.pos], speed);
    this.pos++
    if (this.pos <= this.count) {
      setTimeout(() => {
        this.playTones(speed)
      }, speed + 50)
    } else {
      this.pos = 0;
      setTimeout(() => {
        this.setState({
          status: 'idle'
        })
        this.startTimeout()
      }, speed + 50)

    }
  }

  doError(num) {
    this.playTone(5, this.difficulty);
    if (this.state.strict) {
      setTimeout(() => {
        this.sequence = Array(20).fill(0).map(() => {
          return Math.round(Math.random() * 3) + 1
        });
        this.count = 0;
        this.pos = 0;
        this.input = 0;
        this.difficulty = 420;
        this.setState({
          status: 'paused',
          field: 0
        }, () => {
          this.playTones(this.difficulty);
        })
      }, 2000)
    } else {
      this.setState({
        status: 'playing'
      }, () => {
        this.input = 0;
        setTimeout(() => {
          this.playTones(this.difficulty);
        }, 2000)
      })
    }
  }

  gameWon(num) {
    clearTimeout(this.timeoutID);

    this.playTone(num, 20)

    setTimeout(() => {
      for (let i=0; i <= 4; i++) {
        setTimeout(() => {
          this.playTone(num, 70)
        }, 90 * i)
      }
    }, 40)

    setTimeout(() => {
      this.sequence = Array(20).fill(0).map(() => {
        return Math.round(Math.random() * 3) + 1
      });
      this.count = 0;
      this.pos = 0;
      this.input = 0;
      this.difficulty = 420;
      this.setState({
        status: 'paused',
        field: 0
      })
    }, 490)
  }

  handleClick(num){
    this.startTimeout();
    if (this.count > 8 && this.count <=  12) {
      this.difficulty = 320
    } else if (this.count > 12) {
      this.difficulty = 220
    }
    if (this.state.status === 'idle') {
      if (num === this.sequence[this.input]) {
        this.playTone(num, this.difficulty);
        this.input++
        if (this.input >= 20) {
          this.gameWon(num);
        } else {
          if (this.input > this.count) {
            this.setState({
              status: 'playing'
            }, () => {
              this.count++;
              this.input = 0;
              setTimeout(() => {
                this.playTones(this.difficulty);
              }, 800)
            })
          }
        }
      } else {
        this.doError(num)
      }
    }
  }

  handleStart() {
    this.pos = 0;
    this.setState({
      status: 'playing'
    }, () => {
      this.playTones(this.difficulty);
    })
  }

  handleStrict() {
    this.setState({
      strict: !this.state.strict
    });
  }

  render() {
    return (
      <div>
        <p className="lead">
          Game turned <strong>OFF</strong>.<br />
          Strict Mode is <strong>{(this.state.strict) ? 'ON' : 'OFF'}</strong>.<br />
          Level: <strong>{this.count + 1}</strong>
        </p>
        <button
          className="btn btn-primary"
          type="button"
          onClick={this.handleOn}
          >
          Turn On/Off
        </button>
        <button
          className="btn"
          type="button"
          onClick={this.handleStart}
          disabled={(this.state.status === 'paused') ? false : true}
          >
          Start
        </button>
        <button
          className="btn"
          type="button"
          onClick={this.handleStrict}
          >
          Toggle Strict Mode
        </button>
        <br />
        <div className="row-fluid">
          <div className="span6">
            <div
              id="field01"
              className={'GameField' + (this.state.field === 1 ? ' active' : '')}
              onClick={this.handleClick.bind(this, 1)}
            >
            </div>
          </div>
          <div className="span6">
            <div
              id="field02"
              className={'GameField' + (this.state.field === 2 ? ' active' : '')}
              onClick={this.handleClick.bind(this, 2)}
            >
            </div>
          </div>
        </div>
        <div className="row-fluid">
          <div className="span6">
            <div
              id="field03"
              className={'GameField' + (this.state.field === 3 ? ' active' : '')}
              onClick={this.handleClick.bind(this, 3)}
            >
            </div>
          </div>
          <div className="span6">
            <div
              id="field04"
              className={'GameField' + (this.state.field === 4 ? ' active' : '')}
              onClick={this.handleClick.bind(this, 4)}
            >
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="container">
        <div className="row-fluid">
          <div className="span8 offset2">
            <div className="page-header">freeCodeCamp: Build a Simon Game
              <br/>
                <small>
                  Project by camper
                  <a href="https://www.freecodecamp.com/mperkh"
                    target="_blank"
                  >
                    &nbsp;Michael Perkhofer
                  </a>
                </small>
            </div>
            <SimonGame />
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

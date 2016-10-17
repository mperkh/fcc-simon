import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { PageHeader } from 'react-bootstrap';
import { Grid } from 'react-bootstrap';
import { Row } from 'react-bootstrap';
import { Col } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import './index.css';

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
      status: 'off',
      field: 0,
      strict: false
    }

    this.handleStart = this.handleStart.bind(this);
    this.handleStrict = this.handleStrict.bind(this);
    this.handleOnOff = this.handleOnOff.bind(this);
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
    if (this.state.status === 'idle' && this.state.status !== 'off' ) {
      this.startTimeout();
      if (this.count > 8 && this.count <=  12) {
        this.difficulty = 320
      } else if (this.count > 12) {
        this.difficulty = 220
      }
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
        this.setState({
          status: 'paused'
        }, () => {
          this.doError(num);
        })
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

  handleOnOff() {
    if (this.state.status === 'off') {
      this.setState({
        status: 'paused'
      });
    } else {
      this.setState({
        status: 'off',
        field: 0
      }, () => {
        this.sequence = Array(20).fill(0).map(() => {
          return Math.round(Math.random() * 3) + 1
        });
        this.count = 0;
        this.pos = 0;
        this.input = 0;
        this.difficulty = 420;
        // http://stackoverflow.com/a/8860203
        let id = setTimeout(function() {}, 0);
        while (id--) {
            window.clearTimeout(id);
        }
      });
    }
  }

  render() {
    let StrictMode;
    if (this.state.status === 'off') {
      StrictMode = '--';
    } else if (this.state.strict) {
      StrictMode = 'ON.';
    } else {
      StrictMode = 'OFF.'
    }
    return (
      <div>
        <p className="lead">
          Game turned <strong>{(this.state.status === 'off') ? 'OFF' : 'ON'}</strong>.<br />
          Strict Mode is <strong>{StrictMode}</strong><br />
          Level: <strong>{(this.state.status === 'off') ? '--' : this.count + 1}</strong>
        </p>
        <Row>
          <Col xs={4} xsOffset={2} className="parent">
            <div
              id="field01"
              className={'img-responsive GameField' + (this.state.field === 1 ? ' active' : '')}
              onClick={this.handleClick.bind(this, 1)}
            >
            </div>
          </Col>
          <Col xs={4} className="parent">
            <div
              id="field02"
              className={'img-responsive GameField' + (this.state.field === 2 ? ' active' : '')}
              onClick={this.handleClick.bind(this, 2)}
            >
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs={4} xsOffset={2} className="parent">
            <div
              id="field03"
              className={'img-responsive GameField' + (this.state.field === 3 ? ' active' : '')}
              onClick={this.handleClick.bind(this, 3)}
            >
            </div>
          </Col>
          <Col xs={4} className="parent">
            <div
              id="field04"
              className={'img-responsive GameField' + (this.state.field === 4 ? ' active' : '')}
              onClick={this.handleClick.bind(this, 4)}
            >
            </div>
          </Col>
        </Row>
        <p id="gamecontrols">
          <Button
            bsSize="large"
            onClick={this.handleOnOff}
            >
            Turn On-Off
          </Button>
          <Button
            bsSize="large"
            onClick={this.handleStart}
            disabled={(this.state.status === 'off' || this.state.status !== 'paused') ? true : false}
            >
            Start
          </Button>
          <Button
            bsSize="large"
            onClick={this.handleStrict}
            disabled={(this.state.status === 'off') ? true : false}
            >
            Toggle Strict Mode
          </Button>
        </p>
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <Grid>
        <Row>
          <Col md={8} mdOffset={2}>
            <PageHeader>freeCodeCamp: Build a Simon Game
              <br/>
                <small>
                  Project by camper
                  <a href="https://www.freecodecamp.com/mperkh"
                    target="_blank"
                  >
                    &nbsp;Michael Perkhofer
                  </a>
                </small>
            </PageHeader>
            <SimonGame />
          </Col>
        </Row>
      </Grid>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { PageHeader } from 'react-bootstrap';
import { Grid } from 'react-bootstrap';
import { Row } from 'react-bootstrap';
import { Col } from 'react-bootstrap';
//import { Modal } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
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

    this.Sounds = [515, 310, 252, 209, 42];

    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    this.audioCtx = new AudioContext();

    this.state = {
      status: 'idle',
      field: 0
    }

    this.handleStart = this.handleStart.bind(this);
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

  playTone(pos, err, speed) {
    this.setState({
      field: pos
    }, () => {
      setTimeout(() => {
        this.setState({
          field: 0
        })
      }, (err) ? 1500 : speed)
    })
    if (err) {
      this.playNote(this.Sounds[4], 1.5)
    } else {
      this.playNote(this.Sounds[pos - 1], speed / 1000)
    }
  }

  playTones(speed) {
    this.playTone(this.sequence[this.pos], false, speed);
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
      }, speed + 50)

    }
  }

  handleStart () {
    console.log(this.sequence);
    this.pos = 0;
    this.setState({
      status: 'playing'
    }, () => {
      this.playTones(420);
    })
  }

  handleClick(num){
    if (this.state.status === 'idle') {
      if (num === this.sequence[this.input]) {
        this.playTone(num, false, 420);
        this.input++
        if (this.input > this.count) {
          this.setState({
            status: 'playing'
          }, () => {
            this.count++;
            this.input = 0;
            setTimeout(() => {
              this.playTones(420);
            }, 1000)
          })
        }
      } else {
        this.playTone(num, true, 420);
        this.setState({
            status: 'playing'
          }, () => {
            this.input = 0;
            setTimeout(() => {
              this.playTones(470);
            }, 2000)
          })
      }
    }
  }

  componentDidMount() {

  }

  render() {
    return (
      <div>
        {this.state.status}<br />
        {this.count + 1}<br />
        <Button
          onClick={this.handleStart}
          bsSize="large"
          >
          Start
        </Button>
        <Row>
          <Col xs={6}>
            <div
              id="field01"
              className={'GameField' + (this.state.field === 1 ? ' active' : '')}
              onClick={this.handleClick.bind(this, 1)}
            >
            </div>
          </Col>
          <Col xs={6}>
            <div
              id="field02"
              className={'GameField' + (this.state.field === 2 ? ' active' : '')}
              onClick={this.handleClick.bind(this, 2)}
            >
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs={6} >
            <div
              id="field03"
              className={'GameField' + (this.state.field === 3 ? ' active' : '')}
              onClick={this.handleClick.bind(this, 3)}
            >
            </div>
          </Col>
          <Col xs={6}>
            <div
              id="field04"
              className={'GameField' + (this.state.field === 4 ? ' active' : '')}
              onClick={this.handleClick.bind(this, 4)}
            >
            </div>
          </Col>
        </Row>
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

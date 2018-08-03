import React, {Component} from 'react';
import {connect} from 'react-redux';
import {revealAdjacent, findAdjacentMines, validDiffs, revealStyle} from '../helpers/board-helpers';
import Result from '../components/result';
import {toggleFlag} from '../helpers/flag-helpers';

class Board extends Component {

  constructor() {
    super();

    this.state = {
      flagged: {},
      time: 0,
      timer: null
    }

    this.flag = this.flag.bind(this);
    this.tick = this.tick.bind(this);
  }

  flag(e) {
    e.preventDefault();

    if(this.props.isGameOver) return;

    const el = e.target.nodeName === 'I' ? e.target.parentNode : e.target,
          idObj = toggleFlag(el);

    this.setState({flagged: {...this.state.flagged, ...idObj}}, this.checkForWinner);
  }

  checkForWinner() {
    let self = this;
    const flaggedMines = Object.keys(self.state.flagged).filter(k => self.state.flagged[k] === true);

    if(self.props.mines.length === flaggedMines.length) {
      console.log("All the mines flagged?");
      let isWinner = true;
      for(let i=0; i < flaggedMines.length; i++) {
        if(flaggedMines[i] !== self.props.mines[i]) {
          isWinner = false;
        }
      }

      if(isWinner) {
        console.log("You WIN!");
        clearInterval(self.state.timer);
        this.props.dispatch({type: 'SET_IS_GAME_OVER', value: true});
        this.props.dispatch({type: 'SET_IS_WINNER', value: true});
        const blanks = document.querySelectorAll('.cells .cell.blank');
        blanks.forEach(cell => { revealStyle(Number(cell.getAttribute('data-id'))) });
      }
    }
  }

  guess = (e) => {
    if(this.props.isGameOver) return;

    const el = e.target.nodeName === 'I' ? e.target.parentNode : e.target;
    if(el.className.indexOf('cell') < 0 || el.className.indexOf('revealed') > -1) return;

    if(!this.state.time) {
      let timer = setInterval(this.tick, 1000);
      this.setState({timer});
    }

    const board = this.props.board,
          id = Number(el.getAttribute('data-id')),
          type = el.attributes.getNamedItem('data-type').value;

    if(this.state.flagged[id]) {
      return;
    }

    if(type === 'mine') {
      console.log('GAME OVER!');
      this.props.dispatch({type: 'SET_IS_GAME_OVER', value: true});
      this.props.dispatch({type: 'SET_IS_WINNER', value: false});
      clearInterval(this.state.timer);

      const flags = document.querySelectorAll('.fa-flag');
      flags.forEach(f => f.style.display = 'none');
      const mineCells = document.querySelectorAll('.cells .cell.mine');
      mineCells.forEach(cell => {cell.className += ' revealed';});
      const mines = document.querySelectorAll('.cells .cell.mine .fa-bomb');
      e.target.style.backgroundColor = 'red';

      mines.forEach(cell => {cell.style.display = 'inline';});
      return;
    }

    const mineCount = findAdjacentMines(id, board);

    if(mineCount === 0) {
      // find and activate all the adjacent elements
      revealStyle(id);
      revealAdjacent(id, validDiffs(id), board);
    }
  };

  tick() {
    this.setState({time: this.state.time + 1});
  }

  render() {
    const board = this.props.board;
    return(
      <div id="board" onClick={this.guess} onContextMenu={this.flag}>

        <div className="scoreboard">
          <div className="minesLeft">
            {this.props.mines.length - Object.keys(this.state.flagged).length}
          </div>
          <div className="timer">
            {this.state.time}
          </div>
        </div>

        <div className="cells">
          {board.map((cell, idx) => {
            return <div
                        key={idx}
                        id={`CellId-${cell.id}`}
                        data-id={cell.id}
                        className={`cell ${cell.type}`}
                        data-type={cell.type}
                    >{cell.type === 'mine' ? <i className="fas fa-bomb"></i> : ''}</div>
          })}
        </div>

        <Result />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  board: state.board,
  mines: state.mines,
  isGameOver: state.isGameOver
});

export default connect(mapStateToProps)(Board);
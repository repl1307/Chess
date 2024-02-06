import Pawn from './pieces/Pawn.js';
import Knight from './pieces/Knight.js';
import Bishop from './pieces/Bishop.js';
import Rook from './pieces/Rook.js';
import Queen from './pieces/Queen.js';
import King from './pieces/King.js';
import ChessPiece from './pieces/ChessPiece.js';
import Draggable from './Draggable.js';

export default class Board {
  constructor(boardHtml){
    this.html = boardHtml;
    this.turn = 0;
    this.whitePieces = [];
    this.blackPieces = [];
    this.whiteScore = 0;
    this.blackScore = 0;
    this.whiteTime = 60*10; //seconds
    this.blackTime = 60*10;
    this.selectedPiece = null;
    this.cells = [];
    this.createGrid();
    this.hideAllNotches();
    this.createPieces();
    ChessPiece.board = this;
    this.gameState = "playing";
    setInterval(() => {
      this.updateTime();
    }, 1000);
    this.getGameState();
  }
  hideAllNotches(){
    this.cells.forEach(row => row.forEach(cell => {
      cell.notchHtml.classList.add('hidden');
      cell.captureNotchHtml.classList.add('hidden');
    }));
  }

  //update current player's time
  updateTime(){
    if(this.gameState != "playing") 
      return;
    const formatTime = seconds => {
      let mins = Math.floor(seconds/60);
      if(mins < 10) mins = `0${mins}`;
      let secs = seconds % 60;
      if(secs < 10) secs = `0${secs}`;
      return mins+':'+secs;
    };
    const whiteTime = document.getElementById('white-time');
    const blackTime = document.getElementById('black-time');
    if(this.turn % 2 == 0){
      whiteTime.textContent = formatTime(this.whiteTime);
      whiteTime.classList.add('selected');
      blackTime.classList.remove('selected');
      this.whiteTime--;
    } else{
      blackTime.textContent = formatTime(this.blackTime);
      blackTime.classList.add('selected');
      whiteTime.classList.remove('selected');
      this.blackTime--;
    }
    this.getGameState();
  }

  //create 8 x 8 chessboard
  createGrid(){
    const { cells, html } = this;
    for(let i = 1; i <= 8; i++){
      cells.push([]);
      for(let j = 1; j <= 8; j++){
        const cell = document.createElement('div');
        const isDarkTile = (i+j) % 2 == 0;
        cell.style.gridRow = `${i} / ${i+1}`;
        cell.style.gridColumn = `${j} / ${j+1}`;
        cell.classList.add(isDarkTile? 'dark-tile' : 'light-tile');
        cell.classList.add('tile');

        const notch = document.createElement('div');
        notch.classList.add('notch');
        notch.classList.add('hidden');
        if(j === 8){
          const rowMarker = document.createElement('div');
          rowMarker.classList.add('marker');
          rowMarker.classList.add('row-marker');
          rowMarker.textContent = i;
          cell.appendChild(rowMarker);
        }
        if(i === 8){
          const colMarker = document.createElement('div');
          colMarker.classList.add('marker');
          colMarker.classList.add('col-marker');
          colMarker.textContent = String.fromCharCode(64 + j).toLowerCase();
          cell.appendChild(colMarker);
        }

        const captureNotch = document.createElement('div');
        captureNotch.classList.add('capture-notch');
        
        cell.appendChild(captureNotch);
        cell.appendChild(notch);
        html.appendChild(cell);
        cells.at(-1).push(new Cell(i-1, j-1, cell, notch, captureNotch));
      }
    }
    // when cell is clicked select, move, or deselect piece
    for(const cell of this.getCells()){
      cell.cellHtml.addEventListener('mousedown', e => {
        this.hideAllNotches();
        if(this.selectedPiece){
          this.selectedPiece.clearAttackPaths();
          this.selectedPiece.getSpaces();
          for(const path of this.selectedPiece.attackPaths){
            if(path.cells.includes(cell)){
              this.selectedPiece.move(cell);
              this.turn++;
              this.getGameState();
              this.selectedPiece = null;
              console.log('moved the piece');
              return;
            }
          }
        }
        const color = this.turn % 2 == 0? 'white' : 'black';
        if(cell.chessPiece && cell.chessPiece.color != color) return;
        this.selectedPiece = cell.chessPiece;

        if(!this.selectedPiece) return;
        this.selectedPiece.clearAttackPaths();
        this.selectedPiece.getSpaces();
        this.selectedPiece.displayAttackPaths();                                                                         
      });
    }
  }
  createPieces(){
    const { cells, whitePieces, blackPieces } = this;

    Draggable.cells = this.getCells();
    for(const cell of Draggable.cells)
      Draggable.rects.push(cell.cellHtml.getBoundingClientRect());
    document.addEventListener('scroll', e => {
      Draggable.rects = [];
      for(const cell of this.getCells())
        Draggable.rects.push(cell.cellHtml.getBoundingClientRect());
    });
    const addPiece = (piece) => {
      const { row, col } = piece;
      cells[row][col].chessPiece = piece;
      cells[row][col].cellHtml.appendChild(piece.html);
      
      piece.makeDraggable(this.html);
      piece.color == "white"? whitePieces.push(piece) : blackPieces.push(piece);
    }

    //kings
    this.whiteKing = new King("white", 0, 4);
    this.blackKing = new King("black", 7, 4);
    addPiece(this.whiteKing);
    addPiece(this.blackKing);
    
    //pawns
    for(let i = 0; i < 8; i++){
      addPiece(new Pawn("black", cells.length-2, i));
      addPiece(new Pawn("white", 1, i))
    }
    // //rooks
    addPiece(new Rook("white", 0, 0));
    addPiece(new Rook("white", 0, 7));
    addPiece(new Rook("black", 7, 0));
    addPiece(new Rook("black", 7, 7));

    // //bishops
    addPiece(new Bishop("white", 0, 2));
    addPiece(new Bishop("white", 0, 5));
    addPiece(new Bishop("black", 7, 2));
    addPiece(new Bishop("black", 7, 5));

    //knights
    addPiece(new Knight("white", 0, 1));
    addPiece(new Knight("white", 0, 6));
    addPiece(new Knight("black", 7, 1));
    addPiece(new Knight("black", 7, 6));
    
    //queens
    addPiece(new Queen("white", 0, 3));
    addPiece(new Queen("black", 7, 3));
  }

  removePiece(piece){
    const { whitePieces, blackPieces } = this;
    piece.html.remove();
    if(piece.color == "white")
      whitePieces.splice(whitePieces.indexOf(piece), 1);
    else
      blackPieces.splice(blackPieces.indexOf(piece), 1);
  }
  
  getCheckmate(){
    const color = this.turn % 2 == 0? 'white' : 'black';
    const king = this[color+'King'];
    const check = king.getCheck();
    if(!check) return false;
    const checkPath = check.attackPaths.filter(p => p.isCheckPath)[0];
    king.clearAttackPaths()
    king.getSpaces();
    for(const path of king.attackPaths){
      if(path.cells.length > 0){
        return false;
      }
    }
    
    for(const piece of this[color+'Pieces']){
      for(const path of piece.attackPaths){
        for(const cell of checkPath.cells){
          if(path.cells.includes(cell)){
            return false;
          }
        }
      }
    }
    return true;
  }
  getStalemate(){
    const color = this.turn % 2 == 0? 'white' : 'black';
    const pieces = color == 'white'? this.whitePieces : this.blackPieces;

    let moveablePieces = [];
    for(const piece of pieces){
      piece.clearAttackPaths();
      piece.getSpaces();
    
      moveablePieces.push(
        piece.attackPaths.filter(path => path.cells.length > 0).length > 0
      );
    }
    console.log(color+' moveable pieces: '+moveablePieces.filter(p => p).length);
    return moveablePieces.filter(p => p).length == 0;
  }
  getInsufficientMaterial(){
    const whiteBishop = this.whitePieces.filter(p => p.piece == 'bishop').length > 0;
    const whiteKnight = this.whitePieces.filter(p => p.piece == 'knight').length > 0;
    const blackBishop = this.blackPieces.filter(p => p.piece == 'bishop').length > 0;
    const blackKnight = this.blackPieces.filter(p => p.piece == 'knight').length > 0;
    const blackLen = this.blackPieces.length;
    const whiteLen = this.whitePieces.length;
    
    // king v. king
    if(whiteLen == 1 && blackLen == 1) return true;
    //king and (bishop or knight) v. king
    if(whiteLen == 2 && blackLen == 1 && (whiteBishop || whiteKnight))
      return true;
    if(blackLen == 2 && whiteLen == 1 && (blackBishop || blackKnight))
      return true;
    
    return false;
  }
  getTimeout(){
    if(this.whiteTime < 0){
      return 'Black';
    }
    if(this.blackTime < 0){
      return 'White';
    }
    return null;
  }
  getGameState(){
    let color = this.turn % 2 == 0? 'white' : 'black';
    for(const piece of this.whitePieces){
      piece.clearAttackPaths();
      piece.getSpaces(false);
    }
    for(const piece of this.blackPieces){
      piece.clearAttackPaths();
      piece.getSpaces(false);
    }
    const gameInfo = document.getElementById('game-info');
    const gameOverConditions = [
      'checkmate', 'stalemate', 'insufficient material', 'timeout'
    ];
    gameInfo.textContent = 'It is '+color.toUpperCase()+'\'s turn';
    if(this.whiteKing.getCheck())
      gameInfo.textContent = 'White is in check';
    else if(this.blackKing.getCheck())
      gameInfo.textContent = 'Black is in check';
    if(gameOverConditions.includes(this.gameState.toLowerCase())) return;

    color = this.turn % 2 == 0? 'black' : 'white';
    if(this.getCheckmate()){
      this.gameState = "checkmate";
      gameInfo.textContent = `${color.toUpperCase()} WINS!`;
      alert(color.toUpperCase()+' WINS!');
      return;
    }
    if(this.getStalemate()){
      this.gameState = "stalemate";
      gameInfo.textContent = "STALEMATE";
      alert("Stalemate!");
      return;
    }
    if(this.getInsufficientMaterial()){
      gameInfo.textContent = "INSUFFICIENT MATERIAL";
      this.gameState = "insufficient material";
      alert("Insufficient Material!");
      return;
    }
    const timeout = this.getTimeout();
    
    if(timeout){
      gameInfo.textContent = timeout+" Wins by Timeout";
      this.gameState = 'timeout';
      alert(timeout+" Wins by Timeout");
      return;
    }
  }

  getCells(){
    const arr = [];
    for(const row of this.cells){
      for(const cell of row)
        arr.push(cell)
    }
    return arr;
  }
}

class Cell {
  static board = null;
  constructor(row, col, cellHtml, notchHtml, captureNotchHtml) {
    this.row = row;
    this.col = col;
    this.cellHtml = cellHtml;
    this.notchHtml = notchHtml;
    this.captureNotchHtml = captureNotchHtml;
    this.chessPiece = null;
  }
}
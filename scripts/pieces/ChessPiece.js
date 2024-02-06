import Draggable from '../Draggable.js';

export default class ChessPiece {
  static board = null;
  static createAttackPath(movementOnly=false, isCheckPath=false) {
    class AttackPath{
      constructor(movementOnly=false, isCheckPath=false){
        this.movementOnly = movementOnly;
        this.cells = [];
        this.isCheckPath = isCheckPath;
      }
    }
    return new AttackPath(movementOnly, isCheckPath);
  }
  constructor(color="white", row=0, col=0, piece="pawn"){
    this.color = color;
    this.dir = color.toLowerCase() === "white"? 1 : -1;
    this.points = 0;
    this.row = row;
    this.col = col;
    this.firstMove = true;
    this.attackPaths = [];
    this.protectedCells = [];
    this.piece = piece.toLowerCase();
    this.html = this.createHTML();
    this.drag = null;
  }
  makeDraggable(bounds=null){
    this.drag = new Draggable(this.html, bounds);
    this.drag.ondragstart = () => {
      console.log('drag start');
    };
    //while dragging - highlight hovered over cell
    this.drag.ondrag = () => {
      const cell = this.drag.getCollision();
      if(cell)
        cell.cellHtml.style.boxShadow = '0 0 0 3px inset white';
    };
    //drag end - snap to nearest cell
    this.drag.ondragend = () => {
      const collision = this.drag.getCollision();
      this.html.style.left = '0';
      this.html.style.top = '0';

      const board = ChessPiece.board;
      if(collision && board.selectedPiece){
        board.selectedPiece.clearAttackPaths();
        board.selectedPiece.getSpaces();
        for(const path of board.selectedPiece.attackPaths){
          if(path.cells.includes(collision)){
            board.selectedPiece.move(collision);
            board.turn++;
            board.getGameState();
            board.selectedPiece = null;
          }
        }
      }
    }
  }
  createHTML(){
    const html = document.createElement('div');
    html.classList.add('chess-piece');
    html.classList.add(this.color === "white"? 'light-chess-piece' : 'dark-chess-piece');

    const img = document.createElement('img');
    img.alt = this.piece.toUpperCase();
    const folder = 'images/chess-pieces/';
    const colorChar = this.color.charAt(0).toLowerCase();
    const pieceChar = this.piece == 'knight'? 'N' : this.piece.charAt(0).toUpperCase();
    img.src = folder+colorChar+pieceChar+'.svg';
    switch(this.piece){
      case "pawn": this.points = 1; break;
      case "rook": this.points = 5; break;
      case "queen": this.points = 9; break;
      case "king": this.points = 0; break;
      case "knight":
      case "bishop":
        this.points = 3;
        break;
      default:
        console.log("That ain't a piece, buddy!");
        break;
    }
    html.appendChild(img);
    return html;
  }

  getCell(row, col){
    const isRow = row >= 0 && row < ChessPiece.board.cells.length;
    const isCol = col >= 0 && col < ChessPiece.board.cells[0].length;
    if(isRow && isCol)
      return ChessPiece.board.cells[row][col];
    else
      return null;
  }
  
  move(cell){
    const currentCell = ChessPiece.board.cells[this.row][this.col];
    currentCell.chessPiece = null;
    
    if(this.firstMove) this.firstMove = false;
    this.row = cell.row;
    this.col = cell.col;
    this.html.remove();
    cell.cellHtml.appendChild(this.html);
    if(cell.chessPiece){
      ChessPiece.board.removePiece(cell.chessPiece);
    }
    cell.chessPiece = this;
    ChessPiece.board.hideAllNotches();
  }
  
  // check if king is in check if piece is moved to cell
  pseudoCheck(cell){
    const currentCell = ChessPiece.board.cells[this.row][this.col];
    currentCell.chessPiece = null;
    const oldPiece = cell.chessPiece;
    const oldRow = this.row;
    const oldCol = this.col;
    let inCheck = false;
    this.row = cell.row;
    this.col = cell.col;

    if(oldPiece?.color == 'white')
      ChessPiece.board.whitePieces.splice(
        ChessPiece.board.whitePieces.indexOf(oldPiece), 1
      );
    else if(oldPiece?.color == 'black')
      ChessPiece.board.blackPieces.splice(
        ChessPiece.board.blackPieces.indexOf(oldPiece), 1
      );

    cell.chessPiece = this;
    if(this.getKing().getCheck())
      inCheck = true;

    if(oldPiece?.color == 'white')
      ChessPiece.board.whitePieces.push(oldPiece);
    else if(oldPiece?.color == 'black')
      ChessPiece.board.blackPieces.push(oldPiece);

    cell.chessPiece = oldPiece;
    this.row = oldRow;
    this.col = oldCol;
    currentCell.chessPiece = this;
    if(oldPiece) 
      cell.cellHtml.appendChild(oldPiece.html);
    return inCheck;
  }

  removeIllegalMoves(){
    for(const path of this.attackPaths){
      for(let i = 0; i < path.cells.length; i++){
        const cell = path.cells[i];
        if(this.pseudoCheck(cell)){
          path.cells.splice(path.cells.indexOf(cell), 1);
          i--;
        }
      }
    }
  }
  
  getKing(){
    if(this.piece == 'king')
      return this;
    return this.color === 'white'? ChessPiece.board?.whiteKing : ChessPiece.board?.blackKing;
  }

  clearAttackPaths(){
    this.attackPaths = [];
    this.protectedCells = [];
  }

  displayAttackPaths(){
    const { attackPaths } = this;
    for(const path of attackPaths){
      for(const cell of path.cells){ 
        if(!cell.chessPiece)
          cell.notchHtml.classList.remove('hidden');
        else
          cell.captureNotchHtml.classList.remove('hidden');
      }
    }
  }
  
  getAttackPath = (xIncrementor=1, yIncrementor=1, iterations=1,step=1) => {
    const { row, col, attackPaths, getCell } = this;
    const newAttackPath = ChessPiece.createAttackPath();
    let cell;
    let iterationCount = 0;
    let x = row + xIncrementor, y = col + yIncrementor;

    do {
      cell = getCell(x, y);
      if(cell && (cell.chessPiece == null || cell.chessPiece.color != this.color))
        newAttackPath.cells.push(cell);
      if(cell && cell.chessPiece != null && cell.chessPiece.color == this.color)
        this.protectedCells.push(cell);
      if(!cell || cell.chessPiece != null){ 
        if(cell && cell.chessPiece != null && 
           cell.chessPiece.color != this.color &&
           cell.chessPiece.piece == 'king'){
            newAttackPath.isCheckPath = true;
        }
        break;
      }
      x += xIncrementor * step;
      y += yIncrementor * step;
      iterationCount++;
    } while (cell && iterationCount < iterations);
    attackPaths.push(newAttackPath);
  }
}
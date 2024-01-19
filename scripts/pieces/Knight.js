import ChessPiece from './ChessPiece.js';

export default class Knight extends ChessPiece {
  constructor(color, x, y){
    super(color, x, y, "Knight");
  }
  getAttackPath = (xShift, yShift) => {
    const { row, col, attackPaths, getCell } = this;
    const isEnemyKing = (cell) => {
       return (cell && cell.chessPiece != null && 
           cell.chessPiece.color != this.color &&
           cell.chessPiece.piece == "king");
    };
    const x = row + xShift, y = col + yShift;
    const newAttackPath = ChessPiece.createAttackPath();
    let cell;

    //top or bottom of l shape
    cell = getCell(x, y+yShift);
    if(cell && (cell.chessPiece == null || cell.chessPiece.color != this.color))
      newAttackPath.cells.push(cell);
    if(isEnemyKing(cell))
      newAttackPath.isCheckPath = true;
    
    //left or right of l shape
    cell = getCell(x+xShift, y);
    if(cell && (cell.chessPiece == null || cell.chessPiece.color != this.color))
      newAttackPath.cells.push(cell);
    if(isEnemyKing(cell))
      newAttackPath.isCheckPath = true;
    
    attackPaths.push(newAttackPath);
  }
  getSpaces(getKing=true){
    const { getAttackPath } = this;
    let king = null;
    let check = null;
    if(getKing){
      king = this.getKing();
      check = king.getCheck();
    }
    
    getAttackPath(1, 1);
    getAttackPath(1, -1);
    getAttackPath(-1, 1);
    getAttackPath(-1, -1);

    if(!getKing) return;
    this.removeIllegalMoves();
    if(!check) return;
    this.handleCheck(check);
  }
}
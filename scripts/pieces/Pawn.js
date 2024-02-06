import ChessPiece from './ChessPiece.js';

export default class Pawn extends ChessPiece {
  constructor(color, row, col){
    super(color, row, col, "Pawn");
    this.enPassant = false;
    this.getMovementPath = (checkPath) => {
      const { row, col, dir, attackPaths, getCell, firstMove } = this;
      const attackPath = ChessPiece.createAttackPath();
      attackPath.movementOnly = true;
      let cell = getCell(row+dir, col);
      if(cell && cell.chessPiece == null){
        attackPath.cells.push(cell);
        cell = getCell(row+dir*2, col);
        if(firstMove && cell && cell.chessPiece == null && (!checkPath || checkPath.cells.includes(cell))){
          attackPath.cells.push(cell);
        }
      }
      attackPaths.push(attackPath);
    };
  }

  //gets all available spots for any movement
  getSpaces(getKing=true){
    const {row, col, dir, getCell, attackPaths, getMovementPath} = this;
    let king = null;
    let check = null;
    if(getKing){
      king = this.getKing();
      check = king.getCheck();
    }
    getMovementPath(check?.attackPaths.filter(p => {return p.isCheckPath})[0]);

    
    //left and right attack cells
    let cell = getCell(row+dir, col+1);
    if(cell && cell.chessPiece && cell.chessPiece.color !== this.color){
      const attackPath = ChessPiece.createAttackPath();
      attackPath.cells.push(cell);
      attackPaths.push(attackPath);
    }

    cell = getCell(row+dir, col-1);
    if(cell && cell.chessPiece && cell.chessPiece.color !== this.color){
      const attackPath = ChessPiece.createAttackPath();
      attackPath.cells.push(cell);
      attackPaths.push(attackPath);
    }
    
    if(!getKing) return;
    this.removeIllegalMoves();
  }
}
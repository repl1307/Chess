import ChessPiece from './ChessPiece.js';

export default class Bishop extends ChessPiece {
  constructor(color, x, y){
    super(color, x, y, "Bishop");
  }
  getSpaces(getKing=true){
    const { getAttackPath } = this;
    let king = null;
    let check = null;
    if(getKing){
      king = this.getKing();
      check = king.getCheck();
    }
    
    getAttackPath(1, 1, 8);
    getAttackPath(1, -1, 8);
    getAttackPath(-1, 1, 8);
    getAttackPath(-1, -1, 8);

    if(!getKing) return;
    this.removeIllegalMoves();
    if(!check) return;
    this.handleCheck(check);
  }
}
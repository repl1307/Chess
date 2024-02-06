import ChessPiece from './ChessPiece.js';

export default class Queen extends ChessPiece {
  constructor(color, x, y){
    super(color, x, y, "Queen");
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
    getAttackPath(0, 1, 8);
    getAttackPath(0, -1, 8);
    getAttackPath(1, 0, 8);
    getAttackPath(-1, 0, 8);

    if(!getKing) return;
    this.removeIllegalMoves();
  }
}
import ChessPiece from './ChessPiece.js';

export default class King extends ChessPiece {
  constructor(color, x, y){
    super(color, x, y, "King");
  }
  
  getSpaces(getKing=true){
    const { getAttackPath } = this;

    getAttackPath(1, 1);
    getAttackPath(1, -1);
    getAttackPath(-1, 1);
    getAttackPath(-1, -1);
    getAttackPath(0, 1);
    getAttackPath(0, -1);
    getAttackPath(1, 0);
    getAttackPath(-1, 0);
    
    if(!getKing) return;
    this.removeIllegalMoves();
  }

  //returns null or piece that is causing check
  getCheck(){
    const { row, col, getCell } = this;
    const oppositePieces = this.color == 'white'? ChessPiece.board.blackPieces : ChessPiece.board.whitePieces;
    const cell = getCell(row, col);
    for(const p of oppositePieces){
      p.clearAttackPaths();
      p.getSpaces(false);
      for(const path of p.attackPaths){
        path.isCheckPath = false;
        if(path.cells.includes(cell)){
            path.isCheckPath = true;
            return p;
        }
      }
    }
    return null;
  }
}
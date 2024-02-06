export default class Draggable {
  static cells = [];
  static rects = [];
  constructor(elem, boundingElement = null) {
    this.elem = elem;
    this.boundingElem = boundingElement;
    this.isDragging = false;
    this.ondragstart = null;
    this.ondrag = null;
    this.ondragend = null;
    this.offset = this.getOffset();
    this.pos = this.convertPos(this.offset.x, this.offset)

    
    elem.addEventListener('mousedown', e =>  {
      e.preventDefault();
      this.isDragging = true;
      this.elem.style.zIndex = '5';
      this.elem.parentNode.classList.add('drag-start-tile');
      if(this.ondragstart)
        this.ondragstart();
    });
    const moveEvents = ['mousemove', 'touchmove']
    for(const event of moveEvents){
      document.addEventListener(event, e => {
        if(this.isDragging) {
          this.offset = this.getOffset();
          const pos = this.convertPos(e.clientX, e.clientY);
          this.setPosition(pos);
          if(this.ondrag)
            this.ondrag();
        }
      });
    }
    
    document.addEventListener('touchmove', e => {
      if(this.isDragging) {
        this.offset = this.getOffset();
        const pos = this.convertPos(e.clientX, e.clientY);
        this.setPosition(pos);
        if(this.ondrag)
          this.ondrag();
      }
    });
    
    document.addEventListener('mouseup', e => {
      if(this.elem.parentNode)
        this.elem.parentNode.classList.remove('drag-start-tile');
      if(this.isDragging && this.ondragend) this.ondragend();
      this.isDragging = false;
      this.elem.style.zIndex = '1';
    });
  }

  // convert mouse coordinate to local coordinate
  convertPos(x, y) {
    const rect = this.elem.getBoundingClientRect();

    x += window.pageXOffset;
    y += window.pageYOffset;
    
    return {
      x: x - this.offset.x - rect.width/2,
      y: y - this.offset.y - rect.height/2
    };
  }

  // get offset
  getOffset(){
    const parentRect = this.elem.parentNode.getBoundingClientRect();
    const x = parentRect.left + window.pageXOffset;
    const y = parentRect.top + window.pageYOffset;

    return {x, y};
  }

  //set element position
  setPosition({x, y}){
    this.elem.style.left = x + 'px';
    this.elem.style.top = y + 'px';
    
    if(this.boundingElem){
      const rect = this.elem.getBoundingClientRect();
      const bounds = this.boundingElem.getBoundingClientRect();
      const topLeft = this.convertPos(bounds.x, bounds.y);
      const bottomRight = this.convertPos(
        bounds.x + bounds.width, 
        bounds.y + bounds.height
      );
      const x = rect.x + rect.width/2;
      const y = rect.y + rect.height/2;
      console.log(rect.x+' '+bounds.x)
      if(x < bounds.x)
        this.elem.style.left = topLeft.x + 'px';
      if(x > bounds.x + bounds.width)
        this.elem.style.left = bottomRight.x + 'px';
      if(y < bounds.y)
        this.elem.style.top = topLeft.y + 'px';
      if(y > bounds.y + bounds.height)
        this.elem.style.top = bottomRight.y + 'px';
    }
  }

  //get collisions betweeen element and cell on board
  getCollision = () => {
    const rect = this.elem.getBoundingClientRect();
    const rects = Draggable.rects;
    const cells = Draggable.cells;
    const x = rect.x + rect.width/2;
    const y = rect.y + rect.height/2;
    const isColliding = (rect2) => {
      return (
        x < rect2.x + rect2.width && 
        x > rect2.x &&
        y < rect2.y + rect2.height &&
        y > rect2.y
      );
    };

    let returnVal = null
    for(const r of rects){
      const cell = cells[rects.indexOf(r)];
      cell.cellHtml.style.boxShadow = '';
      if(isColliding(r))
        returnVal = cell;
    }
    return returnVal;
  };
}
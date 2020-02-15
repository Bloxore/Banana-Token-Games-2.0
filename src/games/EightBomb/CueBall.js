import { Ball } from './Ball.js';

class CueBall extends Ball {
  constructor(scene, x, y) {
    super(scene, x, y);

    /* Radius of maximum shot speed */
    this._powerRange = 150;
    this._dash = new DashedLine(this.scene, this.x, this.y);
    this.scene.add.existing(this._dash);
    this._dash.setActive(false).setVisible(false);
    this._sunkBalls = [];
    this._currentBallType = null;

    this.depth = 3;
    this.setFrame(1);
    this.setInteractive();
    this.scene.input.setDraggable(this);

    this.on('dragstart', this.dragBegin);
    this.on('dragend', this.dragEnd);
    this.on('drag', this.drag)

    this._power = 0;
    this._rad = 0;
    this._readyFlag = false;
    this._enableFlag = false;
  }

  addBallToScore(ball) {
    this._sunkBalls.push(ball);
    if (this._currentBallType == null) {
      this._currentBallType = ball.type;
    }
  }

  isCueBall() {
    return true;
  }

  dragBegin(pointer, x, y) {
    if (this._enableFlag == false)
      return null;

    this._dash.setActive(true).setVisible(true);

    this.drag(pointer, this.x, this.y);
  }

  drag(pointer, x, y) {
    if (this._enableFlag == false)
      return null;

    this._dash.x = this.x;
    this._dash.y = this.y;
    this._dash.setAngle(360*Math.atan2(this.y - y, this.x - x)/(2*Math.PI))

    let dist = Math.hypot(y - this.y, this.x - x);
    if (dist > this._powerRange) {
      dist = this._powerRange;
    }
    // Dynamically adjust the power dash to show power of hit
    this._dash.setLength(this._dash.MAXIMUMLENGTH * (dist / this._powerRange))
  }

  dragEnd(pointer, x, y) {
    if (this._enableFlag == false)
      return null;

    /* Deactivate the dash */
    this._dash.setActive(false).setVisible(false);

    /* For calculating power */
    let dist = Math.hypot(pointer.upY - this.y, this.x - pointer.upX);
    if (dist > this._powerRange) {
      dist = this._powerRange;
    }

    this._storeShot(Math.atan2(pointer.upY - this.y, this.x - pointer.upX), dist / this._powerRange);
  }

  _storeShot(rad, pow) {
    this._rad = rad;
    this._power = pow;
    this._readyFlag = true;
    this.disableFiring();
  }

  isReady() {
    return this._readyFlag;
  }

  enableFiring() {
    this._enableFlag = true;
  }

  disableFiring() {
    this._enableFlag = false;
    /* Deactivate the dash */
    this._dash.setActive(false).setVisible(false);
  }

  activateFire() {
    this.fireAtAngle(this._rad, this._power);
    this._readyFlag = false;
    this._rad = 0;
    this._power = 0;
  }
}

class DashedLine extends Phaser.GameObjects.Graphics {
  constructor(scene, x, y) {
    super(scene);

    this.MAXIMUMLENGTH = 150;

    this.x = x;
    this.y = y;

    this.depth = 2;

    this._dashLength = 10;
    this._spacing = 5;
    this._length = this.MAXIMUMLENGTH;

    this._dashes = [];
    for (let i = 0; i < Math.floor(this._dashLength + this._spacing / this._length); i++) {
      this._dashes.push(i*this._dashLength + i*this._spacing - this._dashLength);
    }
  }

  setLength(len) {
    this._length = len;
  }

  preUpdate() {
    //This is probably very slow
    this.clear();
    this.lineStyle(5, 0xFF0000, 1.0);
    this.beginPath();
    if (this._dashes[0] == this._spacing) {
      this._dashes.unshift(-this._dashLength);
    }
    for (let i = 0; i < this._dashes.length; i++) {
      //Represent left and right points of dash to check if it needs to be masked
      let x1 = this._dashes[i];
      let x2 = this._dashes[i] + this._dashLength;
      if (x1 < 0) { x1 = 0; }
      if (x1 > this._length) {x1 = this._length;}
      if (x2 > this._length) {x2 = this._length;}

      // Dash is off the line, pop it
      if (x1 >= this.MAXIMUMLENGTH) {this._dashes.pop();}

      this.moveTo(x1, 0);
      this.lineTo(x2, 0)
      this._dashes[i] += 1;
    }
    this.closePath();
    this.strokePath();
  }
}

export { CueBall };

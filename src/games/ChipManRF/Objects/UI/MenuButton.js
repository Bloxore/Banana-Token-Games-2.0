export class MenuButton extends Phaser.GameObjects.Group {
  constructor(scene, x, y) {
    super(scene);

    // Top left position of the whole group
    this.x = x;
    this.y = y;
    this.scaleX = 1;
    this.scaleY = 1;

    // First the border
    this._buttonProp = {
      x: 0,
      y: 0,
      scaleX: .5,
      scaleY: .5
    }
    this.buttonImg = this.scene.add.image(
      this.x + this._buttonProp.x,
      this.y + this._buttonProp.y,
      "menuButton"
    );
    this.buttonImg.setDepth(1);
    this.buttonImg.setInteractive();
    this.add(this.buttonImg, false);

    // Mask for cool effects
    this._buttonMaskProp = {
      x: 0,
      y: 0,
      scaleX: .51,
      scaleY: .51
    }

    this.buttonMaskImg = this.scene.add.image(
      this.x + this._buttonMaskProp.x,
      this.y + this._buttonMaskProp.y,
      "menuButtonMask"
    );
    this.buttonMaskImg.setDepth(0);
    this.buttonMaskImg.setAlpha(.5);
    this.add(this.buttonMaskImg, false);

    // Text

    // Shader
    let shader = `
    precision mediump float;

    uniform mat4
    `
  }

  preUpdate() {
    // Update the graphics to match the position of the group
    // Main button
    this.buttonImg.setPosition(
      this.x + this._buttonProp.x,
      this.y + this._buttonProp.y
    );
    this.buttonImg.setScale(
      this.scaleX * this._buttonProp.scaleX,
      this.scaleY * this._buttonProp.scaleY
    )
    // Mask
    this.buttonMaskImg.setPosition(
      this.x + this._buttonMaskProp.x,
      this.y + this._buttonMaskProp.y
    )
    this.buttonMaskImg.setScale(
      this.scaleX * this._buttonMaskProp.scaleX,
      this.scaleY * this._buttonMaskProp.scaleY
    )
  }

  on(e, func) {
    this.buttonImg.on(e, func);
  }

  setDepth(value) {
    this.depth = value;
    this.buttonMaskImg.setDepth(value);
    this.buttonImg.setDepth(value + 1);
  }

  setScale(scaleX, scaleY) {
    this.scaleX = scaleX;
    this.scaleY = scaleY;
  }

}

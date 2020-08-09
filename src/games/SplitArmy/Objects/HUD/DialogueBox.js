import { COLORS } from '../../Utility/Colors.js';
/*
  DialogueBox

  This class is reponsible for the duration of a SINGLE dialogue box,
  meaning that its sessions is over after it's last line is progressed and the box
  goes away. An event for this "end of life" is available

  This is part of the scripted events and thus should be invoked by
  them.
*/
export class DialogueBox extends Phaser.GameObjects.Group {
  constructor(scene) {
    super(scene);
    // "this" variables
    this._WIDTH = this.scene.cameras.main.displayWidth;
    this._HEIGHT = this.scene.cameras.main.displayHeight / 3;
    this._OPEN_Y_POSITION = this.scene.cameras.main.displayHeight - this._HEIGHT;
    this._CLOSE_Y_POSITION = this.scene.cameras.main.displayHeight;

    // Background sprite
    this.background = this.scene.make.graphics();
    this.background.fillStyle(COLORS.lightest);
    this.background.fillRect(
                        0,
                        0,
                        this._WIDTH,
                        this._HEIGHT
                      );
    // border (lookup the api documentation)
    let thickness = 10;
    this.background.lineStyle(thickness, COLORS.darkest);
    this.background.strokeRect(
                        thickness/2,
                        thickness/2,
                        this._WIDTH - thickness,
                        this._HEIGHT - thickness
                      );
    this.background.setScrollFactor(0);
    this.background.y = this._CLOSE_Y_POSITION;
    this.add(this.background, true);
  }

  /*
    The main text processing. Responsible for separating text and
    setting up effects.
  */
  beginSession(textToScroll) {
    this._openTween();
    // Once that's done
  }

  _openTween() {
    this.scene.add.tween({
      targets: this.background,
      y: "-=" + this._HEIGHT,
      duration: 500
    })
  }

  _closeTween() {
    this.scene.add.tween({
      targets: this.background,
      y: "+=" + this._HEIGHT,
      duration: 500
    })
  }
}

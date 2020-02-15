import { Background, BACKGROUND_TYPES } from './Background.js';
/*
  The purpose of this state is to test stuff.
  Nuff said
*/
export class DebugState extends Phaser.Scene {
  constructor() {
    super({
      key: "DebugState"
    });
  }
  preload() {

  }

  create() {
    /* Basically just for the gifs */
    let descriptorText = this.add.bitmapText(0, 0, "mainFont", "Debug Mode", 12);
    descriptorText.setTintFill(0xddbbbb);
    descriptorText.setOrigin(1);
    descriptorText.x = this.game.canvas.width - 10;
    descriptorText.y = this.game.canvas.height - 10;
    descriptorText.depth = 20; // on top of everything
    descriptorText.setScrollFactor(0);
    let descriptorShadowText = this.add.bitmapText(0, 0, "mainFont", "Debug Mode", 12);
    descriptorShadowText.setTintFill(0x606000);
    descriptorShadowText.setOrigin(1);
    descriptorShadowText.x = this.game.canvas.width - 8;
    descriptorShadowText.y = this.game.canvas.height - 8;
    descriptorShadowText.depth = 19; // on top of everything
    descriptorShadowText.setScrollFactor(0);

    /*
      ====
      DEBUG ZONE
      ====
    */
    let background = new Background(this, this.game.canvas.width, this.game.canvas.height);

    background.setLayer(0, BACKGROUND_TYPES.MOON, 0);
  }
}

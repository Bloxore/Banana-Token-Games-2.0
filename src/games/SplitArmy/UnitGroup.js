import { COLORS } from './Colors.js';
export class UnitGroup extends Phaser.GameObjects.Container {
  constructor(scene, map, numberOfUnits = 10, player = true) {
    super(scene);

    if (!map) {
      throw "You must initialize a UnitGroup with a map."
    }
    this.map = map;

    this.unitCount = numberOfUnits;
    this.actions = 3;

    // Unit Group Border
    let border = this.scene.make.graphics();
    border.lineStyle(2, COLORS.darkest, 1.0);
    border.beginPath();
    border.arc(16, 16, 14, 0, Math.PI*2);
    border.strokePath();
    this.add(border);

    // Action Counter
    let actionCircle = this.scene.make.graphics();
    actionCircle.fillStyle(COLORS.darkest, 1);
    actionCircle.fillCircle(5, 5, 5);
    this.add(actionCircle);

    // Action Text
    let actionText = this.scene.make.bitmapText({
      font: "mainFont",
      text: this.actions,
      size: 5
    });
    actionText.setTintFill(COLORS.lightest);
    actionText.setPosition(2.5, 2.5);
    this.add(actionText);
  }

  setTilePosition(tileX, tileY) {
    this.setPosition(tileX * this.map.getTileWidth(), tileY * this.map.getTileHeight());
  }

  tweenToTile(tileX, tileY) {
    this.scene.add.tween({
      targets: this,
      x: tileX * this.map.getTileWidth(),
      y: tileY * this.map.getTileHeight(),
      duration: 500
    })
  }
}

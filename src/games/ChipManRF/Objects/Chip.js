class Chip extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, "levelEntities");

    this.setOrigin(0, 1);
  }
}

export { Chip };

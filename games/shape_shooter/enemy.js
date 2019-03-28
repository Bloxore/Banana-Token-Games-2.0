class Enemy extends Phaser.GameObjects.Sprite {
  /*
    Very simple enemy. Moves down the screen slowly. Is destroyed in one hit
    by bullets.
  */
  constructor(scene, x, y) {
    super(scene, x, y, "assets", "blue1");

    // Add to scene visually and give physics body
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Move down screen slowly
    this.body.velocity.y = 100;
  }
}

export { Enemy };

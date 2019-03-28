
class Ship extends Phaser.GameObjects.Image {
    constructor(scene, x, y, asset_src, asset_key) {
      super(scene, x, y, asset_src, asset_key);
      this.horizontalSpeed = 400;

      //The ship is added to the scene (visual)
      scene.add.existing(this);
      //The ship is given a physics body
      scene.physics.add.existing(this);
    }

    moveLeft() {
      this.body.velocity.x = -this.horizontalSpeed;
    }

    moveRight() {
      this.body.velocity.x = this.horizontalSpeed;
    }
}

export { Ship };

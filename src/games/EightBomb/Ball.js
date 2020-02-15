class Ball extends Phaser.GameObjects.Sprite {
  /* Static class attributes */
  static get SOLID() {
    return 1;
  }

  static get STRIPES() {
    return 2;
  }

  constructor(scene, x, y) {
    super(scene, x, y, "cueball");
    this.shotSpeed = 1000;
    //Remember's the last cueball this ball was hit by
    this._lastHit = null;

    this.type = Ball.SOLID;

    this.scene.physics.add.existing(this);
    this.body.setCircle(16);
    this.body.useDamping = true;
    this.body.setDrag(.99, .99);
    this.body.setBounce(1);
    this.body.setMaxSpeed(1000);

    this.setScale(.5);
  }

  setShotSpeed(newSpeed) {
    this.shotSpeed = newSpeed;
  }

  changeType(newType) {
    if (newType == Ball.SOLID) {
      this.type = Ball.SOLID;
      this.setFrame(0);
    } else {
      this.type = Ball.STRIPES;
      this.setFrame(2);
    }
  }

  fireAtAngle(rad, power /* Should be a float between 0 and 1*/) {
    this.body.setVelocity(Math.cos(rad) * this.shotSpeed * power, -Math.sin(rad) * this.shotSpeed * power);
  }

  fallAndDestroy(targetX, targetY) {
    //Add this ball to the list of sunk balls for the cue ball that got it in
    if (this._lastHit != null) {
      this._lastHit.addBallToScore(this);
    }

    this.body.enable = false;
    anime({
      targets: this,
      scaleX: .75,
      scaleY: .75,
      x: targetX,
      y: targetY,
      easing: "linear",
      duration: 200,
      complete: () => {
        anime({
          targets: this,
          scaleX: .5,
          scaleY: .5,
          alpha: 0,
          duration: 200,
          easing: "linear",
          complete: () => {
            this.destroy(true);
          }
        });
      },
    })
  }

  isCueBall() {
    return false;
  }

  /* Pure animation */
  dropFromAbove() {
    this.body.enable = false;
    this.scaleX = 1;
    this.scaleY = 1;
    this.alpha = 0;
    anime({
      targets: this,
      scaleX: .5,
      scaleY: .5,
      alpha: 1,
      easing: "easeInCubic",
      duration: 200,
      complete: () => {
        anime({
          targets: this,
          scaleX: .70,
          scaleY: .70,
          easing: "easeOutCubic",
          duration: 160,
          complete: () => {
            anime({
              targets: this,
              scaleX: .5,
              scaleY: .5,
              easing: "easeInCubic",
              duration: 160,
              complete: () => {this.body.enable = true;} // Re-enable physics after animation
            });
          }
        });
      }
    });
  }
}

export { Ball };

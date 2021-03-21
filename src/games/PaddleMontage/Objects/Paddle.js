/*
  Model of a paddle in the game.
  No Graphics here, just the physics

  Never modify _type directly (things will surely go bad)
*/
export const HORIZONTAL = 1;
export const VERTICAL = 2;
export const PADDLELONGWAYSSIZE = 200;
export const PADDLESHORTWAYSSIZE = 50;

export class Paddle extends Phaser.GameObjects.Zone {
  constructor(scene, type, x, y) {

    // Size and position of the zone is irrelevant, so I won't bother with it
    super(scene, x, y);

    this.setOrigin(0,0);

    if (type) {
      this._type = type;
    } else {
      // Just a default
      this._type = HORIZONTAL;
    }

    // Enable Physics on this body
    this.scene.physics.add.existing(this, false);

    this._setPhysicsBounds();
  }

  _setPhysicsBounds() {
    if (this._type == HORIZONTAL) {
      this.body.setSize(PADDLELONGWAYSSIZE, PADDLESHORTWAYSSIZE, false);
    } else {
      // Vertical
      this.body.setSize(PADDLESHORTWAYSSIZE, PADDLELONGWAYSSIZE, false);
    }
  }

  /*
    Change the type of this paddle
  */
  setType(type) {
    this._type = type;
    this._setPhysicsBounds();
  }

  /*
    Returns the vector2 position of the physics body
  */
  getPosition() {
    return this.body.position;
  }

  /*
    Returns an object with the dimensions of the paddle (only necessary upon initialization)
  */
  getDimensions() {
    return {
      width: this.body.width,
      height: this.body.height
    };
  }
}

/*
  Some may ask, and rightfully so, why on earth does the
  background have it's own class?
  Well...

  The backgrounds in ChipMan are effectively split into 3
  parts:
  (0) Very near
  (1) Further
  (2) Very far away

  Not every background instance may use all three layers, but it can
  if it chooses.
*/
export class Background extends Phaser.GameObjects.GameObject {
  constructor(scene, width, height) {
    super(scene);

    if (!width || !height) {
      throw "A width and height are required for the background.";
    }

    this.width = width;
    this.height = height;

    // Only the indexes 0, 1, and 2 may be read and changed
    this.backgroundLayers = {
      0: null,
      1: null,
      2: null
    };
  }

  /*
    setLayer(int layer, BackgroundClass bg, int scrollFactor)

    Creates a new instance of whatever backgroundclass is passed
    and sets the passed layer to that bg.
  */
  setLayer(layer, bg, scrollFactor) {
    if (layer < 0 || layer > 2) {
      throw "Layer is out of range";
    }
    // Initialize the new background
    this.backgroundLayers[layer] = new bg(this.scene, this.width, this.height);
    this.backgroundLayers[layer].setDepth(layer);
  }
}

/*
  Base Background class for all backgrounds to inherit from
*/
class BaseBackground extends Phaser.GameObjects.GameObject {
  constructor(scene, width, height) {
    super(scene);

    this.width = width;
    this.height = height;
  }

  setDepth(depth) {

  }
}

/*
  The moon background places a white semi-circle at the bottom of
  the screen.

  Diameter is the passed width
*/
class MoonBackground extends BaseBackground {
  constructor(scene, width, height) {
    super(scene, width, height);

    // Static moon
    this.moon = this.scene.add.graphics();
    this.moon.fillStyle(0xffffff);
    this.moon.beginPath();
    this.moon.arc(0, 0, this.width / 2, 0, Math.PI, true);
    this.moon.fillPath();
    this.moon.x = this.width / 2;
    this.moon.y = this.height + 200;
    this.moon.setScale(2, 1);

    // Moon glow <learn shaders>

    // Moon dust particles
  }

  setDepth(depth) {
    this.moon.setDepth(depth);
  }
}

export let BACKGROUND_TYPES = {
  MOON: MoonBackground
};

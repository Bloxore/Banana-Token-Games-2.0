import { StarField, DISTRIBUTIONS } from './StarField.js';

/*
  Some may ask, and rightfully so, why on earth does the
  background have it's own class?
  Well...

  The backgrounds should be about 5 layers, thus I limited the number in this class

  Not every background instance may use all five layers, but it can
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

    this.depth = 0;

    // Only the indexes 0, 1, 2, 3, and 4 may be read and changed
    this.backgroundLayers = {
      0: null,
      1: null,
      2: null,
      3: null,
      4: null
    };
  }

  /*
    setLayer(int layer, BackgroundClass bg, int scrollFactor)

    Creates a new instance of whatever backgroundclass is passed
    and sets the passed layer to that bg.
  */
  setLayer(layer, bg, scrollFactor) {
    if (layer < 0 || layer > 4) {
      throw "Layer is out of range";
    }
    // Initialize the new background
    this.backgroundLayers[layer] = new bg(this.scene, this.width, this.height);
    this.backgroundLayers[layer].setDepth(this.depth + layer / 5); // depths are 0, .2, .4, .6, .8
  }

  /*
    Try to do this first
  */
  setDepth(depth) {
    this.depth = depth;

    let i;
    for (i = 0; i < 5; i++) {
      if (this.backgroundLayers[i] != null) {
          this.backgroundLayers[i].setDepth(depth + i/5);
      }
    }
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

    const MOON_RADIUS = 320; // Half of resolution width

    // Static moon
    this.moon = this.scene.add.graphics();
    this.moon.fillStyle(0xffffff);
    this.moon.beginPath();
    this.moon.arc(0, 0, MOON_RADIUS, 0, Math.PI, true);
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

class StarBackground extends BaseBackground {
  constructor(scene, width, height) {
    super(scene, width, height);

    // Generate a perdictable amount of stars based on stage size
    let numStars = Math.floor(width*height / 10000);

    // The star field
    this.starfield = new StarField(scene);
    this.starfield.generateField({
      bounds: new Phaser.Geom.Rectangle(0, 0, width, height),
      numStars: numStars,
      sizeRange: [.5, .6],
      randomSeed: "banana",
      distribution: DISTRIBUTIONS.POLY
    })

    scene.add.existing(this.starfield);
  }

  setDepth(depth) {
    // This is slow af (but whatevs)
    this.starfield.setDepth(depth);
  }
}

export let BACKGROUND_TYPES = {
  MOON: MoonBackground,
  STAR: StarBackground
};

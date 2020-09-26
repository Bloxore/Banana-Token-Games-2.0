export const DISTRIBUTIONS = {
  LINEAR: (x) => {return x;},
  EXPO: (x) => {return Math.pow(2, x) - 1;},
  POLY: (x) => {return Math.pow(x, 2);}
}

export class StarField extends Phaser.GameObjects.Group {
  constructor(scene) {
    super(scene);
    this.depth = 0;
    this.runChildUpdate = true;
  }

  /*
    Generates a star field
    Config:
      - int                       numStars
      - [int, int]                sizeRange
      - string                    <randomSeed> -> Defaults to Date.now()
      - func                      <distribution> -> Defaults to LINEAR (distribution of randomSize)
      - Phaser.Geom.Rectangle <bounds> -> Defaults to 0, 0, GAMEWIDTH, GAMEHEIGHT
  */
  generateField(config) {
    if (!config) {
        throw "StarField: No config given."
    }

    if (!config.numStars) {
      throw "StarField: Number of stars to generate not given.";
    }

    if (!config.sizeRange) {
      throw "StarField: Range of size of stars not given."
    }

    if (!config.bounds) {
      config.bounds = new Phaser.Geom.Rectangle(
        0,
        0,
        this.scene.game.config.width,
        this.scene.game.config.height
      );
    }

    if (!config.randomSeed) {
      config.randomSeed = Date.now().toString();
    }

    if (!config.distribution) {
      config.distribution = DISTRIBUTIONS.LINEAR;
    }

    let random = new Phaser.Math.RandomDataGenerator([config.randomSeed]);

    // Get some generating going!
    for (let i = 0; i < config.numStars; i++) {
      let x = random.integerInRange(config.bounds.left, config.bounds.right);
      let y = random.integerInRange(config.bounds.top, config.bounds.bottom);

      let star = this.scene.add.image(x, y, "star");
      this.add(star);

      let scale = config.distribution(random.frac())*(config.sizeRange[1] - config.sizeRange[0]) + config.sizeRange[0];
      star.setScale(scale);
      star.setDepth(this.depth);

      let offset = Phaser.Math.RND.integerInRange(0, 10000)

      let speed = Phaser.Math.RND.integerInRange(250, 500)

      star.setRotation(random.frac() * 2*Math.PI);

      let scrollFactor = Phaser.Math.RND.frac() * .1 + .05;
      star.setScrollFactor(scrollFactor);

      star.update = () => {
        // TODO: Make better star animation
        star.setScale(Math.abs(Math.sin((this.scene.time.now+offset)/speed)*(scale)));
      }
    }
  }

  /*
    Rather expensive after generation, reccomended to do beforehand
  */
  setDepth(depth) {
    this.depth = depth;
    this.propertyValueSet("depth", depth);
  }
}

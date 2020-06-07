class ArrowHUD extends Phaser.GameObjects.Image {
  constructor(scene, x, y, options) {

    let DEFAULT_CUT_PERCENT = 0.35;
    let DEFAULT_COLOR = 0xFFFF00;
    // Draw graphic here (pretty simple)
    // Bake into the cache so that in doesn't have to be drawn in future calls
    /*
      One way arrow graphics
      Options:
       - arrowWidth: Total pixel width
       - arrowHeight: Total pixel height
       - cutPercent: What percent of the width should it cut into an arrowhead
       - color: What color should the arrow be
    */
    // Load the options into local variables
    let arrowWidth;
    let arrowHeight;
    let cutPercent;
    let color;
    /* Options verification */
    if (options == undefined) {
      throw "You must specify options when initializing an ArrowHUD object.";
    }

    /* Width verification */
    if (options.arrowWidth != undefined) {
      if (options.arrowWidth > 0) {
        arrowWidth = options.arrowWidth;
      } else {
        throw "The arrowWidth option must be more than 0. Passed arrowWidth: " + arrowWidth;
      }
    } else {
      throw "You must specify an arrowWidth for an ArrowHUD object in the options parameter.";
    }

    /* Height verification */
    if (options.arrowHeight != undefined) {
      if (options.arrowHeight > 0) {
        arrowHeight = options.arrowHeight;
      } else {
        throw "The arrowHeight option must be more than 0. Passed arrowHeight: " + arrowHeight;
      }
    } else {
      throw "You must specify an arrowHeight for an ArrowHUD object in the options parameter.";
    }

    /* cutPercent verification */
    cutPercent = options.cutPercent != undefined ? options.cutPercent : DEFAULT_CUT_PERCENT;
    if (cutPercent < 0 || cutPercent > 1) {
      throw "The cutPercent option is not between 0 and 1. Passed cutPercent: " + cutPercent;
    }

    color = options.color != undefined ? options.color : DEFAULT_COLOR;

    // == Now that all options are set, either fetch the texture or create and save one ==
    // Keys are specific so that the wrong texture isn't used by accident
    let textureKey = "-ArrowHUD-" + color + "-" + arrowWidth + "-" + arrowHeight + "-" + cutPercent;
    if (scene.load.textureManager.exists(textureKey) == false) {
      ArrowHUD._generateArrowTexture(scene, color, arrowWidth, arrowHeight, cutPercent, textureKey);
    }

    // Finally complete the initialization of the image
    super(scene, x, y, textureKey);
  }

  static _generateArrowTexture(scene, color, arrowWidth, arrowHeight, cutPercent, textureKey) {
    let arrowGraphic = new Phaser.GameObjects.Graphics(scene);

    let flatWidth = arrowWidth * (1 - cutPercent);

    arrowGraphic.fillStyle(color);

    arrowGraphic.beginPath(); // Path out arrow
    arrowGraphic.moveTo(0,0);
    arrowGraphic.lineTo(flatWidth, 0);
    arrowGraphic.lineTo(arrowWidth, arrowHeight / 2);
    arrowGraphic.lineTo(flatWidth, arrowHeight);
    arrowGraphic.lineTo(0, arrowHeight);
    arrowGraphic.closePath();
    arrowGraphic.fill();

    // store the graphic to the cache for use later
    arrowGraphic.generateTexture(
      textureKey, // key
      arrowWidth, // width of graphic
      arrowHeight // height of graphic
    );

    arrowGraphic.destroy(); // free up them memories
  }
}

export { ArrowHUD };

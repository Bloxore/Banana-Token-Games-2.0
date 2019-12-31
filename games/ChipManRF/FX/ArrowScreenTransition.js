/*
  Taking some serious inspiration from Street Fighter Alpha 3's pre-battle
  transition.

  The arrows will come flying in from one side of the screen, run for a while
  and end on filling up the whole screen with a single color.
*/

/*
  This namespace will hold all necessary functions to apply an
  Arrow Screen Transition
*/
const ArrowScreenTransition = {
  // Direction consts
  // Vertical is odd, horizontal is even
  // Numbers indication how much arrow is rotated after being created.
  RIGHT: 0,
  DOWN: 1,
  LEFT: 2,
  UP: 3,
  // Default consts
  DEFAULT_DURATION: 5000, // in ms
  DEFAULT_Z_INDEX: 100,
  DEFAULT_COLOR: 0xFFFF00,
  DEFAULT_ARROW_THICKNESS: 200, // in px
  DEFAULT_GAP_WIDTH: 100, // in px
  DEFAULT_ARROW_DIRECTION: 0, // right
  DEFAULT_ARROW_SPEED: 1000,
  /*
    Applys the FX to the given scene.
    Config:
      scene: where to place the FX
      duration: how long to play the FX
      zIndex: where to place the FX in the given scene
      color: the color of the FX.
      arrowThickness: number of pixels arrows are in width
      gapWidth: the number of pixels between arrows +- 16px
      arrowDirection: which way should the arrow face and move in
      arrowSpeed: how fast should it move in that direction
  */
  apply: (config) => {
    // The config is mandatory. Enforce that.
    if (config == undefined)
      throw "ArrowScreenTransition: No configuration given."

    // The only mandatory part of config is the scene.
    let scene;
    if (config.scene) {
      scene = config.scene;
    } else {
      throw "ArrowScreenTransition: No scene in configuration.";
    }
    // Set the rest of the options accordingly
    let duration = config.duration != undefined ? config.duration : ArrowScreenTransition.DEFAULT_DURATION;
    let zIndex = config.zIndex != undefined ? config.zIndex : ArrowScreenTransition.DEFAULT_Z_INDEX;
    let color = config.color != undefined ? config.color : ArrowScreenTransition.DEFAULT_COLOR;
    let arrowThickness = config.arrowThickness != undefined ? config.arrowThickness : ArrowScreenTransition.DEFAULT_ARROW_THICKNESS;
    let gapWidth = config.gapWidth != undefined ? config.gapWidth : ArrowScreenTransition.DEFAULT_GAP_WIDTH;
    let arrowDirection = config.arrowDirection != undefined ? config.arrowDirection : ArrowScreenTransition.DEFAULT_ARROW_DIRECTION;
    let arrowSpeed = config.arrowSpeed != undefined ? config.arrowSpeed : ArrowScreenTransition.DEFAULT_ARROW_SPEED;

    // Get some important information
    let canvasWidth = scene.game.canvas.width;
    let canvasHeight = scene.game.canvas.height;

    let textureKey = "-ArrowScreenTransition-" + "-" + color + "-" + arrowThickness + "-" + arrowDirection;

    /* No need to generate a texture if it already exists in cache */
    if (scene.load.textureManager.exists(textureKey) == false) {
      // Generate the necessary arrow texture
      ArrowScreenTransition._generateArrowTexture(
        scene,
        canvasWidth,
        canvasHeight,
        arrowDirection,
        color,
        arrowThickness
      );
    }

    let arrowContainer = scene.add.container();

    arrowContainer.setScrollFactor(0, 0, true);
    arrowContainer.setDepth(zIndex);
    scene.physics.add.existing(arrowContainer); // make it so container can move

    // Set the velocities based on direction
    // Evens are horizontal
    arrowContainer.body.setVelocityX(arrowDirection % 2 == 0 ? (arrowDirection == ArrowScreenTransition.RIGHT ? arrowSpeed : -arrowSpeed) : 0);
    // Odds are vertical
    arrowContainer.body.setVelocityY(arrowDirection % 2 == 1 ? (arrowDirection == ArrowScreenTransition.DOWN ? arrowSpeed : -arrowSpeed) : 0);

    let recycledArrows = []; // Arrows that make it off screen go here to be recycled

    let _addArrowsFlag = true;
    // Make sure the transition doesn't go over time
    scene.time.addEvent({
      delay: duration,
      callback: () => {
        //prevent new arrows from being added
        _addArrowsFlag = false;
      }
    })

    /*
      Direction influences positions and angle
      RIGHT: 0
      UP: 1
      LEFT: 2
      DOWN: 3

      Thus position is calculated like so
      if (Vertical)
        startX = the middle
        startY = screenHeight/2 * (DIRECTION - 1)
      else
        startX = screenWidth/2 * DIRECTION
        startY = the middle
    */
    // Generate the start position for the arrows
    let startX = arrowDirection % 2 == 1 ? canvasWidth / 2 : (canvasWidth / 2) * arrowDirection + (arrowDirection == ArrowScreenTransition.RIGHT ? -arrowThickness : arrowThickness);
    let startY = arrowDirection % 2 == 1 ? (canvasHeight / 2) * (arrowDirection - 1) + (arrowDirection == ArrowScreenTransition.DOWN ? -arrowThickness : arrowThickness) : (canvasHeight / 2);

    // Recycle old arrows so new ones don't have to be created all the time.
    let _arrowRecycle = [];

    // A dummy gameObject to run a loop
    let _dummyUpdateLoop = new Phaser.GameObjects.GameObject(scene);
    _dummyUpdateLoop.preUpdate = () => { // my own private game loop *yay*
      let first = arrowContainer.getAt(0);
      let last = arrowContainer.getAt(arrowContainer.length - 1);

      if (_addArrowsFlag == true) {
        if (last) {
          // If the arrows are the correct distance apart add another
          let lastX = arrowContainer.x + last.x;
          let lastY = arrowContainer.y + last.y;

          let distance = Math.sqrt(Math.pow(startX - lastX, 2) + Math.pow(startY - lastY, 2));

          if (distance >= gapWidth + arrowThickness) {
            insertArrow();
          }
        } else {
          // The first arrow
          insertArrow();
        }
      }

      // If the first arrow has gone off screen recycle it
      if (first) {
        if ((arrowDirection == ArrowScreenTransition.LEFT && arrowContainer.x + first.x < -arrowThickness) ||
            (arrowDirection == ArrowScreenTransition.RIGHT && arrowContainer.x + first.x > canvasWidth + arrowThickness) ||
            (arrowDirection == ArrowScreenTransition.UP && arrowContainer.y + first.y < -arrowThickness) ||
            (arrowDirection == ArrowScreenTransition.DOWN && arrowContainer.y + first.y > canvasHeight + arrowThickness)) {
              arrowContainer.remove(first);
              _arrowRecycle.push(first);
        }

        // If the arrowContainer is empty and _addArrowsFlag is false cleanUp
        if (arrowContainer.length == 0 && _addArrowsFlag == false) {
          // Will completely obliterate this instance of arrow transition
          cleanUp();
        }
      }
    };
    scene.add.existing(_dummyUpdateLoop);

    // Basically a macro cus I'm lazy and like things that are easy to read
    function insertArrow() {
      let arrow;
      if (_arrowRecycle.length > 0) {
        arrow = _arrowRecycle[0];
        _arrowRecycle.shift();
      } else {
        arrow = scene.add.image(-arrowThickness, 0, textureKey);
      }
      arrow.setAngle(90 * arrowDirection);
      // Get correct cords
      let position = ArrowScreenTransition._generateOffsetCoordinates(arrowContainer, startX, startY);
      arrow.setPosition(position.x, position.y);
      arrowContainer.add(arrow);
    }

    // Delete unused objects
    // Basically everything that isn't on the stack here.
    function cleanUp() {
      _dummyUpdateLoop.destroy();
      arrowContainer.destroy();
      for (let i = 0; i < _arrowRecycle.length; i++) {
        _arrowRecycle[i].destroy();
      }
    }
  },

  /*
    Takes a position on the screen and translates it to where it is in
    arrowContainer.
  */
  _generateOffsetCoordinates: (arrowContainer, x, y) => {
    let newX = x - arrowContainer.x;
    let newY = y - arrowContainer.y;

    return {x: newX, y: newY};
  },

  /*
    Generate the arrow texture once, so that it may be reused by many objects
  */
  _generateArrowTexture: (scene, canvasWidth, canvasHeight, arrowDirection, color, arrowThickness) => {
    let arrowGraphic = new Phaser.GameObjects.Graphics(scene);

    arrowGraphic.fillStyle(color);

    // The width is the entire length of the dimension perpendicular to movement
    let arrowWidth;
    if (arrowDirection % 2 == 1) { // Vertical, width is screen width
      arrowWidth = canvasWidth;
    } else { // horizontal movement, width is screen height
      arrowWidth = canvasHeight;
    }

    let indentWidth = arrowWidth/(2 * Math.sqrt(3)); /* Hardcoded to 30 degrees internal angle */

    arrowGraphic.beginPath(); // Path out arrow
    arrowGraphic.moveTo(0,0);
    arrowGraphic.lineTo(arrowThickness, 0);
    arrowGraphic.lineTo(arrowThickness + indentWidth, arrowWidth / 2);
    arrowGraphic.lineTo(arrowThickness, arrowWidth);
    arrowGraphic.lineTo(0, arrowWidth);
    arrowGraphic.lineTo(indentWidth, arrowWidth / 2);
    arrowGraphic.closePath();
    arrowGraphic.fill();

    // store the graphic to the cache for use later
    arrowGraphic.generateTexture(
      "-ArrowScreenTransition-" + "-" + color + "-" + arrowThickness + "-" + arrowDirection, // key
      arrowThickness + indentWidth, // width of graphic
      arrowWidth // height of graphic
    );

    arrowGraphic.destroy(); // free up them memories
  },
};

export { ArrowScreenTransition };

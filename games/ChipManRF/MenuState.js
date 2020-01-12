import { CanvasControl } from './PassCanvasControl.js';
import * as OpenScene3D from './OpenScene3D.js';
import { GameState } from "./GameState.js";
import { PreloadState } from "./PreloadState.js";


export class MenuState extends Phaser.Scene {

  /* ===== BLUE-PRINT FUNCTIONS ===== */

  constructor() {
    super({key: "MenuState"});
  }

  preload() {
    this.load.setPath("assets/games/ChipManRF/");
    // All preloaded
  }

  create() {
    /* === Class Variables === */
    // The chipman spine that is shown running around on the title screen
    this.chipman = this.add.spine(0, -222, "chipman");
    this.chipman.setScale(0.1, 0.1);

    // A mostly empty container that only holds chipman
    // Phaser strongly reccomends against this, but until I can rotate
    //  or anchor a spine object, this is my only option.
    this.chipmanContainer = this.add.container(0, 0, this.chipman)

    // Holds the moon and everything on it (to rotate slowly)
    // This includes chipman's container!
    this.moonContainer = this.add.container(100, 450);
    this.moonContainer.depth = 1;

    /* === Local Variables === */
    // Black background (space ya'know)
    let background = this.add.graphics();
    background.fillStyle(0x000000);
    background.fillRect(0, 0, 640, 480);
    background.depth = 0;

    // Chipman's house that will live and rotate on the moon
    let house = this.add.image(0, 0, "house");
    house.setScale(0.5, 0.5);
    house.setOrigin(.5, 3.27);
    // Depth is set in the order of the add array

    // The moon game object
    let moon = this.add.image(0, 0, "moon");
    moon.setScale(0.5, 0.5);
    // Depth is set in the order of the add array

    // Add the menu options
    let startButton = this.add.image(460, 240, "startButton");
    startButton.setScale(0.5, 0.5);
    startButton.setInteractive();
    startButton.depth = 5;

    // The name of the game all fancy like
    let title = this.add.image(430, 100, "titleGraphic");
    title.setScale(0.5, 0.5);
    title.depth = 5;

    /* === Action === */
    // Add the moon bound objects to the moon
    this.moonContainer.add([house, moon, this.chipmanContainer]);

    // Make the start button active
    startButton.on("pointerup", this._startGame.bind(this));

    // The scene is now fully set up, I do this before the three.js hand-off
    // to reduce any intialization lag when the game switchs back to Phaser.

    // Prepare the hand over to Three.JS
    this.game.renderer.clearPipeline();
    this.game.loop.sleep();
    CanvasControl.freeCanvas(this.game.renderer.canvas,
                             // Make there there's a way back to Phaser
                             this._resumeControlFromThreeJS.bind(this));
    // Notify THREE.JS everything is good to go
    OpenScene3D.startOpenCinematic();
  }

  update() {

  }

  /* ===== ACTION FUNCTIONS ===== */

  /*
   * _chipmanNextAction()
   * Will create a Phaser Tween based on what action is randomly decided upon
   * Special cases favor certain directions over others
   */
  _chipmanNextAction() {
    let actionNames = this.chipmanActions.names;

    if (this.chipmanContainer.angle + this.moonContainer.angle % 360 < -30 ||
        this.chipmanContainer.angle + this.moonContainer.angle % 360 > 270) {
      let distance = Math.random() * (60) + 40;
      this.chipmanActions["runRight"](distance);
      // Randomly jumps
      if (Math.random() > 0.75) {
        this.chipmanActions["jump"]();
      }
    }
    else if (this.chipmanContainer.angle + this.moonContainer.angle % 360 > 70) {
      let distance = Math.random() * (60) + 40;
      this.chipmanActions["runLeft"](distance);
      // Randomly jumps
      if (Math.random() > 0.75) {
        this.chipmanActions["jump"]();
      }
    }
    else {
      let action = Math.floor(Math.random() * 3);
      if (action < 2) { // distance
        let distance = Math.random() * (60) + 40;
        this.chipmanActions[actionNames[action]](distance); // give random distance
        // Randomly jumps
        if (Math.random() > 0.75) {
          this.chipmanActions["jump"]();
        }
      } else {
        // Stall
        this.chipmanActions[actionNames[action]](Math.random() * (900) + 100); // random time
      }
    }
  }

  /*
   * _generateChipManActions() -> object{names: array[string], *: function() ... }
   * Returns a large object with functions that define menu screen
   * animations for chipman.
   */
  _generateChipManActions() {
    return {
      // Have a list of the name of each function
      // Order should be consistent and constant
      names: ["runLeft", "runRight", "stall", "jump"],

      runLeft: (distance) => {
        this.chipman.scaleX = -.1;
        this.chipman.setAnimation(0, "run", true);
        this.add.tween({
          targets: this.chipmanContainer,
          angle: this.chipmanContainer.angle - distance,
          duration: distance / 0.02, // 0.02 is the speed
          onComplete: this._chipmanNextAction,
          onCompleteScope: this,
        })
      },
      runRight: (distance) => {
        this.chipman.scaleX = .1;
        this.chipman.setAnimation(0, "run", true);
        this.add.tween({
          targets: this.chipmanContainer,
          angle: this.chipmanContainer.angle + distance,
          duration: distance / 0.02, // 0.02 is the speed
          onComplete: this._chipmanNextAction,
          onCompleteScope: this,
        })
      },
      stall: (time) => {
        this.chipman.setAnimation(0, "idle", true);
        this.time.addEvent({
          delay: time,
          callback: this._chipmanNextAction,
          callbackScope: this,
        })
      },
      jump: () => {
        this.add.tween({
          targets: this.chipman,
          y: -350,
          duration: 1000, // 0.02 is the speed
          ease: Phaser.Math.Easing.Quadratic.Out,
          onCompleteScope: this,
          onComplete: () => {
            this.add.tween({
              targets: this.chipman,
              y: -222,
              duration: 1000, // 0.02 is the speed
              ease: Phaser.Math.Easing.Quadratic.In,
            });
          }
        });
      }
    };
  }

  /*
   * _resumeControlFromThreeJS()
   * Will get the actions going on the menu.
   */
  _resumeControlFromThreeJS() {
    // Reclaim the canvas
    CanvasControl.restrainCanvas();
    this.game.loop.wake(true);

    // All things on the "rotating" moon should go here
    this.add.tween({
      targets: this.moonContainer,
      angle: 360,
      duration: 70000,
      loop: -1,
    });

    this.chipmanActions = this._generateChipManActions();

    this._chipmanNextAction();
  }

  /*
    _startGame()
    Shuts down the main menu and begins the game proper.
  */
  _startGame() {
    this.game.scene.stop("MenuState");
    this.game.scene.add("GameState", GameState, true);
  }

  // Temp (only keeping here for later reference)
  /*titleGraphicAnimation(titleGraphic) {
    titleGraphic.setTint(0x000000);
    // Fade in title (old fashion method)
    let titleTimeline = this.tweens.createTimeline();

    // Fade black to blue
    titleTimeline.queue(this.tweens.addCounter({
        from: 0,
        to: 128,
        duration: 100,
        paused: true,
        onUpdate: function (tween)
        {
            let value = Math.floor(tween.getValue());

            titleGraphic.setTint(Phaser.Display.Color.GetColor(0, 0, value));
        }
    }));

    // Blue to white
    titleTimeline.queue(this.tweens.addCounter({
        from: 0,
        to: 255,
        duration: 300,
        paused: true,
        onUpdate: function (tween)
        {
            let value = Math.floor(tween.getValue());

            let offsetValue = 128 + value/2;

            titleGraphic.setTint(Phaser.Display.Color.GetColor(value, value, offsetValue));
        }
    }));

    // White to yellow (TODO: also scale up slightly)
    titleTimeline.queue(this.tweens.addCounter({
        from: 255,
        to: 50,
        delay: 2000,
        duration: 600,
        easing: Phaser.Math.Easing.Expo.Out,
        paused: true,
        onUpdate: function (tween)
        {
            let value = Math.floor(tween.getValue());

            titleGraphic.setTint(Phaser.Display.Color.GetColor(255, 255, value));
        }
    }));

    titleTimeline.play();
    // Zoom Title
    this.add.tween({
      targets: titleGraphic,
      delay: 5000,
      scaleX: 20,
      scaleY: 20,
      ease: Phaser.Math.Easing.Expo.In
    })
  }*/
}

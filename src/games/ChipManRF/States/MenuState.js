import { FullScreenButton } from '../Objects/UI/FullScreenButton.js';
import { MenuMoon } from '../Objects/MenuMoon.js';
import { DISTRIBUTIONS, StarField } from '../Objects/StarField.js';

export class MenuState extends Phaser.Scene {

  /* ===== BLUE-PRINT FUNCTIONS ===== */

  constructor() {
    super({key: "MenuState"});
  }

  preload() {
    this.load.setPath("assets/games/ChipManRF/");
    // All preloaded
  }

  update() {
    //console.log(this.cameras.main.scrollY);
  }

  create() {
    this.cameras.main.setScroll(0, -this.game.config.height*4);

    this._cameraPanToTitle();

    /* === Class Variables === */
    // Holds the moon and everything on it (to rotate slowly)
    // This includes chipman's container!
    this.moonContainer = new MenuMoon(this, 320, 820);
    this.moonContainer.setScale(2, 2);
    this.moonContainer.depth = 2;
    this.add.existing(this.moonContainer);

    /* === Local Variables === */
    // Black background (space ya'know)
    let background = this.add.graphics();
    background.fillStyle(0x000000);
    background.fillRect(0, 0, 640, 480);
    background.depth = 0;

    this._generateStarFields();

    let fragsrc =
    `
    #ifdef GL_ES
    precision mediump float;
    #endif

    uniform float time;

    void main(void) {
      gl_FragColor = vec4(abs(sin(time + 1.0)),abs(sin(time + 2.0)),abs(sin(time+ 3.0)),1.0);
    }
    `;
    let baseShader = new Phaser.Display.BaseShader("rainbow", fragsrc);
    let shader = this.add.shader(baseShader, 320, 315,480, 100).setDepth(10);


    // Add the menu options
    let startText = this.add.bitmapText(320, 320, "mainFont", "Click or Tap to Start", 11);
    startText.setOrigin(.5,1);
    startText.setDepth(6);
    startText.setTintFill(0xffffff);
    let textMask = startText.createBitmapMask();
    shader.setMask(textMask);

    // The name of the game all fancy like
    let title = this.add.image(320, 120, "titleGraphic");
    title.setScale(0.8, 0.8);
    title.depth = 5;

    // Copyright info
    let copyright = this.add.bitmapText(320, 480, "mainFont", "(C) 2020 Copyright BananaToken Arcade All Rights Reserved", 9);
    copyright.setOrigin(.5,1);
    copyright.setDepth(6);
    copyright.setTintFill(0x000000);

    /* === Action === */
    // Make the start button active
    //startButton.on("pointerup", this._startGame.bind(this));

    // Make the debug button active
    //debugButton.on("pointerup", this._launchDebug.bind(this));
  }

  /* ===== ACTION FUNCTIONS ===== */
  /*
    _startGame()
    Shuts down the main menu and begins the game proper.
  */
  _startGame() {
    this.scene.stop();
    // this.game.scene.add("GameState", GameState, true);
    this.scene.start("LevelSelectDebugState");
  }

  /*
    _launchDebug()
    Shuts down the main menu and begins the debug state
  */
  _launchDebug() {
    this.scene.start("DebugState");
  }

  _cameraPanToTitle(complete) {
    let timeline = this.tweens.createTimeline();

    timeline.add({
      targets: this.cameras.main,
      scrollX:0,
      scrollY:-this.game.config.height*3,
      duration: 1000,
      ease: Phaser.Math.Easing.Quintic.In
    });
    timeline.add({
      targets: this.cameras.main,
      scrollX: 0,
      scrollY:-this.game.config.height*2,
      duration: 200,
      repeat: 2
    });
    timeline.add({
      targets: this.cameras.main,
      scrollX:0,
      scrollY:0,
      duration: 1000,
      ease: Phaser.Math.Easing.Quintic.Out,
      onComplete: complete,
      onCompleteScope: this
    });

    timeline.play();
  }

  _generateStarFields() {
    // Stars
    let stars = new StarField(this);
    this.add.existing(stars);
    stars.setDepth(1);
    stars.generateField({
      bounds: new Phaser.Geom.Rectangle(0, -this.game.config.height*4, this.game.config.width, this.game.config.height),
      numStars: 100,
      sizeRange: [.2, .6],
      randomSeed: "banana",
      distribution: DISTRIBUTIONS.POLY
    })
    stars.generateField({
      bounds: new Phaser.Geom.Rectangle(0, -this.game.config.height*3, this.game.config.width, this.game.config.height),
      numStars: 100,
      sizeRange: [.2, .6],
      randomSeed: "token+",
      distribution: DISTRIBUTIONS.POLY
    });
    stars.generateField({
      bounds: new Phaser.Geom.Rectangle(0, -this.game.config.height*2, this.game.config.width, this.game.config.height),
      numStars: 100,
      sizeRange: [.2, .6],
      randomSeed: "token+",
      distribution: DISTRIBUTIONS.POLY
    });
    stars.generateField({
      bounds: new Phaser.Geom.Rectangle(0, -this.game.config.height, this.game.config.width, this.game.config.height*2),
      numStars: 200,
      sizeRange: [.2, .6],
      randomSeed: "arcade++",
      distribution: DISTRIBUTIONS.POLY
    });
  }
}

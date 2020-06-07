import { FullScreenButton } from '../Objects/UI/FullScreenButton.js';
import { MenuButton } from '../Objects/UI/MenuButton.js';
import { MenuMoon } from '../Objects/MenuMoon.js';

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
    //console.log(this.chipmanContainer.angle + this.moonContainer.angle % 360)
  }

  create() {
    /* === Class Variables === */
    // Holds the moon and everything on it (to rotate slowly)
    // This includes chipman's container!
    this.moonContainer = new MenuMoon(this, 320, 820);
    this.moonContainer.setScale(2, 2);
    this.moonContainer.depth = 1;
    this.add.existing(this.moonContainer);

    /* === Local Variables === */
    // Black background (space ya'know)
    let background = this.add.graphics();
    background.fillStyle(0x000000);
    background.fillRect(0, 0, 640, 480);
    background.depth = 0;

    // Add the menu options
    let startButton = new MenuButton(this, 320, 380, "startButton");
    startButton.setDepth(5);
    startButton.setScale(2, 2);
    this.add.existing(startButton);

    /*let debugButton = this.add.image(410, 300, "startButton");
    debugButton.setScale(0.25, 0.25);
    debugButton.setTint("0xff0000");
    debugButton.setInteractive();
    debugButton.depth = 5;*/

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
    startButton.on("pointerup", this._startGame.bind(this));

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
}

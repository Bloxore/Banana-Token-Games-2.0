import { GameState } from "./GameState.js";
import { GameStateHUD } from "./GameStateHUD.js";

/*
 * The job of this state is to load all essential assets of the game.
 * "Essential Asset" include those too beefy to load between levels.
 * It also covers asssets used in EVERY level (to lower the burden of
 *  loading for the first level.)
 * The loading scene must contain the following:
 * Some kind of progress bar.
 * Something else (perhaps interactive)
 */
export class PreloadState extends Phaser.Scene {
  constructor() {
    super({key: "PreloadState"});
  }

  preload() {
    /* == CLASS VARIABLES == */

    // Progress bar
    this.progressBar = this.add.group();

    /* == LOCAL VARIABLES == */

    // Yellow background
    let background = this.add.graphics();
    background.fillStyle(0xffff00);
    background.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

    // Progress bar
    // Outer shell (the border)
    let pBOuterShell = this.add.graphics();
    pBOuterShell.lineStyle(4, 0x000000);
    pBOuterShell.strokeRect(0, 0, 300, 40);
    pBOuterShell.x = this.game.canvas.width - 340;
    pBOuterShell.y = this.game.canvas.height - 75;

    this.pBInnerShell = this.add.graphics();
    this.pBInnerShell.fillStyle(0x000000);
    this.pBInnerShell.fillRect(5, 5, 290, 30);
    this.pBInnerShell.x = this.game.canvas.width - 340;
    this.pBInnerShell.y = this.game.canvas.height - 75;

    /* == ACTION == */
    // Set up all the things to be loaded here
    this.load.setPath("assets/games/SplitArmy/");

    /* Bitmap font*/
    this.load.bitmapFont("mainFont", "fonts/PressStart/PressStart2P.png", "fonts/PressStart/PressStart2P.fnt");

    this.load.spritesheet('tiles','graphics/tiles.png', {frameWidth: 32, frameHeight: 32});

    this.load.on("progress", (e) => {
      this.pBInnerShell.clear();
      this.pBInnerShell.fillStyle(0x000000);
      this.pBInnerShell.fillRect(5, 5, 290*e, 30);
    }, this);
  }

  create() {
    this.game.scene.stop();
    // Add all of the game's scenes here
    this.game.scene.add("GameStateHUD", GameStateHUD);

    // Stop this state
    this.scene.stop();

    this.game.scene.add("GameState", GameState, true);
  }
}

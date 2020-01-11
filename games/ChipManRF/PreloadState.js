import { CanvasControl } from './PassCanvasControl.js';
import { GameState } from "./GameState.js";

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

  }

  create() {
    /* == CLASS VARIABLES == */

    // Progress bar
    this.progressBar = this.add.group();

    /* == LOCAL VARIABLES == */

    // Yellow background
    let background = this.add.graphics();
    background.fillStyle(0xffff00);
    background.fillRect(0, 0, 640, 480);

    // Progress bar
    // Outer shell (the border)
    let pBOuterShell = this.add.graphics();
    pBOuterShell.lineStyle(5, 0x000000);
    pBOuterShell.strokeRect(0, 0, 100, 20);
    this.progressBar.add(pBOuterShell); // First member

    /* == ACTION == */
    console.log(this.progressBar);
    this.progressBar.shiftPosition(400, 200);
  }

  update() {

  }
}

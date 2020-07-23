import { MenuState } from "./MenuState.js";
import { GameState } from "./GameState.js";
import { LevelSelectDebugState } from "./LevelSelectDebugState.js";
import { DebugState } from "./DebugState.js";
import { Manager } from "../../../lib/Manager.js";

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
    background.fillRect(0, 0, 640, 480);

    // Progress bar
    // Outer shell (the border)
    let pBOuterShell = this.add.graphics();
    pBOuterShell.lineStyle(4, 0x000000);
    pBOuterShell.strokeRect(0, 0, 300, 40);
    pBOuterShell.x = 300;
    pBOuterShell.y = 405;

    this.pBInnerShell = this.add.graphics();
    this.pBInnerShell.fillStyle(0x000000);
    this.pBInnerShell.fillRect(5, 5, 290, 30);
    this.pBInnerShell.x = 300;
    this.pBInnerShell.y = 405;

    /* == ACTION == */
    // Set up all the things to be loaded here
    this.load.setPath("assets/games/ChipManRF/");

    /* ChipMan Spine Load */
    this.load.spine("chipman", "chipman-spine/ChipMan.json", "chipman-spine/ChipMan.atlas", true);

    /* Bitmap font*/
    this.load.bitmapFont("mainFont", "fonts/PressStart/PressStart2P.png", "fonts/PressStart/PressStart2P.fnt");

    /* = Main menu graphics = */
    this.load.image("titleGraphic", "graphics/ChipManTitle.png");
    this.load.image("titleShadow", "graphics/Title.png");
    this.load.image("moon", "graphics/Moon.png");
    this.load.image("house", "graphics/ChipManHouse.png");
    this.load.image("menuButton", "graphics/MenuButton.png");
    this.load.image("menuButtonMask", "graphics/MenuButtonMask.png");
    this.load.image("menuButtonExt", "graphics/MenuButtonExtension.png");
    this.load.image("menuButtonBack", "graphics/MenuButtonBack.png");
    this.load.image("star", "graphics/star.png");

    this.load.on("progress", (e) => {
      this.pBInnerShell.clear();
      this.pBInnerShell.fillStyle(0x000000);
      this.pBInnerShell.fillRect(5, 5, 290*e, 30);
    }, this);

    this.game.scene.add("Manager", Manager, true);
  }

  create() {
    this.game.scene.stop();
    // Add all of the game's scenes here
    this.game.scene.add("DebugState", DebugState)
    this.game.scene.add("LevelSelectDebugState", LevelSelectDebugState);
    this.game.scene.add("GameState", GameState);
    this.game.scene.add("MenuState", MenuState);

    // Stop this state
    this.scene.stop();

    this.scene.start("MenuState");
  }
}

import { DialogueBox } from '../Objects/HUD/DialogueBox.js';

// A strange kind of scene that lives on top of GameStates when they run.
export class GameStateHUD extends Phaser.Scene {
  constructor() {
    super({
      key: "GameStateHUD"
    });
  }

  create() {
    let db = new DialogueBox(this);
    db.beginSession("Hello");
  }
}

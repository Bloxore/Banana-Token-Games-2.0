import { GameState } from "./GameState.js";

let config = {
    type: Phaser.WEBGL,
    width: 640,
    height: 480,
    scale: {
      parent: "game",
      mode: Phaser.Scale.FIT,
      width: 640,
      height: 480
    },
    scene: [ GameState ],
    physics: {
        default: 'arcade',
        arcade: {
          //debug: true
        }
    }
};

export { config };

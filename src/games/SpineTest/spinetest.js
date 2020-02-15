import * as SpinePlugin from '../../../lib/SpinePlugin.js';
import { GameState } from "./GameState.js";

let config = {
    type: Phaser.WEBGL,
    width: 640,
    height: 480,
    backgroundColor: '#cdcdcd',
    scale: {
      parent: "game",
      mode: Phaser.Scale.FIT,
      width: 640,
      height: 480
    },
    plugins: {
      scene: [
                { key: 'SpinePlugin', plugin: window.SpinePlugin, mapping: 'spine' }
             ]
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

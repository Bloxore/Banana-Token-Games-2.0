import { PreloadState } from "./States/PreloadState.js";

let config = {
    type: Phaser.WEBGL,
    width: 480,
    height: 480,
    backgroundColor: '#000000',
    scale: {
      parent: "game",
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 640,
      height: 480,
      zoom: Phaser.Scale.Zoom.MAX_ZOOM,
    },
    plugins: {
      scene: [
                { key: 'SpinePlugin', plugin: window.SpinePlugin, mapping: 'spine' }
             ]
    },
    scene: [ PreloadState ],
    physics: {
        default: 'arcade',
        arcade: {
          //debug: true
        }
    }
};

export { config };

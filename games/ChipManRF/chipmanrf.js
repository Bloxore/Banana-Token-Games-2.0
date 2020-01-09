import { MenuState } from "./MenuState.js";

let config = {
    type: Phaser.WEBGL,
    width: 640,
    height: 480,
    backgroundColor: '#000000',
    scale: {
      parent: "game",
      mode: Phaser.Scale.FIT,
      width: 640,
      height: 480,
      zoom: Phaser.Scale.Zoom.MAX_ZOOM,
    },
    plugins: {
      scene: [
                { key: 'SpinePlugin', plugin: window.SpinePlugin, mapping: 'spine' }
             ]
    },
    scene: [ MenuState ],
    physics: {
        default: 'arcade',
        arcade: {
          //debug: true
        }
    }
};

export { config };

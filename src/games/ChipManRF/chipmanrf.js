import { PreloadState } from "./States/PreloadState.js";
import * as SpinePlugin from "../../../external_libraries/SpinePlugin_3_50.js";

let config = {
    type: Phaser.WEBGL,
    backgroundColor: '#000000',
    roundPixels: true,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'game',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 640,
        height: 480,
        zoom: Phaser.MAXZOOM,
    },
    plugins: {
      scene: [
                { key: 'SpinePlugin', plugin: window.SpinePlugin, mapping: 'spine' }
             ]
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: PreloadState
};

export { config };

'use strict';

class GameContainer {
  constructor(doc) {
    this._doc = doc;
    this.game = null;

    this._canvas = document.createElement("CANVAS");
  }

  set_size(width, height) {
    let gameDiv = this._doc.getElementById("game");
    gameDiv.width = width;
    gameDiv.height = height;
  }

  get_size() {
    return {
            width: this._canvas.width,
            height: this._canvas.height
          };
  }

  add_to_page() {
    let gameDiv = this._doc.getElementById("game");
    gameDiv.appendChild(this._canvas);
  }

  start_game(config) {
    config.canvas = this._canvas;

    var game = new Phaser.Game(config);
  }
}

export { GameContainer };

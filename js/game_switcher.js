'use strict';

class GameContainer {
  constructor() {
    this.game = null;

    this._canvas = document.createElement("CANVAS");
  }

  set_size(width, height) {
    this._canvas.width = width;
    this._canvas.height = height;
  }

  get_size() {
    return {
            width: this._canvas.width,
            height: this._canvas.height
          };
  }

  add_to_page(doc) {
    doc.body.appendChild(this._canvas);
  }

  start_game(config) {
    config.canvas = this._canvas;

    var game = new Phaser.Game(config);
  }
}

export { GameContainer };

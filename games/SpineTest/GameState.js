class GameState extends Phaser.Scene {
  constructor() {
    super({key: "GameState"});
  }

  preload() {
    this.load.setPath('assets/games/spinetest');
    this.load.spine('kirby', 'Kirby.json', 'Kirby.atlas', true)
  }

  create() {

    let kirby = this.add.spine(300, 380, 'kirby', 'wave', true);

    let text = this.add.text(20, 400, "Kirby says hi!", {
      color: "#ff9090",
      fontFamily: "Arial",
      fontSize: "32px",
      fontStyle: "bold"
    });
  }

  update() {

  }
}

export { GameState };

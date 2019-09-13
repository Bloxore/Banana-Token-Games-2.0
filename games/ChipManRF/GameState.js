class GameState extends Phaser.Scene {
  constructor() {
    super({key: "GameState"});
  }

  preload() {
    /* Level Art */
    this.load.image("levelTiles", "assets/games/ChipManRF/levelArt/levelTilemap.png");
    /* Load Level Data */
    this.load.tilemapTiledJSON("level1", "assets/games/ChipManRF/levelData/level1.json");

    /* ChipMan Spine Load */
    this.load.setPath("assets/games/ChipManRF/chipman-spine");
    this.load.spine("chipman", "ChipMan Flash Collection.json", "ChipMan Flash Collection.atlas", true);
  }

  create() {
    let player = this.add.spine(200, 200, "chipman","run", true).setScale(.20);
    this.physics.add.existing(player);
    player.body.setSize(player.width + 6, player.height + 18);
    player.body.setOffset(0, -18);
    //player.body.setVelocity(200, 0);

    let tilemap = this.make.tilemap({ key: 'level1' });
    let tiles = tilemap.addTilesetImage("levelTilemap", "levelTiles");
    let layer = tilemap.createStaticLayer(0, tiles, 0, 0);
  }

  update() {

  }
}

export { GameState };

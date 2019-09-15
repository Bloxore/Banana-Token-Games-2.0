import { generatePlayer, Player } from './player.js';

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
    /* Constants */
    const TILE_WIDTH = 32;
    const TILE_HEIGHT = 32;
    const HORIZONTAL_TILES = 20;
    const VERTICAL_TILES = 74;
    const WORLD_WIDTH = TILE_WIDTH * HORIZONTAL_TILES;
    const WORLD_HEIGHT = TILE_HEIGHT * VERTICAL_TILES;

    /* Setup camera */
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    /* Setup Player */
    this.player = new Player(this, 200, 200);
    this.add.existing(this.player);
    this.cameras.main.startFollow(this.player);

    /* Setup Level Tilemap */
    this.tilemap = this.make.tilemap({ key: 'level1' });
    this.tiles = this.tilemap.addTilesetImage("levelTilemap", "levelTiles");
    this.layer = this.tilemap.createStaticLayer(0, this.tiles, 0, 0);
    this.tilemap.setCollisionBetween(1, 6);

    /* DEBUG STUFF */
    //this.tilemapDebug = this.add.graphics();
    //this.tilemap.renderDebug(this.tilemapDebug);

    /* Layer with the chip positions and player spawn */
    this.objectLayer = this.tilemap.getObjectLayer("Objects");

    /* Map Parameters */
    let playerSpawnPos;
    let chipPos = [];

    for (let i = 0; i < this.objectLayer.objects.length; i++) {
      let object = this.objectLayer.objects[i];
      if (object.name == "Player Spawn") {
        playerSpawnPos = object;
      }
    }

    /* Change Player to map's spawn point */
    this.player.setPosition(playerSpawnPos.x, playerSpawnPos.y);

    /* Collision setup */
    this.physics.add.collider(this.player, this.layer);

    /* World Bounds */
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    //this.helpText = this.add.text(this.player.x, this.player.y, "Y: ", {color: "#000000"});
  }

  update() {
    
  }
}

export { GameState };

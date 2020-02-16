export class Map extends Phaser.GameObjects.Group {
  constructor(scene, tileWidth, tileHeight) {
    super(scene);
    // 2D-Array of Phaser TileSprites
    this.tiles = null;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.width = 0;
    this.height = 0;
  }

  /*
    loadMap(JSONMapObject map)

    Creates all the tiles for the tilemap and adds them to the screen.
  */
  loadMap(map) {
    this.clean();
    this.tiles = [];
    this.width = map.width;
    this.height = map.height;
    for (let r = 0; r < map.height; r++) {
      this.tiles.push([]);
      for (let c = 0; c < map.width; c++) {
        let tile = this.scene.make.tileSprite({
          x: c * this.tileWidth,
          y: r * this.tileHeight,
          width: this.tileWidth,
          height: this.tileHeight,
          key: map.tileset,
          frame: map.data[r][c]
        });
        tile.setOrigin(0);
        this.tiles[r].push(tile);
        this.add(tile, true)
      }
    }
  }

  /*
    Returns the width in px of the tilemaps
  */
  getWidth() {
    return this.width * this.tileWidth;
  }

  /*
    Returns the height in px of the tilemaps
  */
  getHeight() {
    return this.height * this.tileHeight;
  }

  getTileWidth() {
    return this.tileWidth;
  }

  getTileHeight() {
    return this.tileHeight;
  }

  /*
    Deletes all the tiles and empties the tiles array
  */
  clean() {
    this.clear(true, true);
    this.tiles = null;
    this.width = 0;
    this.height = 0;
  }
}

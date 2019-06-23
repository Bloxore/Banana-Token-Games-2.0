class PoolTable extends Phaser.GameObjects.Group {
  constructor(scene, x, y, texture) {
    super(scene);

    this.table = new Phaser.GameObjects.Sprite(scene, x, y, texture);
    this.add(this.table, true);
    this.table.setPosition(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY);

    /* Set up the border */
    this.borders = [];
    this.borders.push(new Phaser.GameObjects.Zone(scene, this.table.x, this.table.y - 60 - this.table.height / 2, this.table.width, 80).setOrigin(.5, 0));
    this.borders.push(new Phaser.GameObjects.Zone(scene, this.table.x, this.table.y + 60 + this.table.height / 2, this.table.width, 80).setOrigin(.5, 1));

    this.borders.push(new Phaser.GameObjects.Zone(scene, this.table.x - 60 - this.table.width / 2, this.table.y, 80, this.table.height).setOrigin(0, .5));
    this.borders.push(new Phaser.GameObjects.Zone(scene, this.table.x + 60 + this.table.width / 2, this.table.y, 80, this.table.height).setOrigin(1, .5));

    this.borders[0].pushing = {x:0,y:1};
    this.borders[1].pushing = {x:0,y:-1};
    this.borders[2].pushing = {x:1,y:0};
    this.borders[3].pushing = {x:-1,y:0};
    /* Enable physics */
    for (let i = 0; i < this.borders.length; i++) {
      this.scene.physics.add.existing(this.borders[i], true);
    }
    /* Add borders to group */
    this.addMultiple(this.borders, true);

    /* Define some attr */
    this.x = this.scene.cameras.main.centerX;
    this.y = this.scene.cameras.main.centerY;
    this.width = this.table.width;
    this.height = this.table.height;
  }
}

export { PoolTable };

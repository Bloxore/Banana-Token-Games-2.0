import { Map } from './Map.js';
import { UnitGroup } from './UnitGroup.js';

export class GameState extends Phaser.Scene {
  constructor() {
    super({key: "GameState"});
  }

  preload() {
    this.load.setPath("assets/games/SplitArmy/");

    this.load.json("map0", "mapData/map0.json");
  }

  create() {
    /*
      Loads the map data and displays the map
    */
    let map = new Map(this, 32, 32);
    map.loadMap(this.cache.json.get("map0"));

    let unit = new UnitGroup(this, map);
    this.add.existing(unit);
    unit.setTilePosition(1, 1);
    unit.tweenToTile(2, 1);
    /*
      Set up the camera
    */
    this.cameras.main.setZoom(3);
    this.cameras.main.setScroll(-200,-200);

    /*
      Set up camera bounds
    */
    this.cameras.main.setBounds(0, 0, map.getWidth(), map.getHeight());

    /*
      Set up camera controls
    */
    this.cameraScrollTerminalVelocity = {
      x: 3,
      y: 3
    }
    this.cameraScrollVelocity = {
      x: 0,
      y: 0
    }

    /*
      Mouse deadzone
    */
    this.mouseDeadZone = {
      x: 0,
      y: 0,
      radius: 100,
    }

    this.wKey = this.input.keyboard.addKey("w");
    this.aKey = this.input.keyboard.addKey("a");
    this.sKey = this.input.keyboard.addKey("s");
    this.dKey = this.input.keyboard.addKey("d");

    this.input.on("pointerdown", (pointer) => {
      this.mouseDeadZone.x = pointer.downX;
      this.mouseDeadZone.y = pointer.downY;
    })
  }

  update() {
    /* Camera Controls */
    if (this.wKey.isDown) {
      this.cameraScrollVelocity.y += -this.cameraScrollTerminalVelocity.y;
    }
    if (this.sKey.isDown) {
      this.cameraScrollVelocity.y += this.cameraScrollTerminalVelocity.y;
    }
    if (this.aKey.isDown) {
      this.cameraScrollVelocity.x += -this.cameraScrollTerminalVelocity.x;
    }
    if (this.dKey.isDown) {
      this.cameraScrollVelocity.x += this.cameraScrollTerminalVelocity.x;
    }
    if (this.input.activePointer.isDown) {
      let pointer = this.input.activePointer;
      let xDiff = pointer.x - this.mouseDeadZone.x;
      let yDiff = pointer.y - this.mouseDeadZone.y;
      let dist = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));

      if (Math.abs(xDiff) > this.mouseDeadZone.radius) {
        let xNormal = xDiff / dist;
        this.cameraScrollVelocity.x += this.cameraScrollTerminalVelocity.x * xNormal;
      }

      if (Math.abs(yDiff) > this.mouseDeadZone.radius) {
        let yNormal = yDiff / dist;
        this.cameraScrollVelocity.y += this.cameraScrollTerminalVelocity.y * yNormal;
      }
    }

    let mainCamera = this.cameras.main;
    mainCamera.setScroll(
      mainCamera.scrollX + this.cameraScrollVelocity.x,
      mainCamera.scrollY + this.cameraScrollVelocity.y
    );

    // Reset accelerations
    this.cameraScrollVelocity.x = 0;
    this.cameraScrollVelocity.y = 0;
  }
}

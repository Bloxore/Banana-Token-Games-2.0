import { Map } from '../Objects/Map.js';
import { UnitGroup } from '../Objects/UnitGroup.js';

export class GameState extends Phaser.Scene {
  constructor() {
    super({key: "GameState"});
  }

  // TODO: Avoid loading resources more than once
  preload() {
    this.load.setPath("assets/games/SplitArmy/");

    this.load.json("map0", "mapData/map0.json");
  }

  create() {
    /*
      Define all THIS variables here
    */
    // References the hud scene
    this.hud = null;
    // Determinant of whether the player has camera control
    this.playerCameraControl = true;
    /*
      Loads the map data and displays the map
    */
    let map = new Map(this, 32, 32);
    map.loadMap(this.cache.json.get("map0"));

    /*
      Testing elements
    */
    let unit = new UnitGroup(this, map);
    this.add.existing(unit);
    unit.setTilePosition(1, 1);
    unit.tweenToTile(2, 1);
    /*
      End Testing elements
    */

    /*
      Start the HUD Scene
    */
    this.scene.launch("GameStateHUD");
    this.scene.moveBelow("GameStateHUD")
    this.hud = this.scene.get("GameStateHUD");

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
      Should be customizable in settings
    */
    this.mouseDeadZone = {
      x: 0,
      y: 0,
      radius: 50,
      // Space outside radius to calculate scroll speed
      reach: 100
    }

    this.wKey = this.input.keyboard.addKey("w");
    this.aKey = this.input.keyboard.addKey("a");
    this.sKey = this.input.keyboard.addKey("s");
    this.dKey = this.input.keyboard.addKey("d");

    this.input.on("pointerdown", (pointer) => {
      if (this.playerCameraControl) {
        this.mouseDeadZone.x = pointer.downX;
        this.mouseDeadZone.y = pointer.downY;
      }
    })
  }

  update() {
    /* Camera Controls */
    if (this.playerCameraControl) {
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
      let pointer = this.input.activePointer;
      if (pointer.isDown &&
          pointer.x >= 0 && pointer.x <= this.game.canvas.width && // horizontal bounds
          pointer.y >= 0 && pointer.y <= this.game.canvas.height // vertical bounds
        ) {
        let xDiff = pointer.x - this.mouseDeadZone.x;
        let yDiff = pointer.y - this.mouseDeadZone.y;
        let dist = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));

        let reachRatio = (dist - this.mouseDeadZone.radius) / this.mouseDeadZone.reach;
        if (reachRatio > 2) {
          reachRatio = 2;
        }

        if (Math.abs(xDiff) > this.mouseDeadZone.radius) {
          let xNormal = xDiff / dist;
          this.cameraScrollVelocity.x += this.cameraScrollTerminalVelocity.x * xNormal * reachRatio;
        }

        if (Math.abs(yDiff) > this.mouseDeadZone.radius) {
          let yNormal = yDiff / dist;
          this.cameraScrollVelocity.y += this.cameraScrollTerminalVelocity.y * yNormal * reachRatio;
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
}

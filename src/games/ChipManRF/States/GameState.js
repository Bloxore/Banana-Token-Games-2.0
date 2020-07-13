import { Player } from '../Objects/Player.js';
import { Chip }  from '../Objects/Chip.js';
import { createFlag } from '../Objects/Flag.js';
import { ArrowScreenTransition } from '../FX/ArrowScreenTransition.js';
import { ArrowHUD } from '../Objects/UI/ArrowHUD.js';
import { Background, BACKGROUND_TYPES } from '../Objects/Background.js';

export class GameState extends Phaser.Scene {
  constructor() {
    super({key: "GameState"});
  }

  init(data) {
    if (data.levelKey) {
      this.data.set("levelKey", data.levelKey);
    } else {
      this.data.set("levelKey", "level1"); // default level if not specified
    }

    if (data.previousState) {
      this.data.set("previousState", data.previousState);
    }
  }

  preload() {
    this.data.set("safeToUpdate", false);
    /* Setup loading scene */
    let loadText = this.add.bitmapText(480, 455, "mainFont", "Loading: 0%", 12);
    loadText.setDepth(0);
    loadText.setScrollFactor(0);
    loadText.setTintFill(0xffffff);

    this.load.setPath("assets/games/ChipManRF/");
    /* Level Art */
    this.load.image("levelTiles", "levelArt/levelTilemap.png");
    this.load.spritesheet("levelEntities", "levelArt/levelEntities.png", { frameWidth: 32, frameHeight: 32 });
    /* Load Level Data */
    let levelKey = this.data.get("levelKey");
    this.load.tilemapTiledJSON(levelKey, "levelData/" + levelKey + ".json");

    /* Flag Spine Load */
    this.load.spine("flag", "flag-spine/ChipMan Flag.json", "flag-spine/ChipMan Flag.atlas", true);

    /* Status box */
    this.load.image("status", "graphics/StatusBox.png");

    this.load.on("progress", (e) => {
      loadText.text = "Loading: " + e.toFixed(2)*100 + "%";
    })

    this.load.on("complete", () => {
      loadText.destroy();
    });
  }

  create() {
    /* Constants */
    const TILE_WIDTH = 32;
    const TILE_HEIGHT = 32;

    /* Game variables */
    this.data.set("chipsCollected", false);
    this.data.set("totalChips", 0);

    /*
      Setup Level Tilemap
      Do this first so that I can get this number of total tiles
     */
    let levelKey = this.data.get("levelKey");
    let tilemap = this.make.tilemap({ key: levelKey });
    let tiles = tilemap.addTilesetImage("levelTilemap", "levelTiles");
    let layer = tilemap.createStaticLayer(0, tiles, 0, 0);
    tilemap.setCollisionBetween(1, 6);
    layer.setDepth(1);

    const HORIZONTAL_TILES = 20;
    const VERTICAL_TILES = 74;
    console.log(tilemap.height);
    const WORLD_WIDTH = TILE_WIDTH * HORIZONTAL_TILES;
    const WORLD_HEIGHT = TILE_HEIGHT * VERTICAL_TILES;

    /* Setup camera */
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    /* Setup timer object */
    let timer = this.time.addEvent();
    this.data.set("timer", timer);

    let background = new Background(this, WORLD_WIDTH, WORLD_HEIGHT);
    background.setDepth(0);
    background.setLayer(0, BACKGROUND_TYPES.MOON, 0);
    background.setLayer(1, BACKGROUND_TYPES.STAR, 0)

    /* Chips */
    let chipGroup = this.physics.add.group({
      delay: 30 * 1000, // default time for level
      callback: this._timeOut,
      callbackScope: this
    });
    chipGroup.setDepth(2);
    this.data.set("chipGroup", chipGroup);

    let flag = createFlag(this, 0, 0);
    flag.setDepth(2);
    this.data.set("flag", flag);

    /* Setup Player */
    let player = new Player(this, 200, 200);
    this.add.existing(player);
    this.cameras.main.startFollow(player, true);
    player.setDepth(3);
    this.data.set("player", player);

    /* Git sum HUD up in here */
    // The hud box that stores the time text and chip count
    let statusBox = this.add.image(641,-1,"status");
    statusBox.setOrigin(1, 0);
    statusBox.setDepth(4);
    statusBox.setScale(1, .75);
    statusBox.setScrollFactor(0);
    statusBox.setAlpha(.9);
    this.data.set("statusBox", statusBox);

    // The time text
    //getElapsedSeconds()
    let timeText = this.add.bitmapText(450, 15, "mainFont", "Time: ", 24);
    timeText.setDepth(5);
    timeText.setOrigin(0, 0);
    timeText.setScrollFactor(0);
    this.data.set("timeText", timeText);

    let chipText = this.add.bitmapText(455, 45, "mainFont", "Chips: ", 16);
    chipText.setDepth(5);
    chipText.setOrigin(0, 0);
    chipText.setScrollFactor(0);
    this.data.set("chipText", chipText);

    /* Input Events */
    this.input.keyboard.addKey("DELETE").once("down", () => {
      // Return to the previous state
      if (this.data.has("previousState")) {
        let previousState = this.data.get("previousState");
        this.scene.stop();
        this.scene.start(previousState);
      }
    })

    /* DEBUG STUFF */
    //this.tilemapDebug = this.add.graphics();
    //this.tilemap.renderDebug(this.tilemapDebug);

    /* Layer with the chip positions and player spawn */
    let objectLayer = tilemap.getObjectLayer("Objects");

    /* Map Parameters */
    let playerSpawnPos;

    for (let i = 0; i < objectLayer.objects.length; i++) {
      let object = objectLayer.objects[i];
      if (object.name == "Player Spawn") {
        playerSpawnPos = object;
      } else if (object.name == "Chip") {
        chipGroup.add(new Chip(this, object.x, object.y).setDepth(2), true);
      } else if (object.name == "Flag") {
        flag.setPosition(object.x, object.y);
      } else if (object.name == "Timer") {
        timer.reset({
          delay: object.properties[0].value * 1000, // valid since 'Time' is its only property
          callback: this._timeOut,
          callbackScope: this
        });
      }
    }

    this.data.set("totalChips", chipGroup.getLength());

    /* Change Player to map's spawn point */
    player.setPosition(playerSpawnPos.x, playerSpawnPos.y);

    /* Collision setup */
    this.physics.add.collider(player, layer);

    /* Chip Collection */
    this.physics.add.overlap(player, chipGroup, (player, chip) => {
      // Completely clean up the chip (want to make sure no more update calls are passed to it)
      chipGroup.remove(chip, true, true);

      if (chipGroup.getLength() == 0) {
        this._allChipsCollected();
      }
    })

    this.data.set("flagBeenHit", false);
    /* Flag Pole hit */
    this.flagCollider = this.physics.add.overlap(player, flag, (player, flag) => {
      // Only trigger the animation if the overlap is new.
      if (this.data.get("flagBeenHit") == false) {
        flag.setAnimation(2, "Pole hit")
        this.data.set("flagBeenHit", true)
      }
      // Trigger the end of the level if all chips have been collected
      if (this.data.get("chipsCollected") == true) {
        this._levelCompletedSuccessfully();
      }
    });

    /* World Bounds */
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    /* Full screen testing FOR LATER INVESTIGATION */
    this.input.keyboard.addKey("k").on("down", () => {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });

    /*let arrow = new ArrowHUD(this, player.x, player.y, {
      arrowWidth: 600,
      arrowHeight: 120,
      cutPercent: 0.1
    });
    this.add.existing(arrow);*/

    // DO NOT TOUCH THIS (pls)
    // Sometimes phaser likes to update before running create
    this.data.set("safeToUpdate", true);
  }

  update() {
    if (this.data.get("safeToUpdate") == false) {
      // Create() has not finished executing
      // but Phaser's like, I dunno, let's update!
      return;
    }
    let flag = this.data.get("flag");
    // Once the player stops touching the flag (or stops moving) re-enable the hit animation
    if (flag.body.overlapX == 0 && flag.body.overlapY == 0) {
      this.data.set("flagBeenHit", false);
    }

    let totalChips = this.data.get("totalChips");
    let timer = this.data.get("timer");
    let chipGroup = this.data.get("chipGroup");
    let timeText = this.data.get("timeText");
    let chipText = this.data.get("chipText");

    timeText.setText("Time:" + (timer.delay/1000 - Math.floor(timer.getElapsedSeconds())));
    chipText.setText("Chips:" + (totalChips - chipGroup.getLength()) + "/" + totalChips)
  }

  _allChipsCollected() {
    this.data.set("chipsCollected", true);
  }

  _timeOut() {
    // prevent the game over after winning
    let timer = this.data.get("timer");
    timer.destroy();

    let player = this.data.get("player");
    /* Stop the player and prevent the camera from following him anymore */
    player.disableMovement();
    player.disableBody();
    this.cameras.main.stopFollow();

    // Set the player offset to make rotation look cooler
    player.setSpineRelativePosition(-.5, -0);

    /* == Player effect == */
    let playerSpinAndGoUP = this.tweens.add({
      targets: player,
      y: "-= 100",
      duration: 500,
      rotation: Math.PI*4,
      ease: Phaser.Math.Easing.Sine.Out
    });

    let playerFallDown = this.tweens.add({
      targets: player,
      y: "+= 1000",
      delay: 500,
      duration: 1000,
      ease: Phaser.Math.Easing.Sine.In
    });

    /* == Status box fade == */
    let statusBox = this.data.get("statusBox");
    let timeText = this.data.get("timeText");
    let chipText = this.data.get("chipText");
    this.tweens.add({
      targets: [statusBox, timeText, chipText],
      alpha: 0,
      duration: 250,
      // add crazy effects here later
    })
  }

  _levelCompletedSuccessfully() {
    // prevent the game over after winning
    let timer = this.data.get("timer");
    timer.destroy();
    // Destroy the flag collider to prevent clearing the level more than once
    this.flagCollider.destroy();
    // Other level over stuff here.
    let player = this.data.get("player");
    player.disableMovement();
    //Make camera zoom naturally
    let flag = this.data.get("flag");
    this.cameras.main.pan(flag.x, flag.y, 1000, Phaser.Math.Easing.Circular.Out)
    // Zoom in the camera
    this.tweens.add({
      targets: this.cameras.main,
      zoom: 2,
      duration: 1000,
      ease: Phaser.Math.Easing.Circular.Out,
      callback: () => {
        this.cameras.main.stopFollow();

        // After zoom play the arrows
        ArrowScreenTransition.apply({
          scene: this,
          arrowThickness: 150,
          arrowSpeed: 1500,
          duration: 500,
          gapWidth: 50,
          color: 0xf0f000,
          arrowDirection: ArrowScreenTransition.LEFT
        });
      },
      callbackScope: this
    });
  }
}

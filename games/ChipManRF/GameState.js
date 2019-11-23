import { Player } from './player.js';
import { Chip }  from './Chip.js';
import { createFlag } from './Flag.js';
import { ArrowScreenTransition } from './FX/ArrowScreenTransition.js';

class GameState extends Phaser.Scene {
  constructor() {
    super({key: "GameState"});
  }

  preload() {
    this.load.setPath("assets/games/ChipManRF/");
    /* Level Art */
    this.load.image("levelTiles", "levelArt/levelTilemap.png");
    this.load.spritesheet("levelEntities", "levelArt/levelEntities.png", { frameWidth: 32, frameHeight: 32 });
    /* Load Level Data */
    this.load.tilemapTiledJSON("level1", "levelData/level1.json");

    /* ChipMan Spine Load */
    this.load.spine("chipman", "chipman-spine/ChipMan Flash Collection.json", "chipman-spine/ChipMan Flash Collection.atlas", true);

    /* Flag Spine Load */
    this.load.spine("flag", "flag-spine/ChipMan Flag.json", "flag-spine/ChipMan Flag.atlas", true);

    /* Status box */
    this.load.image("status", "graphics/StatusBox.png");

    /* Bitmap font*/
    this.load.bitmapFont("mainFont", "fonts/PressStart/PressStart2P.png", "fonts/PressStart/PressStart2P.fnt");
  }

  create() {
    /* Constants */
    const TILE_WIDTH = 32;
    const TILE_HEIGHT = 32;
    const HORIZONTAL_TILES = 20;
    const VERTICAL_TILES = 74;
    const WORLD_WIDTH = TILE_WIDTH * HORIZONTAL_TILES;
    const WORLD_HEIGHT = TILE_HEIGHT * VERTICAL_TILES;

    /* Game variables */
    this._chipsCollected = false;
    this._totalChips = 0;

    /* Setup camera */
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    /* Setup timer object */
    this.timer = this.time.addEvent();

    /* Chips */
    this.chipGroup = this.physics.add.group({
      delay: 30 * 1000, // default time for level
      callback: this._timeOut,
      callbackScope: this
    });

    this.flag = createFlag(this, 0, 0);

    /* Setup Player */
    this.player = new Player(this, 200, 200);
    this.add.existing(this.player);
    this.cameras.main.startFollow(this.player, true);

    /* Setup Level Tilemap */
    this.tilemap = this.make.tilemap({ key: 'level1' });
    this.tiles = this.tilemap.addTilesetImage("levelTilemap", "levelTiles");
    this.layer = this.tilemap.createStaticLayer(0, this.tiles, 0, 0);
    this.tilemap.setCollisionBetween(1, 6);

    /* Git sum HUD up in here */
    // The hud box that stores the time text and chip count
    this.statusBox = this.add.image(641,-1,"status");
    this.statusBox.setOrigin(1, 0);
    this.statusBox.setDepth(2);
    this.statusBox.setScale(1, .75);
    this.statusBox.setScrollFactor(0);
    this.statusBox.setAlpha(.9);

    // The time text
    //getElapsedSeconds()
    this.timeText = this.add.bitmapText(450, 15, "mainFont", "Time: ", 24, "left");
    this.timeText.setDepth(2);
    this.timeText.setOrigin(0, 0);
    this.timeText.setScrollFactor(0);

    this.chipText = this.add.bitmapText(455, 45, "mainFont", "Chips: ", 16);
    this.chipText.setDepth(2);
    this.chipText.setOrigin(0, 0);
    this.chipText.setScrollFactor(0);

    /* DEBUG STUFF */
    //this.tilemapDebug = this.add.graphics();
    //this.tilemap.renderDebug(this.tilemapDebug);

    /* Layer with the chip positions and player spawn */
    this.objectLayer = this.tilemap.getObjectLayer("Objects");

    /* Map Parameters */
    let playerSpawnPos;

    for (let i = 0; i < this.objectLayer.objects.length; i++) {
      let object = this.objectLayer.objects[i];
      if (object.name == "Player Spawn") {
        playerSpawnPos = object;
      } else if (object.name == "Chip") {
        this.chipGroup.add(new Chip(this, object.x, object.y), true);
      } else if (object.name == "Flag") {
        this.flag.setPosition(object.x, object.y);
      } else if (object.name == "Timer") {
        this.timer.reset({
          delay: object.properties[0].value * 1000, // valid since 'Time' is its only property
          callback: this._timeOut,
          callbackScope: this
        });
      }
    }

    this._totalChips = this.chipGroup.getLength();

    /* Change Player to map's spawn point */
    this.player.setPosition(playerSpawnPos.x, playerSpawnPos.y);

    /* Collision setup */
    this.physics.add.collider(this.player, this.layer);

    /* Chip Collection */
    this.physics.add.overlap(this.player, this.chipGroup, (player, chip) => {
      // Completely clean up the chip (want to make sure no more update calls are passed to it)
      this.chipGroup.remove(chip, true, true);

      if (this.chipGroup.getLength() == 0) {
        this._allChipsCollected();
      }
    })

    this._flagBeenHit = false;
    /* Flag Pole hit */
    this.flagCollider = this.physics.add.overlap(this.player, this.flag, (player, flag) => {
      // Only trigger the animation if the overlap is new.
      if (this._flagBeenHit == false) {
        flag.setAnimation(2, "Pole hit")
        this._flagBeenHit = true;
      }
      // Trigger the end of the level if all chips have been collected
      if (this._chipsCollected) {
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


    /* Test FX */
    ArrowScreenTransition.apply({
      scene: this,
      arrowThickness: 200,
      arrowDirection: ArrowScreenTransition.RIGHT
    });
  }

  _allChipsCollected() {
    this._chipsCollected = true;
  }

  _timeOut() {
    // prevent the game over after winning
    this.timer.destroy();

    /* Stop the player and prevent the camera from following him anymore */
    this.player.disableMovement();
    this.player.disableBody();
    this.cameras.main.stopFollow();

    // Set the player offset to make rotation look cooler
    this.player.setSpineRelativePosition(-.5, -0);

    /* == Player effect == */
    let playerSpinAndGoUP = this.tweens.add({
      targets: this.player,
      y: "-= 100",
      duration: 500,
      rotation: Math.PI*4,
      ease: Phaser.Math.Easing.Sine.Out
    });

    let playerFallDown = this.tweens.add({
      targets: this.player,
      y: "+= 1000",
      delay: 500,
      duration: 1000,
      ease: Phaser.Math.Easing.Sine.In
    });

    /* == Status box fade == */
    this.tweens.add({
      targets: [this.statusBox, this.timeText, this.chipText],
      alpha: 0,
      duration: 250,
      // add crazy effects here later
    })
  }

  _levelCompletedSuccessfully() {
    // prevent the game over after winning
    this.timer.destroy();
    // Destroy the flag collider to prevent clearing the level more than once
    this.flagCollider.destroy();
    // Other level over stuff here.
    this.player.disableMovement();
    //Make camera zoom naturally
    this.cameras.main.pan(this.flag.x, this.flag.y, 1000, Phaser.Math.Easing.Circular.Out)
    // Zoom in the camera
    this.tweens.add({
      targets: this.cameras.main,
      zoom: 2,
      duration: 1000,
      ease: Phaser.Math.Easing.Circular.Out,
      callback: () => {
        this.cameras.main.stopFollow();
      },
      callbackScope: this
    })
  }

  update() {
    // Once the player stops touching the flag (or stops moving) re-enable the hit animation
    if (this.flag.body.overlapX == 0 && this.flag.body.overlapY == 0) {
      this._flagBeenHit = false;
    }

    this.timeText.setText("Time:" + (this.timer.delay/1000 - Math.floor(this.timer.getElapsedSeconds())));
    this.chipText.setText("Chips:" + (this._totalChips - this.chipGroup.getLength()) + "/" + this._totalChips)
  }
}

export { GameState };

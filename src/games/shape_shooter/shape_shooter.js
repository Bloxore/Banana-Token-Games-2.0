
import { Ship } from './ship.js';
import { EnemyWaveSpawner } from './EnemyWaveSpawner.js';

const GAMEURL = "games/shape_shooter";

class GameState extends Phaser.Scene {

  constructor() {
    super({key: "GameState"});

    this.ship;
    this.bullets;
    this.enemies;
    this.waveSpawner;
  }

  preload() {
    this.load.atlas('assets', 'assets/games/breakout/breakout.png', 'assets/games/breakout/breakout.json');
  }

  create() {
    //Sprites
    this.ship = new Ship(this, 320, 440, 'assets', 'paddle1');

    this.enemies = this.add.group();

    this.bullets = this.add.group();

    this.waveSpawner = new EnemyWaveSpawner(this, this.enemies);

    // Load enemy waves
    this.waveSpawner.loadWaveData(GAMEURL + "/enemyWaves/wave0.txt");
    this.waveSpawner.onDoneLoading(() => {
      this.waveSpawner.startWave(0);
    })

    //Inputs
    this.up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.action = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

    //Physics

    //Bullet to enemy collision
    this.physics.add.overlap(this.enemies, this.bullets, (enemy, bullet) => {
      enemy.destroy();
      bullet.destroy();
    });
  }

  update() {
    //Ship velocity should always be zero if no inputs
    this.ship.body.velocity.x = 0;
    this.ship.body.velocity.y = 0;

    if (this.left.isDown) {
      this.ship.moveLeft();
    } else if (this.right.isDown && !this.left.isDown) {
      this.ship.moveRight();
    }
    if (this.action.isDown) {
      if (this.ship.isReadyToFire()) {
        this.ship.resetCoolDown();
        this._shoot(this.ship);
      }
    }
  }

  _shoot(ship) {
    let ball = this.physics.add.image(ship.x, ship.y, 'assets', 'ball1');
    ball.body.velocity.y = -500;

    this.bullets.add(ball);
  }

  /*
    Creates a wave of enemies.
  */
  _createEnemyWave(rowMin, rowMax, columnMin, columnMax) {
    let rows = this._randomIntRange(rowMax, rowMin);

    for (let i = 0; i < rows; i++) {
      let columns = this._randomIntRange(columnMax, columnMin);
      let column_spacing = this
    }
  }

  _randomIntRange(max, min) {
    return Math.floor(Math.random() * Math.floor(max - min)) + min;
  }
}

let config = {
    type: Phaser.WEBGL,
    width: 640,
    height: 480,
    scale: {
      parent: "game",
      mode: Phaser.Scale.FIT,
      width: 640,
      height: 480
    },
    scene: [ GameState ],
    physics: {
        default: 'arcade'
    }
};

export { config };

import { Ball } from './Ball.js';
import { CueBall } from './CueBall.js';
import { PoolTable } from './PoolTable.js';

const PLAYER_ID = 0; //This is temporary
const SHOT_SPEED = 1000;
const PLAYER_ANGLE = Math.random() * Math.PI*2;

class GameState extends Phaser.Scene {
  constructor() {
    super({key: "GameState"});
  }

  preload() {
    this.load.spritesheet("cueball", "assets/EightBomb/cueball.png", {frameWidth: 32, frameHeight: 32});
    this.load.image("pooltable", "assets/EightBomb/pooltable.png");
    this.load.image("hole", "assets/EightBomb/hole.png");

    this.load.text("ballLayout", "assets/EightBomb/ballLayout.txt");
    this.load.text("ballColors", "assets/EightBomb/ballColors.txt");
  }

  create() {
    this.children.sortChildrenFlag = true;

    /* Generate the colors for the pool balls */
    this.ballColors = [];
    let ballText = this.cache.text.get("ballColors");
    let colors = ballText.split("\n");
    for (let i = 0; i < colors.length; i++) {
      if (colors[i] == "") {
        continue;
      }
      let data = colors[i].split(",");
      let name = data[0].trim();
      let r = parseInt(data[1].trim());
      let g = parseInt(data[2].trim());
      let b = parseInt(data[3].trim());
      this.generateChangedColorTexture("cueball", name, r, g, b);
      this.ballColors.push("cueball-" + name);
    }

    /* Pool table */
    this._poolTable = new PoolTable(this, 0, 0, "pooltable")
    this.add.existing(this._poolTable);

    /* Players */
    this._playerCues = [];
    this._ballGroup = this.add.group();

    /* Ball flags */
    this._ballsMoving = false;

    /* Holes */
    this._holes = this.physics.add.group({ immovable: true });

    this._holes.add(new Phaser.GameObjects.Sprite(this, this._poolTable.x - this._poolTable.width / 2 + 28, this._poolTable.y - this._poolTable.height / 2 + 28, "hole"), true)
    this._holes.add(new Phaser.GameObjects.Sprite(this, this._poolTable.x, this._poolTable.y - this._poolTable.height / 2 + 28, "hole"), true)
    this._holes.add(new Phaser.GameObjects.Sprite(this, this._poolTable.x + this._poolTable.width / 2 - 28, this._poolTable.y - this._poolTable.height / 2 + 28, "hole"), true)

    this._holes.add(new Phaser.GameObjects.Sprite(this, this._poolTable.x - this._poolTable.width / 2 + 28, this._poolTable.y + this._poolTable.height / 2 - 28, "hole"), true)
    this._holes.add(new Phaser.GameObjects.Sprite(this, this._poolTable.x, this._poolTable.y + this._poolTable.height / 2 - 28, "hole"), true)
    this._holes.add(new Phaser.GameObjects.Sprite(this, this._poolTable.x + this._poolTable.width / 2 - 28, this._poolTable.y + this._poolTable.height / 2 - 28, "hole"), true)

    for (let i = 0; i < 4; i++) {
      this._playerCues.push(this.addBallToScene(0, 0, true));
      this._playerCues[i].setShotSpeed(SHOT_SPEED);
      this._playerCues[i].enableFiring();
    }

    this._playerCues[0].setPosition(this.cameras.main.centerX - 200, this.cameras.main.centerY - 100);
    this._playerCues[1].setPosition(this.cameras.main.centerX - 200, this.cameras.main.centerY + 100);
    this._playerCues[2].setPosition(this.cameras.main.centerX + 200, this.cameras.main.centerY - 100);
    this._playerCues[3].setPosition(this.cameras.main.centerX + 200, this.cameras.main.centerY + 100);

    //Add balls
    /*let textBalls = this.cache.text.get('ballLayout').split("\n");
    for (let i = 0; i < textBalls.length; i++) {
      if (textBalls[i] == "") {
        textBalls.splice(i, 1);
        i--;
        continue;
      }
      textBalls[i] = textBalls[i].split(",");
      textBalls[i][0] = parseInt(textBalls[i][0]);
      textBalls[i][1] = parseInt(textBalls[i][1]);
    }
    this.addBallsFromArray(textBalls);*/

    /* Set collision for cues */
    this.physics.add.collider(this._ballGroup, this._poolTable, () => {
      this.cameras.main.shake(100, 0.001);
    });

    this.physics.add.overlap(this._ballGroup, this._poolTable, (ball, table) => {
      if (table.pushing.x != 0) {
        ball.x = table.x + table.width*table.pushing.x + (ball.width / 2)*table.pushing.x;
        if (ball.body.velocity.x / Math.abs(ball.body.velocity.x) != table.pushing.x) {
          ball.body.velocity.x *= -1;
        }
      }
      if (table.pushing.y != 0) {
        ball.y = table.y + table.height*table.pushing.y + (ball.height / 2)*table.pushing.y;
        if (ball.body.velocity.y / Math.abs(ball.body.velocity.y) != table.pushing.y) {
          ball.body.velocity.y *= -1;
        }
      }
    });

    // Collides balls with each other
    let ballCollider = this.physics.add.collider(this._ballGroup);
    ballCollider.collideCallback = (ball1, ball2) => {
      this.cameras.main.shake(100, 0.001);
      if (ball1.isCueBall()) {
        ball2._lastHit = ball1;
      }
      if (ball2.isCueBall()) {
        ball1._lastHit = ball2;
      }

      if (!ball1.isCueBall() && !ball2.isCueBall()) {
        let hits = [];
        if (ball1._lastHit != null) {
          hits.push(ball1._lastHit);
        }
        if (ball2._lastHit != null) {
          hits.push(ball2._lastHit);
        }

        if (hits.length != 0) {
          let newHit = hits[Math.floor(Math.random()*hits.length)];
          ball1._lastHit = newHit;
          ball2._lastHit = newHit;
        }
      }
    };

    this.physics.add.overlap(this._ballGroup, this._holes, (ball, hole) => {
      //Cue balls will act differently when sunk
      if (!ball.isCueBall()) {
        this._ballGroup.remove(ball);
        ball.fallAndDestroy(hole.x, hole.y);
      }
    });

    /* Server connection test */
    this.client = new Colyseus.Client("ws://localhost:3000");

    this.room = this.client.join("GameRoom");
    this.room.onJoin.add(() => {
      console.log(this.client.id, "joined", this.room.name);
    });
    this.room.onMessage.add((msg) => {
      let firstColon = msg.search(":");
      let name = msg.slice(0, firstColon);
      let data = JSON.parse(msg.slice(firstColon + 1));
      if (name == "BALL") {
        console.log(data);
      }
    })
  }

  update() {
    /* Check to see if every ball is ready, if so fire */
    let _allBallsAreReady = true;
    for (let i = 0; i < this._playerCues.length; i++) {
      if (this._playerCues[i].isReady() == false)
        _allBallsAreReady = false;
    }

    if (_allBallsAreReady) {
      this.releaseBalls();
    }

    if (this._ballsMoving) {
      let _allBallsStationary = true;
      for (let i = 0; i < this._playerCues.length; i++) {
        if (this._playerCues[i].body.velocity.x > 0 || this._playerCues[i].body.velocity.y > 0)
          _allBallsStationary = false;
      }

      if (_allBallsStationary) {
        this._ballsMoving = false;
        this.enableBalls();
      }
    }

  }

  generateChangedColorTexture(key, name, newR, newG, newB) {
    /* The multicolored balls */
    let sheet = this.game.textures.get(key).getSourceImage();
    let texture = this.game.textures.createCanvas(key + "-" + name + "-tint", sheet.width, sheet.height);
    let canvas = texture.getSourceImage();
    let context = canvas.getContext('2d');

    context.drawImage(sheet, 0, 0);

    let imageData = context.getImageData(0, 0, sheet.width, sheet.height);
    let pixelArray = imageData.data;

    for (let p = 0; p < pixelArray.length / 4; p++) {
      let index = 4 * p;

      let r = pixelArray[index];
      let g = pixelArray[++index];
      let b = pixelArray[++index];
      let alpha = pixelArray[++index];

      // If this is a transparent pixel, ignore, move on.

      //Alerted of purple texture spots, pallet swap
      if (r == 255 && g == 0 && b == 255) {
          let darkness = 255 - alpha;
          pixelArray[index] = 255; //Make opaque again
          pixelArray[--index] = newB - darkness;
          pixelArray[--index] = newG - darkness;
          pixelArray[--index] = newR - darkness;
      }
    }

    context.putImageData(imageData, 0, 0);

    // Add the canvas as a sprite sheet to the game.
    return this.game.textures.addSpriteSheet(key + "-" + name, texture.getSourceImage(), {
        frameWidth: 32,
        frameHeight: 32,
    });
  }

  //Relative to center of screen
  addBallsFromArray(positions) {
    let shuffledPositions = shuffleArray(positions);
    let i = 0;
    this.time.addEvent({
      delay: 10,
      repeat: shuffledPositions.length - 1,
      callback: () => {
        let newBall = this.addBallToScene(shuffledPositions[i][0] + this.cameras.main.centerX, shuffledPositions[i][1] + this.cameras.main.centerY);
        newBall.dropFromAbove();
        newBall.setTexture(this.ballColors[Math.floor(Math.random()*this.ballColors.length)])
        if (shuffledPositions[i][2].trim() == "STRIPES") {
          newBall.changeType(Ball.STRIPES);
        }
        i++;
      }
    });
  }

  enableBalls() {
    for (let i = 0; i < this._playerCues.length; i++) {
      this._playerCues[i].enableFiring();
    }
  }

  releaseBalls() {
    this._ballsMoving = true;
    for (let i = 0; i < this._playerCues.length; i++) {
      this._playerCues[i].activateFire();
    }
  }

  addBallToScene(x, y, cue = false) {
    let newBall;
    if (cue) {
      newBall = new CueBall(this, x, y);
    } else {
      newBall = new Ball(this, x, y);
    }
    this._ballGroup.add(newBall, true)
    return newBall
  }
}

/* Helper function */
function shuffleArray(arr) {
  let cloneArr = arr.slice(0);
  let shuffleArr = [];
  for (let i = 0; i < cloneArr.length; i++) {
    let randomIndex = Math.floor(Math.random()*cloneArr.length);
    shuffleArr.push(cloneArr[randomIndex]);
    cloneArr.splice(randomIndex, 1);
    i--;
  }

  return shuffleArr;
}

export { GameState };

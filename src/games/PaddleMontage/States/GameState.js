import { GameModelState } from "../Models/GameModelState.js";
import { PADDLELONGWAYSSIZE, PADDLESHORTWAYSSIZE } from "../Objects/Paddle.js";

export class GameState extends Phaser.Scene {
  constructor() {
    super({key: "GameState"});
  }

  preload() {
  }

  create() {
    // Create the local GameModel
    this.gameModel = new GameModelState();
    this.game.scene.add("GameModelState", this.gameModel, true);

    // Have a buncha visual paddles
    this.verticalPaddles = [];
    this.horizontalPaddles = [];
    this.balls = [];
    this.obstacles = [];
  }

  update(time, delta) {
    this.gameModel.queueInput(this.input);
    this.gameModel.step(delta);

    // Make sure the number of paddles, obstacles, and balls match with the model
    // Paddles
    while (this.verticalPaddles.length < this.gameModel.verticalPaddles.length) {
      this.addVerticalPaddle();
    }
    while (this.verticalPaddles.length > this.gameModel.verticalPaddles.length) {
      this.removeVerticalPaddle();
    }
    while (this.horizontalPaddles.length < this.gameModel.horizontalPaddles.length) {
      this.addHorizontalPaddle();
    }
    while (this.horizontalPaddles.length > this.gameModel.horizontalPaddles.length) {
      this.removeHorizontalPaddle();
    }
    // Balls
    while (this.balls.length < this.gameModel.balls.length) {
      this.addBall();
    }
    while (this.balls.length > this.gameModel.balls.length) {
      this.removeBall();
    }
    // Obstacles
    while (this.obstacles.length < this.gameModel.obstacles.length) {
      this.addObstacle();
    }
    while (this.obstacles.length > this.gameModel.obstacles.length) {
      this.removeObstacle();
    }

    // Update the stuff from the model in the view
    for (let i = 0; i < this.gameModel.verticalPaddles.length; i++) {
      let paddlePos = this.gameModel.verticalPaddles[i].getPosition();
      this.verticalPaddles[i].x = paddlePos.x;
      this.verticalPaddles[i].y = paddlePos.y;
    }

    for (let i = 0; i < this.gameModel.horizontalPaddles.length; i++) {
      let paddlePos = this.gameModel.horizontalPaddles[i].getPosition();
      this.horizontalPaddles[i].x = paddlePos.x;
      this.horizontalPaddles[i].y = paddlePos.y;
    }

    for (let i = 0; i < this.gameModel.balls.length; i++) {
      let ballPos = this.gameModel.balls[i].getPosition();
      this.balls[i].x = ballPos.x;
      this.balls[i].y = ballPos.y;
    }

    for (let i = 0; i < this.gameModel.obstacles.length; i++) {
      let obstaclePos = this.gameModel.obstacles[i].getPosition();
      this.obstacles[i].x = obstaclePos.x;
      this.obstacles[i].y = obstaclePos.y;
    }
  }

  addHorizontalPaddle() {
    this.horizontalPaddles.push(new Phaser.GameObjects.Graphics(this));
    this.add.existing(this.horizontalPaddles[this.horizontalPaddles.length - 1]);
    this.horizontalPaddles[this.horizontalPaddles.length - 1].fillStyle(0xFFFFFF, 1.0);
    this.horizontalPaddles[this.horizontalPaddles.length - 1].fillRect(0, 0, PADDLELONGWAYSSIZE, PADDLESHORTWAYSSIZE);
  }

  removeHorizontalPaddle() {
    this.horizontalPaddles.pop().destroy();
  }

  addVerticalPaddle() {
    this.verticalPaddles.push(new Phaser.GameObjects.Graphics(this));
    this.add.existing(this.verticalPaddles[this.verticalPaddles.length - 1]);
    this.verticalPaddles[this.verticalPaddles.length - 1].fillStyle(0xFFFFFF, 1.0);
    this.verticalPaddles[this.verticalPaddles.length - 1].fillRect(0, 0, PADDLESHORTWAYSSIZE, PADDLELONGWAYSSIZE);
  }

  removeVerticalPaddle() {
    this.verticalPaddles.pop().destroy();
  }

  addBall() {
    this.balls.push(new Phaser.GameObjects.Graphics(this));
    this.add.existing(this.balls[this.balls.length - 1]);
  }

  removeBall() {
    this.balls.pop().destroy();
  }

  addObstacle() {
    this.obstacles.push(new Phaser.GameObjects.Graphics(this));
    this.add.existing(this.obstacles[this.obstacles.length - 1]);
  }

  removeObstacle() {
    this.obstacles.pop().destroy();
  }
}

import { Paddle, HORIZONTAL, VERTICAL } from '../Objects/Paddle.js';
/*
  Game consists of a few basic elements
  Vertical Paddles
  Horizontal Paddles
  Obstacles
  Ball

  The trick I'm going to pull is that the GameStateModel will be running it's
  own scene. The GameState can then request info from the GameStateModel
*/
export class GameModelState extends Phaser.Scene {
  constructor() {
    super({key:"GameModelState"});
  }

  create() {
    // I need the paddles, balls, and Obstacles exposed so that
    //  the gamestate can read and display them
    this.verticalPaddles = [];
    this.horizontalPaddles = [];
    this.balls = [];
    this.obstacles = [];

    // Pause this state immediately
    this.scene.pause();

    // Input queue
    this.inputs = []; // push() to enqueue; shift() to dequeue

    // Test
    this.addVerticalPaddle();
  }

  /*
    Progresses the state forward by one frame
  */
  step(delta) {
    let stepDelta = delta;
    if (!delta) {
      stepDelta = 1/60;
    }

    // Using the input data from elsewhere, perform all the pre-physics
    //  operations here.
    let input = this.inputs.shift();

    // Then proceed with the frame
    this.sys.step(Date.now(),stepDelta);
  }

  /*
    Expects a scene.input here
    Instead of an entire scene input it'd probably be pretty easy to
      just have binary encoded integer here. The bits can represent whether
      certain keys are pressed down. Might just be easier than passing a whole
      huge object everytime.
      // TODO: do this later
  */
  queueInput(sceneInput) {
    this.inputs.push(sceneInput);
  }

  /*
    Adding and removing of game elements
  */
  addHorizontalPaddle() {
    this.horizontalPaddles.push(new Paddle(this, HORIZONTAL, 0, 0));
    this.add.existing(this.horizontalPaddles[this.horizontalPaddles.length - 1]);
  }

  removeHorizontalPaddle() {
    this.horizontalPaddles.pop().destroy();
  }

  addVerticalPaddle() {
    this.verticalPaddles.push(new Paddle(this, VERTICAL, 0, 0));
    this.add.existing(this.verticalPaddles[this.verticalPaddles.length - 1]);
  }

  removeVerticalPaddle() {
    this.verticalPaddles.pop().destroy();
  }

  // TODO
  addBall() {
    this.balls.push(new Ball(this));
    this.add.existing(this.balls[this.balls.length - 1]);
  }

  removeBall() {
    this.balls.pop().destroy();
  }

  // TODO
  addObstacle() {
    this.obstacles.push(new Obstacle(this));
    this.add.existing(this.obstacles[this.obstacles.length - 1]);
  }

  removeObstacle() {
    this.obstacles.pop().destroy();
  }
}

const PLAYER_RUN_ACCELERATION = 1100;
const PLAYER_RUN_SPEED = 250;
const PLAYER_AIR_ACCELERATION = 2000; // How much ChipMan can move in the air

const JUMP_GRACE_PERIOD = 2; // Amount of time you have to jump after leaving a ledge in frames
const PRE_JUMP_GRACE = 10; // Amount of time you can jump before landing and the game will still register it.

// Amount of frames you can start moving the opposite direction after letting go of the
// original direction and keep your original speed. (Even if in the air)
const TURN_AROUND_GRACE = 0;
const TURN_AROUND_AIR_GRACE = 0;

const GRAVITY = 600;
const JUMP_BURST = -450;

const TERMINAL_VELOCITY = 600;

const BLINK_RANGE = [1000, 5000]; // Milliseconds between blinks
/* Spine Game Objects are difficult to locate so for now "Player" will be a sudo
   class of sorts */
class Player extends Phaser.GameObjects.Container {
  constructor(scene,x, y) {
    super(scene, x, y);
    this.uniqueID = Math.random();

    //Render above chips
    this.depth = 2;

    this.spine = this.scene.add.spine(13, 14.5, "chipman");

    this.spine.setAnimation(0, "run", true);

    //Add the spine to the Player container object
    this.add(this.spine);

    /* Physics setup */
    this.scene.physics.add.existing(this);
    this.body.setCollideWorldBounds(true);
    // Gonna implement my own gravity.. whatevs
    this.body.setAccelerationY(GRAVITY);

    //Terminal velocity under regular cirumstances
    this.body.setMaxVelocity(PLAYER_RUN_SPEED, TERMINAL_VELOCITY);

    // World bounds event
    this.body.onWorldBounds = true;

    /* Scale */
    this.spine.setScale(.14);

    /* Adjust collision box */
    this.body.setSize(24, 32);
    this.body.setOffset(0, -18);

    /* Variable to track when last the player was touching the ground */
    this.framesSinceGrounded = -1;
    this.bufferJump = -1;

    this.latestActiveHorizontalVelocity = 0;
    this.framesSinceMovingHorizontally = 0;

    /* Sometimes the player may jump while slaming which will prove
       very unsatifactory because the jump will be canceled. This flag prevents
       that exact case from happening */
    this.slamCancel = false;

    // Flag to be set to true when the player dies.
    this.dead = false;

    /* Control over whether the player can move */
    this._enableMovement = true;

    /* Animation mixes */
    this.spine.setMix("idle", "run", .1);
    this.spine.setMix("run", "idle", .1);
    this.spine.setMix("run", "jump", .1);
    this.spine.setMix("idle", "jump", .1);
    this.spine.setMix("jump", "run", .1);
    this.spine.setMix("jump", "idle", .1);

    /* Blinking */
    this.blinkTimer = this.scene.time.addEvent({
      delay: Math.random()*(BLINK_RANGE[1] - BLINK_RANGE[0]) + BLINK_RANGE[0],
      callback: this.blink,
      callbackScope: this
    });

    /* Define controls here */
    let keyboard = scene.input.keyboard;

    this.left_key = keyboard.addKey("a");
    this.right_key = keyboard.addKey("d");
    this.up_key = keyboard.addKey("w");
    this.down_key = keyboard.addKey("s");

    /* Jumping */
    this.up_key.on("down", () => {
      if (this._enableMovement) {
        // Only allow jumping if touching the floor
        if (this.framesSinceGrounded >= 0 && this.framesSinceGrounded <= JUMP_GRACE_PERIOD) {
          //Enable slam cancel if the down_key is also pressed
          if (this.down_key.isDown) {
            this.slamCancel = true;
          }
          this.body.setVelocityY(JUMP_BURST);
        } else {
          this.bufferJump = 0;
        }
      }
    });

    this.up_key.on("up", () => {
      if (this._enableMovement) {
        //The slam cancel should be canceled when the player stops pressing the jump key
        this.slamCancel = false;
      }
    })

    /* The player object is complex, and because of that the possibility of subpixel
        camera following is much more of a problem. Thus reducing the point to following
        to a single object is the best move */
    this.follow_point = new Phaser.Geom.Point(this.x, this.y)
  }

  preUpdate() {

    /* Set the grounded flag to 0 frames when the player is on the ground */
    if (this.body.onFloor()) {
      // Landing resets the player's terminal velocity in case they were slaming
      this.body.setMaxVelocity(PLAYER_RUN_SPEED, -JUMP_BURST);

      this.framesSinceGrounded = 0;
      // If the jump button was pressed before the grace period has elasped process the jump
      if (this.bufferJump <= PRE_JUMP_GRACE && this.bufferJump >= 0) {
        this.body.setVelocityY(JUMP_BURST);
        this.bufferJump = -1;
      }
    } else {
      if (this.body.velocity.y < 0) {
        this.body.setMaxVelocity(PLAYER_RUN_SPEED, TERMINAL_VELOCITY);
      }
      this.framesSinceGrounded++;
      // Only increment the buffer is an actual jump has been inputed
      if (this.bufferJump >= 0) {
          this.bufferJump++;
      }
    }

    // Body should not keep accelerating unless the user explicitly wants
    //  it too.
    this.body.setAccelerationX(0);


    // Don't even consider input related consequences during disabled movment
    if (this._enableMovement) {
      if (this.left_key.isDown && this.right_key.isDown) {
        /* Do nothing */
        if (this.body.onFloor()) {
          /* Stop horizontal movement immediately when on the ground */
          this.body.setVelocityX(0);

          this.spine.setAnimation(0, "idle", true, true);
        }

        this.framesSinceMovingHorizontally++;
      }
      else if (this.left_key.isDown) {
        // For quick turn arounds (makes it feel more like the original)
        if (this.latestActiveHorizontalVelocity > 0 &&
            this.framesSinceMovingHorizontally <= TURN_AROUND_GRACE &&
            this.framesSinceGrounded <= TURN_AROUND_AIR_GRACE) {
          this.body.setVelocityX(-this.latestActiveHorizontalVelocity);
        }
        if (this.body.onFloor()) {
          this.body.setAccelerationX(-PLAYER_RUN_ACCELERATION);
        } else {
          this.body.setAccelerationX(-PLAYER_AIR_ACCELERATION);
        }
        this.spine.scaleX = -.14;
        this.body.setOffset(2, -18);
        // Only show run animation if on the ground
        if (this.body.onFloor()) {
          this.spine.setAnimation(0, "run", true, true);
        }

        this.latestActiveHorizontalVelocity = this.body.velocity.x;
        this.framesSinceMovingHorizontally = 0;
      }
      else if (this.right_key.isDown) {
        // For quick turn arounds (makes it feel more like the original)
        if (this.latestActiveHorizontalVelocity < 0 &&
            this.framesSinceMovingHorizontally <= TURN_AROUND_GRACE &&
            this.framesSinceGrounded <= TURN_AROUND_AIR_GRACE) {
          this.body.setVelocityX(-this.latestActiveHorizontalVelocity);
        }
        if (this.body.onFloor()) {
          this.body.setAccelerationX(PLAYER_RUN_ACCELERATION);
        } else {
          this.body.setAccelerationX(PLAYER_AIR_ACCELERATION);
        }
        this.spine.scaleX = .14;
        this.body.setOffset(0, -18);
        // Only show run animation if on the ground
        if (this.body.onFloor()) {
          this.spine.setAnimation(0, "run", true, true);
        }

        this.latestActiveHorizontalVelocity = this.body.velocity.x;
        this.framesSinceMovingHorizontally = 0;
      }
      else {
        //Turn off running animation when stationary
        if (this.body.onFloor()) {
          /* Stop horizontal movement immediately when on the ground */
          this.body.setVelocityX(0);

          this.spine.setAnimation(0, "idle", true, true);
        }

        this.framesSinceMovingHorizontally++;
      }

      /*
        If chipman is not grounded he must be arial, thus start the jumping animation
      */
      if (!this.body.onFloor()) {
        // Only play the animation a single time
        if (this.spine.getCurrentAnimation().name != "jump") {
            this.spine.setAnimation(0, "jump", false, true);
        }
      }


      /* Slaming down is always available */
      if (this.down_key.isDown && this.slamCancel == false) {
        //Change the maximum falling speed
        this.body.setMaxVelocity(PLAYER_RUN_SPEED, TERMINAL_VELOCITY);

        this.body.setVelocityY(600);
      }
    }

    // Update the follow point no matter what is going on
    this.follow_point.x = Math.round(this.x);
    this.follow_point.y = Math.round(this.y);
  }

  disableMovement() {
    this.up_key.reset();
    this.down_key.reset();
    this.left_key.reset();
    this.right_key.reset();

    this.spine.setAnimation(0, "idle", true, true);

    this.body.setAccelerationX(0);
    this.body.setVelocityX(0);

    this._enableMovement = false;
  }

  enableMovement() {
    this._enableMovement = true;
  }

  disableBody() {
    this.body.setEnable(false);
  }

  enableBody() {
    this.body.setEnable(true);
  }

  destroy(fromScene) {
    this.up_key.destroy();
    this.down_key.destroy();
    this.left_key.destroy();
    this.right_key.destroy();

    this.blinkTimer.destroy();

    this.spine.destroy(fromScene);

    Phaser.GameObjects.Container.prototype.destroy.call(this, fromScene);
  }

  setSpineRelativePosition(x, y) {
    this.spine.x += x*this.body.width;
    this.spine.y += y*this.body.height;

    this.x -= x*this.body.width;
    this.y -= y*this.body.height
  }

  /* Handler for blinking */
  blink() {
    this.spine.setAnimation(1, "blink");
    this.blinkTimer.reset({
      delay: Math.random()*(BLINK_RANGE[1] - BLINK_RANGE[0]) + BLINK_RANGE[0],
      callback: this.blink,
      callbackScope: this,
      repeat: 1,
    })
  }
}

export { Player };

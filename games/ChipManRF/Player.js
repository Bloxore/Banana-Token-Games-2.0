const PLAYER_RUN_SPEED = 230;
const JUMP_GRACE_PERIOD = 2; // Amount of time you have to jump after leaving a ledge in frames
const PRE_JUMP_GRACE = 10; // Amount of time you can jump before landing and the game will still register it.

const REG_TERMINAL_VELOCITY = 300;
const SLAME_TERMINAL_VELOCITY = 600;

/* Spine Game Objects are difficult to locate so for now "Player" will be a sudo
   class of sorts */
class Player extends Phaser.GameObjects.Container {
  constructor(scene,x, y) {
    super(scene, x, y);

    //Render above chips
    this.depth = 2;

    this.spine = this.scene.add.spine(13, 15, "chipman");

    this.spine.play("run", true);

    //Add the spine to the Player container object
    this.add(this.spine);

    /* Physics setup */
    this.scene.physics.add.existing(this);
    this.body.setCollideWorldBounds(true);
    // Gonna implement my own gravity.. whatevs
    this.body.setAccelerationY(300);

    //Terminal velocity under regular cirumstances
    this.body.setMaxVelocity(PLAYER_RUN_SPEED, REG_TERMINAL_VELOCITY);

    /* Scale */
    this.spine.setScale(.14);

    /* Adjust collision box */
    this.body.setSize(24, 32);
    this.body.setOffset(0, -18);

    /* Variable to track when last the player was touching the ground */
    this.framesSinceGrounded = -1;
    this.bufferJump = -1;

    /* Sometimes the player may jump while slaming which will prove
       very unsatifactory because the jump will be canceled. This flag prevents
       that exact case from happening */
    this.slamCancel = false;

    /* Define controls here */
    let keyboard = scene.input.keyboard;

    this.left_key = keyboard.addKey("a");
    this.right_key = keyboard.addKey("d");
    this.up_key = keyboard.addKey("w");
    this.down_key = keyboard.addKey("s");

    /* Jumping */
    this.up_key.on("down", () => {
      // Only allow jumping if touching the floor
      if (this.framesSinceGrounded >= 0 && this.framesSinceGrounded <= JUMP_GRACE_PERIOD) {
        //Enable slam cancel if the down_key is also pressed
        if (this.down_key.isDown) {
          this.slamCancel = true;
        }
        this.body.setVelocityY(-375);
      } else {
        this.bufferJump = 0;
      }
    });

    this.up_key.on("up", () => {
      //The slam cancel should be canceled when the player stops pressing the jump key
      this.slamCancel = false;
    })
  }

  preUpdate() {
    /* Stop horizontal movement, it isn't realistic but its how the
       original played */
    this.body.setVelocityX(0);

    /* Set the grounded flag to 0 frames when the player is on the ground */
    if (this.body.onFloor()) {
      // Landing resets the player's terminal velocity in case they were slaming
      this.body.setMaxVelocity(PLAYER_RUN_SPEED, REG_TERMINAL_VELOCITY);

      this.framesSinceGrounded = 0;
      // If the jump button was pressed before the grace period has elasped process the jump
      if (this.bufferJump <= PRE_JUMP_GRACE && this.bufferJump >= 0) {
        this.body.setVelocityY(-375);
        this.bufferJump = -1;
      }
    } else {
      this.framesSinceGrounded++;
      // Only increment the buffer is an actual jump has been inputed
      if (this.bufferJump >= 0) {
          this.bufferJump++;
      }
    }

    if (this.left_key.isDown && this.right_key.isDown) {
      /* Do nothing */
    }
    else if (this.left_key.isDown) {
      this.body.setVelocityX(-PLAYER_RUN_SPEED);
      this.spine.scaleX = -.14;
      this.body.setOffset(2, -18);
    }
    else if (this.right_key.isDown) {
      this.body.setVelocityX(PLAYER_RUN_SPEED);
      this.spine.scaleX = .14;
      this.body.setOffset(0, -18);
    }

    /* Slaming down is always available */
    if (this.down_key.isDown && this.slamCancel == false) {
      //Change the maximum falling speed
      this.body.setMaxVelocity(PLAYER_RUN_SPEED, SLAME_TERMINAL_VELOCITY);

      this.body.setVelocityY(600);
    }
  }
}

export { Player };

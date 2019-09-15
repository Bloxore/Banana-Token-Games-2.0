const PLAYER_RUN_SPEED = 250;

/* Spine Game Objects are difficult to locate so for now "Player" will be a sudo
   class of sorts */
class Player extends Phaser.GameObjects.Container {
  constructor(scene,x, y) {
    super(scene, x, y);

    this.spine = this.scene.add.spine(13, 14, "chipman");

    this.spine.play("run", true);

    //Add the spine to the Player object
    this.add(this.spine);

    /* Physics setup */
    this.scene.physics.add.existing(this);
    this.body.setCollideWorldBounds(true);
    // Gonna implement my own gravity.. whatevs
    this.body.setAccelerationY(300);

    /* Scale */
    this.spine.setScale(.14);

    /* Adjust collision box */
    this.body.setSize(24, 32);
    this.body.setOffset(0, -18);

    /* Define controls here */
    let keyboard = scene.input.keyboard;

    this.left_key = keyboard.addKey("a");
    this.right_key = keyboard.addKey("d");
    this.up_key = keyboard.addKey("w");
    this.down_key = keyboard.addKey("s");

    /* Jumping */
    this.up_key.on("down", () => {
      // Only allow jumping if touching the floor
      if (this.body.onFloor()) {
        this.body.setVelocityY(-375);
      }
    })

    /* Slam */
    this.down_key.on("down", () => {
      this.body.setVelocityY(600);
    })
  }

  preUpdate() {
    /* Stop horizontal movement, it isn't realistic but its how the
       original played */
    this.body.setVelocityX(0);

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
  }
}


function generatePlayer(scene, x, y) {
  let player = scene.add.spine(x, y, "chipman");

  /* Physics setup */
  scene.physics.add.existing(player);
  player.body.setCollideWorldBounds(true);
  // Gonna implement my own gravity.. whatevs
  player.body.setAccelerationY(300);

  /* Scale */
  player.setScale(.15);
  console.log(player.height)

  /* Adjust collision box */
  player.body.setSize(player.width + 6, player.height + 18);
  player.body.setOffset(0, -18);

  player.play("run", true);

  //player.drawDebug = true;

  /* Define controls here */
  let keyboard = scene.input.keyboard;

  let left_key = keyboard.addKey("a");
  let right_key = keyboard.addKey("d");
  let up_key = keyboard.addKey("w");
  let down_key = keyboard.addKey("s");

  /* Update function on player to capture movement */
  player.update = () => {
    /* Stop horizontal movement, it isn't realistic but its how the
       original played */
    player.body.setVelocityX(0);

    if (left_key.isDown && right_key.isDown) {
      /* Do nothing */
    }
    else if (left_key.isDown) {
      player.body.setVelocityX(-PLAYER_RUN_SPEED);
      player.scaleX = -.15;
      player.body.setOffset(120, -18);
    }
    else if (right_key.isDown) {
      player.body.setVelocityX(PLAYER_RUN_SPEED);
      player.scaleX = .15;
      player.body.setOffset(0, -18);
    }
  }

  /* Jumping */
  up_key.on("down", () => {
    // Only allow jumping if touching the floor
    if (player.body.onFloor()) {
      player.body.setVelocityY(-375);
    }
  })

  /* Slam */
  down_key.on("down", () => {
    player.body.setVelocityY(600);
  })

  return player;
}

export { generatePlayer, Player };

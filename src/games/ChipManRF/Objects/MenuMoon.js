/*
  MenuMoon: That cool spiny moon on the title screen

  Moved into its own file cus it was annoyingly large in the MenuState.

  The way the moon works is by nesting containers :O (yeah I know, I know).
  Nothing on the moon "actually" moves it's position, it's all rotations
  finely tuned to trick
*/
export class MenuMoon extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);

    // The chipman spine that is shown running around on the title screen
    this.chipman = this.scene.add.spine(0, -222, "chipman");
    this.chipman.setScale(0.1, 0.1);

    // A mostly empty container that only holds chipman
    // Phaser strongly reccomends against this, but until I can rotate
    //  or anchor a spine object, this is my only option.
    this.chipmanContainer = this.scene.add.container(0, 0, this.chipman)

    // Chipman's house that will live and rotate on the moon
    let house = this.scene.add.image(0, 0, "house");
    house.setScale(0.5, 0.5);
    house.setOrigin(.5, 3.27);
    // Depth is set in the order of the add array

    // The moon game object
    let moon = this.scene.add.image(0, 0, "moon");
    moon.setScale(0.5, 0.5);
    // Depth is set in the order of the add array

    this.add([house, moon, this.chipmanContainer]);

    // All things on the "rotating" moon should go here
    this.scene.add.tween({
      targets: this,
      angle: 360,
      duration: 70000,
      loop: -1,
    });

    this.chipmanActions = this._generateChipManActions();

    this._chipmanNextAction();
  }

  /*
   * _chipmanNextAction()
   * Will create a Phaser Tween based on what action is randomly decided upon
   * Special cases favor certain directions over others
   */
  _chipmanNextAction() {
    let actionNames = this.chipmanActions.names;
    if (this.chipmanContainer.angle + this.angle % 360 < -30) {
      let distance = Math.random() * (60) + 40;
      this.chipmanActions["runRight"](distance);
      // Randomly jumps
      if (Math.random() > 0.75) {
        this.chipmanActions["jump"]();
      }
    }
    else if (this.chipmanContainer.angle + this.angle % 360 > 30) {
      let distance = Math.random() * (60) + 40;
      this.chipmanActions["runLeft"](distance);
      // Randomly jumps
      if (Math.random() > 0.75) {
        this.chipmanActions["jump"]();
      }
    }
    else {
      let action = Math.floor(Math.random() * 3);
      if (action < 2) { // distance
        let distance = Math.random() * (60) + 40;
        this.chipmanActions[actionNames[action]](distance); // give random distance
        // Randomly jumps
        if (Math.random() > 0.75) {
          this.chipmanActions["jump"]();
        }
      } else {
        // Stall
        this.chipmanActions[actionNames[action]](Math.random() * (900) + 100); // random time
      }
    }
  }

  /*
   * _generateChipManActions() -> object{names: array[string], *: function() ... }
   * Returns a large object with functions that define menu screen
   * animations for chipman.
   */
  _generateChipManActions() {
    return {
      // Have a list of the name of each function
      // Order should be consistent and constant
      names: ["runLeft", "runRight", "stall", "jump"],

      runLeft: (distance) => {
        this.chipman.scaleX = -.1;
        this.chipman.setAnimation(0, "run", true);
        this.scene.add.tween({
          targets: this.chipmanContainer,
          angle: this.chipmanContainer.angle - distance,
          duration: distance / 0.02, // 0.02 is the speed
          onComplete: this._chipmanNextAction,
          onCompleteScope: this,
        })
      },
      runRight: (distance) => {
        this.chipman.scaleX = .1;
        this.chipman.setAnimation(0, "run", true);
        this.scene.add.tween({
          targets: this.chipmanContainer,
          angle: this.chipmanContainer.angle + distance,
          duration: distance / 0.02, // 0.02 is the speed
          onComplete: this._chipmanNextAction,
          onCompleteScope: this,
        })
      },
      stall: (time) => {
        this.chipman.setAnimation(0, "idle", true);
        this.scene.time.addEvent({
          delay: time,
          callback: this._chipmanNextAction,
          callbackScope: this,
        })
      },
      jump: () => {
        this.scene.add.tween({
          targets: this.chipman,
          y: -350,
          duration: 1000, // 0.02 is the speed
          ease: Phaser.Math.Easing.Quadratic.Out,
          onCompleteScope: this,
          onComplete: () => {
            this.scene.add.tween({
              targets: this.chipman,
              y: -222,
              duration: 1000, // 0.02 is the speed
              ease: Phaser.Math.Easing.Quadratic.In,
            });
          }
        });
      }
    };
  }
}

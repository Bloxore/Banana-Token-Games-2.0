import { CanvasControl } from './PassCanvasControl.js';
import * as OpenScene3D from './OpenScene3D.js';


class MenuState extends Phaser.Scene {
  constructor() {
    super({key: "MenuState"});
  }

  preload() {
    this.load.setPath("assets/games/ChipManRF/");

    // Make sure this isn't reloaded later
    this.load.spine("chipman", "chipman-spine/ChipMan Flash Collection.json", "chipman-spine/ChipMan Flash Collection.atlas", true);

    this.load.image("titleGraphic", "graphics/ChipManTitle.png");
    this.load.image("moon", "graphics/Moon.png");
    this.load.image("house", "graphics/ChipManHouse.png")
  }

  create() {
    this.add.image(0, 0, "titleGraphic");
    // Free Phaser's canvas for Three.js's use
    this.game.renderer.clearPipeline();
    this.game.loop.sleep();
    CanvasControl.freeCanvas(this.game.renderer.canvas,
                             this.resumeControlFromThreeJS.bind(this));
    // Notify THREE.JS everything is good to go
    OpenScene3D.startOpenCinematic();
  }

  resumeControlFromThreeJS() {
    this.game.loop.wake(true);

    let background = this.add.graphics();
    background.fillStyle(0x000000);
    background.fillRect(0, 0, 640, 480);

    let title = this.add.image(430, 100, "titleGraphic");
    title.setScale(0.5, 0.5);

    let house = this.add.image(0, 0, "house");
    house.setScale(0.5, 0.5);
    house.setOrigin(.5, 3.27);

    // Get ChipMan in on the action
    let chipman = this.add.spine(0, -222, "chipman");
    chipman.setScale(0.1, 0.1);

    let chipmanContainer = this.add.container(0, 0, chipman)

    let moon = this.add.image(0, 0, "moon");
    moon.setScale(0.5, 0.5);

    let moonContainer = this.add.container(100, 450, [house, moon, chipmanContainer]);

    // All things on the "rotating" moon should go here
    this.add.tween({
      targets: moonContainer,
      angle: 360,
      duration: 70000,
      loop: -1,
    });

    let chipmanActions = {
      runLeft: (distance) => {
        chipman.scaleX = -.1;
        chipman.setAnimation(0, "run", true);
        this.add.tween({
          targets: chipmanContainer,
          angle: chipmanContainer.angle - distance,
          duration: distance / 0.02, // 0.02 is the speed
          onComplete: chipmanNextAction,
          onCompleteScope: this,
        })
      },
      runRight: (distance) => {
        chipman.scaleX = .1;
        chipman.setAnimation(0, "run", true);
        this.add.tween({
          targets: chipmanContainer,
          angle: chipmanContainer.angle + distance,
          duration: distance / 0.02, // 0.02 is the speed
          onComplete: chipmanNextAction,
          onCompleteScope: this,
        })
      },
      stall: (time) => {
        chipman.setAnimation(0, "idle", true);
        this.time.addEvent({
          delay: time,
          callback: chipmanNextAction,
          callbackScope: this,
        })
      },
      jump: () => {
        this.add.tween({
          targets: chipman,
          y: -350,
          duration: 1000, // 0.02 is the speed
          ease: Phaser.Math.Easing.Quadratic.Out,
          onCompleteScope: this,
          onComplete: () => {
            this.add.tween({
              targets: chipman,
              y: -222,
              duration: 1000, // 0.02 is the speed
              ease: Phaser.Math.Easing.Quadratic.In,
            });
          }
        });
      }
    };

    let actions = ["runLeft", "runRight", "stall", "jump"]
    function chipmanNextAction() {
      if (chipmanContainer.angle + moonContainer.angle % 360 < -30 ||
          chipmanContainer.angle + moonContainer.angle % 360 > 270) {
        let distance = Math.random() * (80) + 20;
        chipmanActions["runRight"](distance);
        // Randomly jumps
        if (Math.random() > 0.75) {
          chipmanActions["jump"]();
        }
      }
      else if (chipmanContainer.angle + moonContainer.angle % 360 > 70) {
        let distance = Math.random() * (80) + 20;
        chipmanActions["runLeft"](distance);
        // Randomly jumps
        if (Math.random() > 0.75) {
          chipmanActions["jump"]();
        }
      }
      else {
        let action = Math.floor(Math.random() * 3);
        if (action < 2) { // distance
          let distance = Math.random() * (80) + 20;
          chipmanActions[actions[action]](distance); // give random distance
          // Randomly jumps
          if (Math.random() > 0.75) {
            chipmanActions["jump"]();
          }
        } else {
          // Stall
          chipmanActions[actions[action]](Math.random() * (900) + 100); // random time
        }
      }
    }

    chipmanNextAction();
  }

  update() {

  }

  // Temp (only keeping here for later reference)
  titleGraphicAnimation(titleGraphic) {
    titleGraphic.setTint(0x000000);
    // Fade in title (old fashion method)
    let titleTimeline = this.tweens.createTimeline();

    // Fade black to blue
    titleTimeline.queue(this.tweens.addCounter({
        from: 0,
        to: 128,
        duration: 100,
        paused: true,
        onUpdate: function (tween)
        {
            let value = Math.floor(tween.getValue());

            titleGraphic.setTint(Phaser.Display.Color.GetColor(0, 0, value));
        }
    }));

    // Blue to white
    titleTimeline.queue(this.tweens.addCounter({
        from: 0,
        to: 255,
        duration: 300,
        paused: true,
        onUpdate: function (tween)
        {
            let value = Math.floor(tween.getValue());

            let offsetValue = 128 + value/2;

            titleGraphic.setTint(Phaser.Display.Color.GetColor(value, value, offsetValue));
        }
    }));

    // White to yellow (TODO: also scale up slightly)
    titleTimeline.queue(this.tweens.addCounter({
        from: 255,
        to: 50,
        delay: 2000,
        duration: 600,
        easing: Phaser.Math.Easing.Expo.Out,
        paused: true,
        onUpdate: function (tween)
        {
            let value = Math.floor(tween.getValue());

            titleGraphic.setTint(Phaser.Display.Color.GetColor(255, 255, value));
        }
    }));

    titleTimeline.play();
    // Zoom Title
    this.add.tween({
      targets: titleGraphic,
      delay: 5000,
      scaleX: 20,
      scaleY: 20,
      ease: Phaser.Math.Easing.Expo.In
    })
  }
}

export { MenuState };

import { CanvasControl } from './PassCanvasControl.js';
import * as OpenScene3D from './OpenScene3D.js';


class MenuState extends Phaser.Scene {
  constructor() {
    super({key: "MenuState"});
  }

  preload() {
    this.load.setPath("assets/games/ChipManRF/");

    this.load.image("titleGraphic", "graphics/Title.png");
  }

  create() {
    this.add.image(0, 0, "titleGraphic");
    // Free Phaser's canvas for Three.js's use
    this.game.renderer.clearPipeline();
    this.game.loop.sleep();
    CanvasControl.freeCanvas(this.game.renderer.canvas,
                             this.resumeControlFromThreeJS);
    // Notify THREE.JS everything is good to go
    OpenScene3D.startOpenCinematic();
  }

  resumeControlFromThreeJS() {

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

import { FullScreenButton } from '../Objects/UI/FullScreenButton.js';
import { MenuMoon } from '../Objects/MenuMoon.js';
import { DISTRIBUTIONS, StarField } from '../Objects/StarField.js';
import { ArrowScreenTransition } from '../FX/ArrowScreenTransition.js';
import { ArrowHUD } from '../Objects/UI/ArrowHUD.js';

export class MenuState extends Phaser.Scene {

  /* ===== BLUE-PRINT FUNCTIONS ===== */

  constructor() {
    super({key: "MenuState"});
  }

  preload() {
    this.load.setPath("assets/games/ChipManRF/");
    // All preloaded
  }

  update() {
    // Title wobble
    if (this.titleWobbleEnable) {
      this.title.x = Math.sin(this.titleWobbleFrameCount/70)*10 + this.titleOrigin.x
      this.title.y = Math.sin(this.titleWobbleFrameCount/45)*10 + this.titleOrigin.y
      this.titleWobbleFrameCount++;
    }

    // Leave behind that cool 90s fade effect
    let titleFade = this.add.image(this.title.x, this.title.y, "titleShadow")
    titleFade.depth = 4;
    titleFade.setScale(this.title.scaleX);
    titleFade.setTintFill(0xfec909);
    this.add.tween({
      targets: titleFade,
      alpha: 0,
      duration: 1000,
      onCompleteScope: this,
      onComplete: () => {
        titleFade.destroy();
      }
    })
  }

  create() {
    this.cameras.main.setScroll(0, -this.game.config.height*4);

    /* === Class Variables === */
    // Holds the moon and everything on it (to rotate slowly)
    // This includes chipman's container!
    this.moonContainer = new MenuMoon(this, 320, 820);
    this.moonContainer.setScale(2, 2);
    this.moonContainer.depth = 2;
    this.add.existing(this.moonContainer);

    /* === Local Variables === */
    // Black background (space ya'know)
    let background = this.add.graphics();
    background.fillStyle(0x000000);
    background.fillRect(0, 0, 640, 480);
    background.depth = 0;

    let stars = this._generateStarFields();

    let fragsrc =
    `
    #ifdef GL_ES
    precision mediump float;
    #endif

    uniform float time;

    void main(void) {
      gl_FragColor = vec4(abs(sin(time + 1.0)),abs(sin(time + 2.0)),abs(sin(time+ 3.0)),1.0);
    }
    `;
    let baseShader = new Phaser.Display.BaseShader("rainbow", fragsrc);
    let shader = this.add.shader(baseShader, 320, 315,480, 100).setDepth(10);


    // Add the menu options
    let startText = this.add.bitmapText(320, 320, "mainFont", "Click or Tap to Start", 11);
    startText.setOrigin(.5,1);
    startText.setDepth(6);
    startText.setTintFill(0xffffff);
    let textMask = startText.createBitmapMask();
    shader.setMask(textMask);

    // The name of the game all fancy like
    this.title = this.add.image(320, 120, "titleShadow");
    this.title.setScale(0, 0);
    this.title.setTintFill(0x6abd45);
    this.title.depth = 5;
    this.titleOrigin = {
      x: 320,
      y: 120
    }
    this.titleWobbleFrameCount = 0;
    this.titleWobbleEnable = false;

    // Copyright info
    let copyright = this.add.bitmapText(320, 480, "mainFont", "(C) 2020 Copyright BananaToken Arcade All Rights Reserved", 9);
    copyright.setOrigin(.5,1);
    copyright.setDepth(6);
    copyright.setTintFill(0x000000);

    let yellowFill = new ArrowHUD(this, 320, 240, {
      arrowWidth: 1000,
      arrowHeight: 640,
      cutPercent: 0.19,
      color: 0xf0f000
    });
    yellowFill.setAngle(270);
    yellowFill.setDepth(7);
    yellowFill.setScrollFactor(0);
    yellowFill.y = 1000;
    this.add.existing(yellowFill);

    // Camera pan animation
    this._cameraPanToTitle(() => {
      // Kill those offscreen stars to reduce CPU load
      for (let star of stars.topStars.children.entries) {
        // Hopefully the act of destruction isn't lagging in it of itself
        star.destroy();
      }

      this.titleWobbleEnable = true;
      // Make title zoom in
      let titleZoomTween = this.add.tween({
        targets: this.title,
        scaleX: 0.8,
        scaleY: 0.8,
        ease: Phaser.Math.Easing.Quintic.In,
        duration: 1000,
        onCompleteScope: this,
      })

      // Start the chipman moon animations
      this.time.addEvent({
        delay: 200,
        callbackScope: this,
        callback: () => {
          this.moonContainer.startChipman();
        }
      });

      // Start listening for the GameStart click
      this.input.once('pointerdown', () => {
        titleZoomTween.remove();

        this.add.tween({
          targets: [startText, copyright],
          alpha: 0,
          duration: 500
        })

        // Mega zoom the title towards the screen
        this.titleWobbleEnable = false;
        this.add.tween({
          targets: this.title,
          scaleX: 0,
          scaleY: 0,
          duration: 500,
        })

        this.add.tween({
          targets: this.title,
          y: 240,
          x: 320,
          duration: 1000,
          ease: Phaser.Math.Easing.Quintic.InOut,
        })

        // Bounce camera down to go up
        this.add.tween({
          targets: this.cameras.main,
          scrollY: -1000,
          duration: 1000,
          delay: 500,
          ease: Phaser.Math.Easing.Back.In
        })

        // Wait a second before starting the arrows
        this.time.addEvent({
          delay: 1100,
          callback: () => {
            ArrowScreenTransition.apply({
              scene: this,
              arrowThickness: 150,
              arrowSpeed: 3000,
              duration: 500,
              gapWidth: 50,
              color: 0xf0f000,
              arrowDirection: ArrowScreenTransition.UP
            });
          }, callbackScope: this
        })

        // Fill the whole screen yellow
        this.add.tween({
          targets: yellowFill,
          duration: 420,
          y: 0,
          delay: 1620,
        })

        // Animation over, go to level select
        this.time.addEvent({
          delay: 3300,
          callback: this._startGame,
          callbackScope: this
        })
      })
    });

    // Make the debug button active
    //debugButton.on("pointerup", this._launchDebug.bind(this));
  }

  /* ===== ACTION FUNCTIONS ===== */
  /*
    _startGame()
    Shuts down the main menu and begins the game proper.
  */
  _startGame() {
    this.scene.stop();
    // this.game.scene.add("GameState", GameState, true);
    this.scene.start("LevelSelectDebugState");
  }

  /*
    _launchDebug()
    Shuts down the main menu and begins the debug state
  */
  _launchDebug() {
    this.scene.start("DebugState");
  }

  _cameraPanToTitle(complete) {
    let timeline = this.tweens.createTimeline();

    timeline.add({
      targets: this.cameras.main,
      scrollX:0,
      scrollY:-this.game.config.height*3,
      duration: 1000,
      ease: Phaser.Math.Easing.Quintic.In
    });
    timeline.add({
      targets: this.cameras.main,
      scrollX: 0,
      scrollY:-this.game.config.height*2,
      duration: 200,
      repeat: 2
    });
    timeline.add({
      targets: this.cameras.main,
      scrollX:0,
      scrollY:0,
      duration: 1000,
      ease: Phaser.Math.Easing.Quintic.Out,
      onComplete: complete,
      onCompleteScope: this
    });

    timeline.play();
  }

  _generateStarFields() {
    // Stars
    let topStars = new StarField(this);
    this.add.existing(topStars);
    topStars.setDepth(1);
    topStars.generateField({
      bounds: new Phaser.Geom.Rectangle(0, -this.game.config.height*4, this.game.config.width, this.game.config.height),
      numStars: 50,
      sizeRange: [.5, .6],
      randomSeed: "banana",
      distribution: DISTRIBUTIONS.POLY
    })
    topStars.generateField({
      bounds: new Phaser.Geom.Rectangle(0, -this.game.config.height*3, this.game.config.width, this.game.config.height),
      numStars: 50,
      sizeRange: [.5, .6],
      randomSeed: "token+",
      distribution: DISTRIBUTIONS.POLY
    });
    topStars.generateField({
      bounds: new Phaser.Geom.Rectangle(0, -this.game.config.height*2, this.game.config.width, this.game.config.height),
      numStars: 50,
      sizeRange: [.5, .6],
      randomSeed: "token+",
      distribution: DISTRIBUTIONS.POLY
    });

    let titleStars = new StarField(this);
    this.add.existing(titleStars);
    titleStars.setDepth(1);
    titleStars.generateField({
      bounds: new Phaser.Geom.Rectangle(0, -this.game.config.height, this.game.config.width, this.game.config.height*2),
      numStars: 75,
      sizeRange: [.5, .6],
      randomSeed: "arcade",
      distribution: DISTRIBUTIONS.POLY
    });

    titleStars.generateField({
      bounds: new Phaser.Geom.Rectangle(0, 100, this.game.config.width/3, this.game.config.height/2),
      numStars: 5,
      sizeRange: [.5, .6],
      randomSeed: "arcade",
      distribution: DISTRIBUTIONS.POLY
    });

    return {
      topStars: topStars,
      titleStars: titleStars
    };
  }
}

/*
  Since Phaser can handle several "layers" of Scenes, this is just a lightweight
  scene that runs on top of every other scene in the game.
  When the player press CTRL-B, this scene captures that input and pauses every other
  currently running scene.

  Press CTRL-B to resume them

  Features:
    - Pause / Resume currently running scenes
    - Bring up "system" menu while paused
      - System menu includes
        - Muting all sounds
        - Enter / Exit fullscreen
        - Remap keys to actions (games remap actions to controls)
          - Action mappings are stored throughout games
*/
export class Manager extends Phaser.Scene {
  constructor() {
    super({
      key: "Manager"
    });

    this.scenesPaused = false;
    this.maskTween;
  }

  preload() {
    this.load.atlas("dashboard", "../../assets/lib/dashboard.png", "../../assets/lib/dashboard.json");
  }

  create() {
    this.cameraMaskGeo = this.make.graphics();
    this.cameraMaskGeo.fillStyle(0xffffff);
    this.cameraMaskGeo.fillRect(0, 0, this.game.config.width, this.game.config.height);

    this.cameraMask = new Phaser.Display.Masks.GeometryMask(this, this.cameraMaskGeo);

    // ==================

    // The dashboard element
    this.dash = new DashPanel(this);
    this.add.existing(this.dash);

    // Keyboard event to pause the current game
    this._activateKey = this.input.keyboard.addKey("b");
    this._activateKey.on("down", (e) => {
      if (e.ctrlKey && e.altKey) {
        if (this.scenesPaused) {
          this.resumeGame();
        } else {
          this.pauseGame();
        }
      }
    });

  }


  update() {
    if (this.scene.getIndex(this) != 0) {
      this.scene.bringToTop("Manager");
    }
  }

  pauseGame() {

    this.scenesPaused = true;
    for (let scene of this.scene.manager.scenes) {
      if (scene.scene.key != "Manager" && scene.scene.isActive()) {
        this.scene.pause(scene.scene.key);
        this.squishSceneCameras(scene.cameras.cameras);
      }
    }
    this.dash.appear();
  }

  resumeGame() {

    this.scenesPaused = false;
    for (let scene of this.scene.manager.scenes) {
      if (scene.scene.key != "Manager" && scene.scene.isPaused()) {
        this.scene.run(scene.scene.key);
        this.revertSceneCameras(scene.cameras.cameras);
      }
    }
    this.dash.disappear();
  }

  squishSceneCameras(cameras) {
    for (let camera of cameras) {
      camera.setMask(this.cameraMask);
    }

    if (this.maskTween) {
      this.maskTween.remove();
    }

    this.maskTween = this.add.tween({
      targets: this.cameraMaskGeo,
      scaleX: .5,
      scaleY: .5,
      x: this.game.config.width / 4,
      y: this.game.config.height / 4,
      duration: 100
    });
  }

  revertSceneCameras(cameras) {
    if (this.maskTween) {
      this.maskTween.remove();
    }

    this.maskTween = this.add.tween({
      targets: this.cameraMaskGeo,
      scaleX: 1,
      scaleY: 1,
      x: 0,
      y: 0,
      duration: 100,
      onComplete: () => {
        for (let camera of cameras) {
          camera.clearMask(false);
        }
      }
    });
  }
}

// Lower panel on screen that pops up.
// Gives the options mentioned above (gotta work on the key rebinding later
//      tho)
class DashPanel extends Phaser.GameObjects.Group {
  constructor(scene) {
    if (!scene)
      console.error("No scene passed into DashPanel!");

    super(scene);

    // Tween
    this.slideTween;
    this.textTween;
    this.buttonsTween;

    // Background
    this.backLayerSpr = this.scene.add.graphics();
    this.backLayerSpr.fillStyle(0x000000, .5);
    this.backLayerSpr.lineStyle(5, 0xffffff);
    this.backLayerSpr.fillRoundedRect(0, 0, this.scene.game.config.width - 5, this.scene.game.config.height,
                                      {tl: 20, tr: 20, br: 0, bl: 0});
    this.backLayerSpr.strokeRoundedRect(0, 0, this.scene.game.config.width - 5, this.scene.game.config.height,
                                      {tl: 20, tr: 20, br: 0, bl: 0});
    this.add(this.backLayerSpr);
    this.backLayerSpr.x = 2.5;
    this.backLayerSpr.y = this.scene.game.config.height + 5;

    // Dashboard text
    this.dashText = this.scene.add.text(0, 0, "PREFERENCES",{
      fontFamily: "Arial",
      align: "center",
      fontStyle: "bold",
      fontSize: "32px",
    });
    this.dashText.x = this.scene.game.config.width / 2 - this.dashText.width / 2;
    this.dashText.y = -this.dashText.height - 10;

    // Dash buttons
    this.dashButtons = [];

    this.fullscreenButton = this.scene.add.existing(new DashButton(this.scene, 2*this.scene.game.config.width / 6, this.scene.game.config.height, 100, 100,
      {
          frameName: "fullscreen.png",
          callback: this._toggleFullScreen,
          context: this
      }));

    this.soundButton = this.scene.add.existing(new DashButton(this.scene, 3*this.scene.game.config.width / 6, this.scene.game.config.height, 100, 100,
      {
          frameName: "sound.png",
          callback: ()=>{},
          context: this
      }));

    this.keyBindingButton = this.scene.add.existing(new DashButton(this.scene, 4*this.scene.game.config.width / 6, this.scene.game.config.height, 100, 100,
      {
          frameName: "controls.png",
          callback: ()=>{},
          context: this
      }));

    this.dashButtons.push(this.fullscreenButton);
    this.dashButtons.push(this.soundButton);
    this.dashButtons.push(this.keyBindingButton);
  }

  appear() {
    this.slidePanelIn();
    this.moveTextIn();
  }

  disappear() {
    this.slidePanelOut();
    this.moveTextOut();
  }

  slidePanelIn() {
    if (this.slideTween) {
      this.slideTween.remove();
    }
    this.slideTween = this.scene.add.tween({
      targets: [this.backLayerSpr],
      y: this.scene.game.config.height - 115,
      duration: 100
    });

    if (this.buttonsTween) {
      this.buttonsTween.remove();
    }
    this.buttonsTween = this.scene.add.tween({
      targets: this.dashButtons,
      y: this.scene.game.config.height - 105,
      duration: 100
    })
  }

  slidePanelOut() {
    if (this.slideTween) {
      this.slideTween.remove();
    }
    this.slideTween = this.scene.add.tween({
      targets: [this.backLayerSpr],
      y: this.scene.game.config.height + 5,
      duration: 100
    });

    if (this.buttonsTween) {
      this.buttonsTween.remove();
    }
    this.buttonsTween = this.scene.add.tween({
      targets: this.dashButtons,
      y: this.scene.game.config.height,
      duration: 100
    })
  }

  moveTextIn() {
    if (this.textTween) {
      this.textTween.remove();
    }
    this.textTween = this.scene.add.tween({
      targets: this.dashText,
      y: 30,
      duration: 100
    })
  }

  moveTextOut() {
    if (this.textTween) {
      this.textTween.remove();
    }
    this.textTween = this.scene.add.tween({
      targets: this.dashText,
      y: -this.dashText.height - 10,
      duration: 100
    })
  }

  _toggleFullScreen() {
    if (this.scene.scale.isFullscreen) {
      this.scene.scale.stopFullscreen();
    } else {
      this.scene.scale.startFullscreen();
    }
  }

  preUpdate() {
    if (this.scene.scale.isFullscreen) {
      this.fullscreenButton.setFrame("standardscreen.png");
    } else {
      this.fullscreenButton.setFrame("fullscreen.png");
    }
  }
}

/*
  Rounded rectangle background.
  Flavor text on top
  Sprite icon on bottom

  config:
  {
    frameName,
    callback,
    context
  }
*/
class DashButton extends Phaser.GameObjects.Zone {
  constructor(scene, x, y, width, height, config = {}) {
    super(scene, x, y, width, height);

    let frameName = "";
    if (config.frameName)
      frameName = config.frameName;

    this.setOrigin(0.5, 0);

    // On click event
    this.setInteractive();
    let context = this.scene;
    if (config.context) {
      context = config.context;
    }
    if (config.callback)
      this.on("pointerdown", config.callback, context);


    // Background
    this.background = this.scene.add.graphics();
    this.background.fillStyle(0xCCCCCC, 0.5);
    this.background.fillRect(-width/2, 0, width, height);

    // Icon
    this.icon = this.scene.add.image(x, y, "dashboard", frameName);
    this.icon.offset = {
      x: 0,
      y: width / 4
    }
    this.icon.setDisplaySize(width / 2, height / 2);
    this.icon.setOrigin(0.5, 0);

  }

  setFrame(frameName) {
    this.icon.setFrame(frameName);
  }

  preUpdate() {
    this.background.setPosition(this.x, this.y);
    this.icon.setPosition(this.x + this.icon.offset.x, this.y + this.icon.offset.y);
  }
}
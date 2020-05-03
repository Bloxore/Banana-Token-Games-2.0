export class FullScreenButton extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y) {
    super(scene, x, y, 50, 50, 0xff0000);

    this.setInteractive();

    this.on("pointerdown", this.toggleFullScreen);
  }

  toggleFullScreen() {
    if (this.scene.scale.isFullscreen) {
      this.scene.scale.stopFullscreen();
    } else {
      this.scene.scale.startFullscreen();
    }
  }
}

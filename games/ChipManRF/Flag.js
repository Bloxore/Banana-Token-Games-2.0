export function createFlag(scene, x, y) {
  let spine = scene.add.spine(x, y, "flag");

  //Set up animations
  spine.addAnimation(0, "flap", true);
  spine.addAnimation(1, "star", true);

  //Scale down the flag
  spine.setScale(0.20);

  // Give the flag a collision body
  scene.physics.add.existing(spine);
  spine.body.setSize(spine.width, spine.height);

  return spine;
}

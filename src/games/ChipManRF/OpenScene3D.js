import { CanvasControl } from './PassCanvasControl.js';

/*
  Gets the freed canvas and performs the open cinematic on it
  Once the cinematic is complete the canvas is freed again.

  Everything should occur with the local scope of this function
  (no cross reference required other than the pass manager)
*/
export function startOpenCinematic() {
  // First some prep
  // Get the freed canvas
  let canvas = CanvasControl.fetchFreedCanvas();
  CanvasControl.restrainCanvas();

  let scene = new THREE.Scene();
  let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight,
                                            0.1, 1000 );

  let renderer = new THREE.WebGLRenderer({
    canvas: canvas
  });

  // The size should be inherited from the canvas
  // This comment is here in case anything goes haywire.
  //renderer.setSize( 640 , 480 );

  // Texture loader
  let textureLoader = new THREE.TextureLoader();

  // Ground
  let groundTexture = textureLoader.load("assets/games/ChipManRF/ThreeJS/groundTexture.jpg");

  let cylinderGeom = new THREE.CylinderGeometry( 1, 1, 1, 40 );
  let material = new THREE.MeshLambertMaterial( {
                                                  color: 0xffffff,
                                                  map: groundTexture
                                                }
                                              );
  let ground = new THREE.Mesh( cylinderGeom, material );
  scene.add( ground );
  ground.rotation.z = Math.PI/2;
  ground.scale.set(10, 100, 10);

  // Light
  let light = new THREE.HemisphereLight( 0xfffff0, 0xffff00 );
  light.position.set(-7, 12, 20);
  scene.add( light );

  camera.position.set(0,15,16);

  function animate() {
    if (renderer) {
      // Only render if there's something to render to
      requestAnimationFrame( animate );
  	  renderer.render( scene, camera );

      ground.rotation.x += 0.01;
      terminateSequence();
    }
  }
  animate();

  function terminateSequence() {
    // Destroy everything and return to phaser
    scene.dispose();
    renderer.dispose();
    scene = null;
    camera = null;
    renderer = null;

    CanvasControl.freeCanvas(canvas);
  }
}

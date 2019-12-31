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


  // Ground
  let planeGeom = new THREE.PlaneGeometry( 10, 10, 1 );
  let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  let basicGround = new THREE.Mesh( planeGeom, material );
  scene.add( basicGround );
  basicGround.rotation.x = -Math.PI/2;
  basicGround.position.set(0, -1, 0);

  // Light
  let light = new THREE.PointLight( 0xff0000, 1, 100);
  light.position.set(50, 50, 50);
  scene.add( light );

  camera.position.z = 5;

  function animate() {
  	requestAnimationFrame( animate );
  	renderer.render( scene, camera );
  }
  animate();
}

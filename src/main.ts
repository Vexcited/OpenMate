import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { VRMLoaderPlugin, VRMUtils, VRM } from '@pixiv/three-vrm';

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setClearColor( 0x000000, 0.0 );
document.body.appendChild( renderer.domElement );

// camera
const camera = new THREE.PerspectiveCamera( 30.0, window.innerWidth / window.innerHeight, 0.1, 20.0 );
camera.position.set( 0.0, 1.0, 5.0 );

// scene
const scene = new THREE.Scene();
scene.background = null;

// light
const light = new THREE.DirectionalLight( 0xffffff, Math.PI );
light.position.set( 1.0, 1.0, 1.0 ).normalize();
scene.add( light );

let currentVrm: VRM | undefined = undefined;
const loader = new GLTFLoader();

// Install a GLTFLoader plugin that enables VRM support
loader.register((parser) => {
  return new VRMLoaderPlugin(parser);
});

loader.load(
  // URL of the VRM you want to load
  '/models/HatsuneMikuNT.vrm',

  // called when the resource is loaded
  (gltf) => {
    // retrieve a VRM instance from gltf
    const vrm: VRM = gltf.userData.vrm;

    // VRMUtils.removeUnnecessaryVertices( gltf.scene );
    // VRMUtils.combineSkeletons( gltf.scene );
    // VRMUtils.combineMorphs( vrm );

    // Disable frustum culling
    // vrm.scene.traverse( ( obj ) => {
    //   obj.frustumCulled = false;
    // } );

    vrm.scene.rotation.y = Math.PI;

    // add the loaded vrm to the scene
    currentVrm = vrm;
    scene.add(vrm.scene);

    // deal with vrm features
    console.log(vrm);
  },

  // called while loading is progressing
  (progress) => console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%'),

  // called when loading has errors
  (error) => console.error(error),
);

// helpers
// const gridHelper = new THREE.GridHelper( 10, 10 );
// scene.add( gridHelper );

// const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );

// animate
const clock = new THREE.Clock();
clock.start();

function animate() {

  requestAnimationFrame( animate );

  // update vrm components
  if (currentVrm) {
    currentVrm.update( clock.getDelta() );
  }

  renderer.render( scene, camera );
}

animate();

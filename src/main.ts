import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRM, VRMUtils } from '@pixiv/three-vrm';
import { createVRMAnimationClip, VRMAnimation, VRMAnimationLoaderPlugin, VRMLookAtQuaternionProxy } from '@pixiv/three-vrm-animation';
import { getCurrentWindow } from "@tauri-apps/api/window"
const appWindow = getCurrentWindow();

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);

// camera
const camera = new THREE.PerspectiveCamera( 30.0, window.innerWidth / window.innerHeight, 1, 20);
camera.position.set( 0.0, .75, 5.0 );

// scene
const scene = new THREE.Scene();
scene.background = null;

// light
const light = new THREE.DirectionalLight( 0xffffff, Math.PI );
light.position.set( 1.0, 1.0, 1.0 ).normalize();
light.castShadow = true;
scene.add( light );

let currentVrm: VRM | undefined = undefined;
let currentVrmAnimation: VRMAnimation | undefined = undefined;
let currentMixer: THREE.AnimationMixer | undefined = undefined;

const loader = new GLTFLoader();

loader.register((parser) => {
  return new VRMLoaderPlugin(parser);
});

loader.register((parser) => {
  return new VRMAnimationLoaderPlugin(parser);
});

function tryInitVRM( gltf: GLTF ) {
  const vrm: VRM = gltf.userData.vrm;

  if ( vrm == null ) {

    return;

  }

  if ( currentVrm ) {

    scene.remove( currentVrm.scene );
    VRMUtils.deepDispose( currentVrm.scene );

  }

  // Add look at quaternion proxy to the VRM; which is needed to play the look at animation
  const lookAtQuatProxy = new VRMLookAtQuaternionProxy(vrm.lookAt!);
  lookAtQuatProxy.name = 'lookAtQuaternionProxy';
  vrm.scene.add( lookAtQuatProxy );

  // Disable frustum culling
  vrm.scene.traverse( ( obj ) => {

    obj.frustumCulled = false;

  } );

  const scale = 1; // 60% of original size
  vrm.scene.scale.set(scale, scale, scale);

  currentVrm = vrm;
  scene.add( vrm.scene );

  // rotate if the VRM is VRM0.0
  VRMUtils.rotateVRM0( vrm );

  initAnimationClip();
}

function tryInitVRMA( gltf: GLTF ) {

  const vrmAnimations = gltf.userData.vrmAnimations;

  if ( vrmAnimations == null ) {

    return;

  }

  currentVrmAnimation = vrmAnimations[ 0 ] ?? null;
  initAnimationClip();

  console.log( vrmAnimations );

}

function initAnimationClip() {

  if ( currentVrm && currentVrmAnimation ) {

    currentMixer = new THREE.AnimationMixer( currentVrm.scene );

    const clip = createVRMAnimationClip( currentVrmAnimation, currentVrm );
    currentMixer.clipAction( clip ).play();
    currentMixer.timeScale = 1.11;

    currentVrm.humanoid.resetNormalizedPose();

    currentVrm.lookAt!.reset();
    currentVrm.lookAt!.autoUpdate = currentVrmAnimation.lookAtTrack != null;

  }

}

const load = (path: string) => {
  loader.load(
    // URL of the VRM you want to load
    path,

    // called when the resource is loaded
    (gltf) => {
      tryInitVRM( gltf );
      tryInitVRMA( gltf );
    },

    // called while loading is progressing
    (progress) => console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%'),

    // called when loading has errors
    (error) => console.error(error),
  );
}


load('/models/HatsuneMikuNT.vrm');
load('/models/waiting.vrma');

// helpers
const gridHelper = new THREE.GridHelper( 2, 6 );
scene.add( gridHelper );

const clock = new THREE.Clock();
clock.start();

function animate() {

  requestAnimationFrame( animate );

  const deltaTime = clock.getDelta();

  if ( currentMixer ) {

    currentMixer.update( deltaTime );

  }

  if ( currentVrm ) {

    currentVrm.update( deltaTime );

  }

  renderer.render( scene, camera );

}

animate();

document.body.addEventListener('mousedown', (e) => {
  if (e.buttons === 1) {
    appWindow.startDragging();
  }
});

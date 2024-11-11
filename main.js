// Three.js - Fundamentals
// from https://threejs.org/manual/examples/fundamentals.html

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

let gui;
let params = { boardSize: 2048 / 1 };
let textureCanvas, offscreenCanvas;
const views = [
  {
    left: 0,
    bottom: 0,
    width: 0.5,
    height: 1.0,
    background: new THREE.Color(0xe1e1ef),
  },
  {
    left: 0.5,
    bottom: 0,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color(0xe1efe1),
  },
  {
    left: 0.5,
    bottom: 0.5,
    width: 0.5,
    height: 0.5,
    background: new THREE.Color(0xefe1e1),
  },
];

async function main() {
  const canvas = document.querySelector("#c");
  const container = document.querySelector("#container");
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  let totalDistance = 0;
  const maxDistance = 60;
  let reverse = false;
  const fov = 75;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 5000;
  let stats;
  let windowWidth = window.innerWidth;
  let windowHeight = window.innerHeight;

  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(90, 75, -160);

  const scene = new THREE.Scene();
  textureCanvas = document.createElement("canvas");
  textureCanvas.height = 2048;
  textureCanvas.width = 2048;

  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  offscreenCanvas = textureCanvas.transferControlToOffscreen();

  const kettlewell = await loadGLTF("./kettlewell.glb");
  kettlewell.scene.traverse((node) => {
    if (node.isMesh && node.material) {
      node.material.map = texture;
      node.material.side = THREE.BackSide;
    }
  });

  kettlewell.scene.position.set(0, 0, 0);
  scene.add(kettlewell.scene);

  const hex = await loadGLTF("./hex.glb");
  hex.scene.position.set(90, 30, -100);
  const scaleFactor = 6;
  hex.scene.scale.set(scaleFactor, scaleFactor, scaleFactor);

  hex.scene.rotateY(Math.PI / 2.85);
  scene.add(hex.scene);

  camera.lookAt(hex.scene);

  const dirLight = new THREE.DirectionalLight(0xffffff, 20);
  dirLight.position.set(120, 30, 100);
  dirLight.layers.enableAll();
  scene.add(dirLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 1;
  controls.maxDistance = 2000;
  controls.target = new THREE.Vector3(90, 30, -100);

  stats = new Stats();
  container.appendChild(stats.dom);

  async function loadGLTF(path) {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(path);

    return gltf;
  }

  function updateSize() {
    if (
      windowWidth != window.innerWidth ||
      windowHeight != window.innerHeight
    ) {
      windowWidth = window.innerWidth;
      windowHeight = window.innerHeight;

      renderer.setSize(windowWidth, windowHeight);
    }
  }
  updateSize();
  draw();

  window.addEventListener("resize", updateSize);

  function draw() {
    requestAnimationFrame(draw);
    moveForward(hex.scene, -0.25);
    renderer.setSize(windowWidth, windowHeight);
    render();
    stats.update();

    // initGui();
  }

  function render() {
    // updateSize();
    for (let ii = 0; ii < views.length; ++ii) {
      const view = views[ii];

      const left = Math.floor(windowWidth * view.left);
      const bottom = Math.floor(windowHeight * view.bottom);
      const width = Math.floor(windowWidth * view.width);
      const height = Math.floor(windowHeight * view.height);

      renderer.setViewport(left, bottom, width, height);
      renderer.setScissor(left, bottom, width, height);
      renderer.setScissorTest(true);
      renderer.setClearColor(view.background);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.render(scene, camera);
    }
  }
  function moveForward(object, distance) {
    totalDistance += distance;
    if (maxDistance === Math.abs(totalDistance)) {
      object.rotateY(Math.PI);
      totalDistance = 0;
    }
    // Get the current direction the object is facing
    const direction = new THREE.Vector3();
    hex.scene.getWorldDirection(direction);

    // Move the object along its forward direction
    object.position.add(direction.multiplyScalar(distance));
  }

  const myWorker = new Worker(new URL("worker.js", import.meta.url));
  myWorker.postMessage({ canvas: offscreenCanvas }, [offscreenCanvas]);

  myWorker.onmessage = (e) => {
    texture.needsUpdate = true;
    console.log(
      "Message received from worker",
      e.data,
      new Date().toLocaleTimeString()
    );
    setTimeout(() => {
      myWorker.postMessage({ draw: true, boardSize: params.boardSize });
    }, 100);
  };
}

function initGui() {
  gui = new GUI();

  gui.add(params, "boardSize", 2, 2048, 64);

  gui.open();
}

main();

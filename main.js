// Three.js - Fundamentals
// from https://threejs.org/manual/examples/fundamentals.html

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
async function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  const fov = 75;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 5000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(90, 75, -160);

  const scene = new THREE.Scene();

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(120, 30, 100);
  dirLight.layers.enableAll();
  scene.add(dirLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const gltf = await loadGLTF();
  gltf.scene.position.set(0, 0, 0);
  scene.add(gltf.scene);

  const axesHelper = new THREE.AxesHelper(1.3, 1.3, 1.3);
  scene.add(axesHelper);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 1;
  controls.maxDistance = 2000;

  window.addEventListener("resize", onWindowResize);

  async function loadGLTF() {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync("./kettlewell.glb");
    gltf.scene.traverse((node) => {
      if (node.isMesh && node.material) {
        // Check for both normal material and array of materials
        if (Array.isArray(node.material)) {
          node.material.forEach((material) => {
            material.side = THREE.DoubleSide;
          });
        } else {
          node.material.side = THREE.DoubleSide;
        }
      }
    });
    return gltf;
  }

  function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  draw();

  function draw() {
    requestAnimationFrame(draw);
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);
    renderer.render(scene, camera);
  }
}

main();

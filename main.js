// Three.js - Fundamentals
// from https://threejs.org/manual/examples/fundamentals.html

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

async function main() {
  THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0, 0, 1);
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  const fov = 75;
  const near = 0.1;
  const far = 5;
  let sphere;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspect = width / height;

  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(3, 0, 2);

  const scene = new THREE.Scene();

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(-3, 3, 10);
  dirLight.layers.enableAll();
  scene.add(dirLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const objLoader = new OBJLoader();

  function loadOBJ(path) {
    return new Promise(function (resolve, reject) {
      objLoader.load(
        path,
        function (obj) {
          resolve(obj);
        },
        undefined,
        function (error) {
          reject(error);
        }
      );
    });
  }

  const body = await loadOBJ("./body.obj");
  scene.add(body);

  const axesHelper = new THREE.AxesHelper(1.3, 1.3, 1.3);
  scene.add(axesHelper);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 1;
  controls.maxDistance = 200;

  function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  window.addEventListener("resize", onWindowResize);

  // Create a raycaster
  function draw() {
    requestAnimationFrame(draw);
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);
    renderer.render(scene, camera);
  }

  draw();
  function getShortestZDistance() {
    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3();
    const xDistance = -0.2;
    const yDistance = 0.2;
    const point = new THREE.Vector3(xDistance, yDistance, 1);
    direction.set(0, 0, 1);

    // Perform raycasting in the positive direction
    raycaster.set(point, direction);
    let intersects = raycaster.intersectObject(body);

    // Perform raycasting in the negative direction
    direction.negate();
    raycaster.set(point, direction);
    intersects = intersects.concat(raycaster.intersectObject(body));

    // Calculate the shortest distance
    let shortestDistance = Infinity;
    intersects.forEach((intersect) => {
      const distance = point.distanceTo(intersect.point);
      if (distance < shortestDistance) {
        shortestDistance = distance;
      }
    });

    scene.add(
      new THREE.ArrowHelper(
        raycaster.ray.direction,
        raycaster.ray.origin,
        undefined,
        0xff0000
      )
    );

    console.log("Shortest Distance:", shortestDistance);
  }

  getShortestZDistance();
}
main();

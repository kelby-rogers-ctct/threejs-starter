// Three.js - Fundamentals
// from https://threejs.org/manual/examples/fundamentals.html

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  const fov = 75;
  const near = 0.1;
  const far = 5;
  let cube;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspect = width / height;

  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;

  const scene = new THREE.Scene();

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(-3, 3, 10);
  dirLight.layers.enableAll();
  scene.add(dirLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  function addBox() {
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 }); // greenish blue

    cube = new THREE.Mesh(geometry, material);
    cube.position.setX(0.51);
    scene.add(cube);
  }

  addBox();

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
    const point = new THREE.Vector3(0, 0, 5);
    direction.set(0, 0, 1);

    // Perform raycasting in the positive direction
    raycaster.set(point, direction);
    let intersects = raycaster.intersectObject(cube);

    // Perform raycasting in the negative direction
    direction.negate();
    raycaster.set(point, direction);
    intersects = intersects.concat(raycaster.intersectObject(cube));

    // Calculate the shortest distance
    let shortestDistance = Infinity;
    intersects.forEach((intersect) => {
      const distance = point.distanceTo(intersect.point);
      // if (intersects.length > 0) {
      // }
      if (distance < shortestDistance) {
        shortestDistance = distance;
      }
    });

    scene.add(
      new THREE.ArrowHelper(
        raycaster.ray.direction,
        raycaster.ray.origin,
        5,
        0xff0000
      )
    );

    console.log("Shortest Distance:", shortestDistance);
  }

  getShortestZDistance();
}
main();

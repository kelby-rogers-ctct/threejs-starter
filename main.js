// Three.js - Fundamentals
// from https://threejs.org/manual/examples/fundamentals.html

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

async function main() {
  THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0, 0, 1);
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  const debug = true;
  const fov = 75;
  const near = 0.1;
  const far = 5;
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
  controls.maxDistance = 2000;

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
  function getIntersectPoint(point, direction) {
    const raycaster = new THREE.Raycaster();
    let pointOutsideMesh = new THREE.Vector3();
    pointOutsideMesh.copy(direction);
    pointOutsideMesh.multiply(new THREE.Vector3(5, 5, 5));
    pointOutsideMesh.add(point);

    // Perform raycasting in the positive direction
    raycaster.set(pointOutsideMesh, direction);
    let intersects = raycaster.intersectObject(body);

    // Perform raycasting in the negative direction
    direction.negate();
    raycaster.set(pointOutsideMesh, direction);
    intersects = intersects.concat(raycaster.intersectObject(body));

    // Calculate the shortest distance
    let shortestDistance = Infinity;
    let closestPoint = new THREE.Vector3();
    intersects.forEach((intersect) => {
      const distance = point.distanceTo(intersect.point);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        closestPoint = intersect.point;
      }
    });

    if (debug) {
      scene.add(
        new THREE.ArrowHelper(
          raycaster.ray.direction,
          raycaster.ray.origin,
          1000,
          0xff0000
        )
      );
    }

    return closestPoint;
  }

  function createCylinderFromVectors(start, end) {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length() * 1.1;

    const midpoint = new THREE.Vector3()
      .addVectors(start, end)
      .multiplyScalar(0.5);

    const geometry = new THREE.CylinderGeometry(0.05, 0.05, length);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const cylinder = new THREE.Mesh(geometry, material);

    cylinder.position.copy(midpoint);

    cylinder.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.normalize()
    );

    scene.add(cylinder);
  }

  const distanceArbitrarilyFarFromMachine = 100;

  const corStart = getIntersectPoint(
    new THREE.Vector3(0, 0, -distanceArbitrarilyFarFromMachine),
    new THREE.Vector3(0, 0, -1)
  );
  const corEnd = getIntersectPoint(
    new THREE.Vector3(0, 0, distanceArbitrarilyFarFromMachine),
    new THREE.Vector3(0, 0, 1)
  );
  createCylinderFromVectors(corStart, corEnd);

  const pinAStart = getIntersectPoint(
    new THREE.Vector3(distanceArbitrarilyFarFromMachine, 0, 0.545),
    new THREE.Vector3(1, 0, 0)
  );
  const pinAEnd = getIntersectPoint(
    new THREE.Vector3(-distanceArbitrarilyFarFromMachine, 0, 0.545),
    new THREE.Vector3(-1, 0, 0)
  );
  createCylinderFromVectors(pinAStart, pinAEnd);
}
main();

import * as THREE from "three";
import { cubesOptions } from "./cubes";

let camera, renderer, scene;

let isUserInteracting = false;
let onMouseDownMouseX = 0;
let onMouseDownMouseY = 0;
let lon = 200;
let onMouseDownLon = 0;
let lat = 0;
let onMouseDownLat = 0;
let cameraTarget = new THREE.Vector3(0, 0, 0);

init();
animate();

function init() {
  const container = document.getElementById("container");

  const cameraOptions = {
    fieldOfView: 75,
    aspectRatio: window.innerWidth / window.innerHeight,
    nearClippingPane: 0.1,
    farClippingPane: 1000,
  };
  camera = new THREE.PerspectiveCamera(
    cameraOptions.fieldOfView,
    cameraOptions.aspectRatio,
    cameraOptions.nearClippingPane,
    cameraOptions.farClippingPane
  );

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  const geometry = new THREE.SphereBufferGeometry(20);
  // invert the geometry on the x-axis so that all of the faces point inward
  geometry.scale(-1, 1, 1);

  const texture = new THREE.TextureLoader().load("../textures/panorama.jpg");
  const material = new THREE.MeshBasicMaterial({ map: texture });

  const panorama = new THREE.Mesh(geometry, material);

  scene.add(panorama);

  // Axes (if camera is at 0, 0, 0 axes will not be seen)
  var axesHelper = new THREE.AxesHelper(20);
  scene.add(axesHelper);

  // camera.position.x = 3;
  // camera.position.y = 3;
  // camera.position.z = 3;

  addCubes();
  addListeners();
}

function addCubes() {
  cubesOptions.forEach((options) => {
    const geometry = new THREE.BoxGeometry(
      options.width,
      options.height,
      options.height
    );
    geometry.translate(options.x, options.y, options.z);
    const material = new THREE.MeshBasicMaterial({ color: options.color });
    const cube = new THREE.Mesh(geometry, material);

    scene.add(cube);
  });
}

function animate() {
  requestAnimationFrame(animate);

  update();
}

function update() {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon);

  cameraTarget.x = 500 * Math.sin(phi) * Math.cos(theta);
  cameraTarget.y = 500 * Math.cos(phi);
  cameraTarget.z = 500 * Math.sin(phi) * Math.sin(theta);

  camera.lookAt(cameraTarget);

  renderer.render(scene, camera);
}

function onPointerStart(event) {
  console.log("EVENT", "onPointerStart");

  isUserInteracting = true;

  const clientX = event.clientX || (event.touches ? event.touches[0].clientX : 0);
  const clientY = event.clientY || (event.touches ? event.touches[0].clientY : 0);

  onMouseDownMouseX = clientX;
  onMouseDownMouseY = clientY;

  onMouseDownLon = lon;
  onMouseDownLat = lat;
}

function onPointerMove(event) {
  console.log("EVENT", "onPointerMove");

  if (isUserInteracting) {
    const clientX = event.clientX || (event.touches ? event.touches[0].clientX : 0);
    const clientY = event.clientY || (event.touches ? event.touches[0].clientY : 0);

    lon = (onMouseDownMouseX - clientX) * 0.1 + onMouseDownLon;
    lat = (clientY - onMouseDownMouseY) * 0.1 + onMouseDownLat;
  }
}

function onPointerUp() {
  console.log("EVENT", "onPointerUp");

  isUserInteracting = false;
}

function addListeners() {
  document.addEventListener("mousedown", onPointerStart, false);
  document.addEventListener("mousemove", onPointerMove, false);
  document.addEventListener("mouseup", onPointerUp, false);

  document.addEventListener("touchstart", onPointerStart, false);
  document.addEventListener("touchmove", onPointerMove, false);
  document.addEventListener("touchend", onPointerUp, false);

  document.addEventListener(
    "wheel",
    function (event) {
      console.log("EVENT", "wheel");

      const fov = camera.fov + event.deltaY * 0.05;

      camera.fov = THREE.MathUtils.clamp(fov, 10, 75);

      camera.updateProjectionMatrix();
    },
    false
  );

  document.addEventListener(
    "dragover",
    function (event) {
      console.log("EVENT", "dragover");

      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    },
    false
  );

  document.addEventListener(
    "dragenter",
    function () {
      console.log("EVENT", "dragenter");

      document.body.style.opacity = 0.5;
    },
    false
  );

  document.addEventListener(
    "dragleave",
    function () {
      console.log("EVENT", "dragleave");

      document.body.style.opacity = 1;
    },
    false
  );

  document.addEventListener(
    "drop",
    function (event) {
      console.log("EVENT", "drop");

      event.preventDefault();

      const reader = new FileReader();
      reader.addEventListener(
        "load",
        function (event) {
          material.map.image.src = event.target.result;
          material.map.needsUpdate = true;
        },
        false
      );
      reader.readAsDataURL(event.dataTransfer.files[0]);

      document.body.style.opacity = 1;
    },
    false
  );

  window.addEventListener(
    "resize",
    function () {
      console.log("EVENT", "resize");

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    },
    false
  );
}

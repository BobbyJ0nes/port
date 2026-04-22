

import * as THREE from 'three';
import { GLTFLoader }      from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader }     from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls }   from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const bgContent = document.getElementById('bg-marquee-content');
const LINE = "UR A F*CKING NEEK — BUY SOME COOL SH*T NOW!";

let html = "";
for (let i = 0; i < 60; i++) html += `<span>${LINE}</span>`;
bgContent.innerHTML = html;

let virtualScrollY = 0;
const clicker = document.getElementById('scroll-clicker');

window.addEventListener('wheel', (e) => {
  virtualScrollY += e.deltaY * 0.4;
  clicker.style.transform = `rotate(${virtualScrollY % 360}deg)`;
}, { passive: true });

const container = document.getElementById('canvas-container');

const scene  = new THREE.Scene();      
const camera = new THREE.PerspectiveCamera(
  38,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0.2, 5.5);

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
  preserveDrawingBuffer: true,   
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

scene.add(new THREE.AmbientLight(0xffffff, 0.45));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
keyLight.position.set(2.5, 3.5, 4);
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0xbfe9ff, 0.8);
rimLight.position.set(-3, 2, -2);
scene.add(rimLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enableZoom    = false;
controls.enablePan     = false;
controls.minPolarAngle = Math.PI * 0.25;
controls.maxPolarAngle = Math.PI * 0.75;
controls.rotateSpeed   = 0.6;

const pivot = new THREE.Group();
scene.add(pivot);

const draco = new DRACOLoader();
draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

const loader = new GLTFLoader();
loader.setDRACOLoader(draco);
loader.load(
  './MR new.glb',
  (gltf) => {
    const model = gltf.scene;

const box    = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());

window.__bigC_bbox = { x: size.x, y: size.y, z: size.z };

const targetHeight = 3.2;
    const scale = targetHeight / size.y;

    model.position.sub(center);
    pivot.add(model);
    pivot.scale.setScalar(scale);

pivot.rotation.y = Math.PI / 2;

window.__bigC_setRotationY = (r) => { pivot.rotation.y = r; };
    window.__bigC_renderOnce   = () => { controls.update(); renderer.render(scene, camera); };
    window.__bigC_pivotInfo    = { rotation: pivot.rotation, scale: pivot.scale };

window.__bigC_modelLoaded = true;
  },
  undefined,
  (err) => {
    console.error('GLB failed to load:', err);
    
    const fb = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 2, 0.4),
      new THREE.MeshStandardMaterial({ color: 0xd0d0ff, roughness: 0.1, metalness: 0.5 })
    );
    pivot.add(fb);
    window.__bigC_modelLoaded = 'fallback';
  }
);

window.__bigC_paused = false;

function animate() {
  requestAnimationFrame(animate);
  if (window.__bigC_paused) return;

if (pivot) pivot.rotation.y += 0.0025;

  controls.update();
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

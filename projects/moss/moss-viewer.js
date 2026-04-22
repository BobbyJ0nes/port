import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

class MossViewer {
    constructor() {
        this.container = document.getElementById('threejs-container');
        if (!this.container) return;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x060606);

        this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.camera.position.set(0, 1.2, 4);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;

        this.setupLights();
        this.loadModel();
        this.animate();

        window.addEventListener('resize', () => this.onResize());
        
        this.autoRotate = false;
    }

    setupLights() {
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.position.set(5, 5, 5);
        dirLight.castShadow = true;
        this.scene.add(dirLight);
    }

    loadModel() {
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
        
        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader);

        loader.load('./10_1_2025.glb', (gltf) => {
            this.model = gltf.scene;
            
            const box = new THREE.Box3().setFromObject(this.model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2.5 / maxDim;
            
            this.model.scale.setScalar(scale);
            this.model.position.sub(center.multiplyScalar(scale));

            this.pivot = new THREE.Group();
            this.pivot.add(this.model);
            this.scene.add(this.pivot);

            this.model.traverse(n => {
                if (n.isMesh) {
                    n.castShadow = true;
                    n.receiveShadow = true;
                }
            });
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        if (this.autoRotate && this.pivot) {
            this.pivot.rotation.y += 0.01;
        }
        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    toggleAutoRotate() {
        this.autoRotate = !this.autoRotate;
    }

    toggleAutoZoom() {}

    resetView() {
        this.camera.position.set(0, 1.2, 4);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }
}

window.mossViewer = new MossViewer();

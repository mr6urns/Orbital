import * as THREE from 'https://unpkg.com/three@0.165.0/build/three.module.js';
import { createNoise2D } from 'https://unpkg.com/simplex-noise@4.0.1/dist/esm/simplex-noise.js';

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('game-canvas'),
            antialias: true
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        this.camera.position.z = 5;
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 3, 5);
        this.scene.add(directionalLight);
        
        this.noise = createNoise2D();
        this.init();
    }
    
    init() {
        // Create a test sphere
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x4fd1c5,
            wireframe: true
        });
        const sphere = new THREE.Mesh(geometry, material);
        this.scene.add(sphere);
        
        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate);
            
            sphere.rotation.x += 0.01;
            sphere.rotation.y += 0.01;
            
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Remove loading screen after initialization
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
        }, 2000);
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
});
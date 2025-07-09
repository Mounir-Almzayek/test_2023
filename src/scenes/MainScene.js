import * as THREE from 'three';
import { Earth } from '../objects/Earth';
import { Camera } from '../camera/Camera';
import { LaunchPad } from '../objects/LaunchPad';
import { SpaceShuttle } from '../objects/SpaceShuttle';
import { WaterObject } from '../objects/Water';
import { Units } from '../utils/Units';
import { ShuttlePhysics } from '../physics/ShuttlePhysics';

export class MainScene {
    constructor() {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.querySelector('#scene'),
            antialias: true
        });
        this.isInitialized = false;
        this.shuttlePhysics = new ShuttlePhysics();
        this.init();
    }

    async init() {
        try {
            // Setup renderer
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            // Add ambient light
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
            this.scene.add(ambientLight);

            // Add directional light (sun)
            const sunLight = new THREE.DirectionalLight(0xffffff, 1);
            sunLight.position.set(
                Units.toProjectUnits(10000000),
                Units.toProjectUnits(10000000),
                Units.toProjectUnits(10000000)
            );
            sunLight.castShadow = true;
            sunLight.shadow.mapSize.width = 2048;
            sunLight.shadow.mapSize.height = 2048;
            sunLight.shadow.camera.near = 0.5;
            sunLight.shadow.camera.far = Units.toProjectUnits(20000000);
            this.scene.add(sunLight);

            // Add hemisphere light for better ambient lighting
            const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
            this.scene.add(hemisphereLight);

            // Add Earth
            this.earth = new Earth();
            this.scene.add(this.earth.getObject());

            // Add Water
            this.water = new WaterObject(this.earth);
            const waterModel = this.water.getObject();
            if (waterModel) {
                this.scene.add(waterModel);
            }

            // Add Launch Pad
            this.launchPad = new LaunchPad(this.earth);
            const launchPadModel = await this.launchPad.load();
            if (launchPadModel) {
                this.scene.add(launchPadModel);
            }

            // Add Space Shuttle
            this.spaceShuttle = new SpaceShuttle(this.earth, this.shuttlePhysics);
            const shuttleModel = await this.spaceShuttle.load();
            if (shuttleModel) {
                this.scene.add(shuttleModel);
            }

            // Add AxesHelper to visualize X (red), Y (green), Z (blue) axes
            const axesHelper = new THREE.AxesHelper(Units.toProjectUnits(20)); // 20 meters long
            this.scene.add(axesHelper);

            // Setup camera
            this.camera = new Camera(this.earth);

            // Set initialized flag
            this.isInitialized = true;

            // Start animation loop
            this.animate();
        } catch (error) {
            console.error('Error initializing scene:', error);
        }
    }

    onWindowResize() {
        if (!this.camera) return;
        const camera = this.camera.getCamera();
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        if (!this.isInitialized) return;

        requestAnimationFrame(this.animate.bind(this));

        try {
            const deltaTime = 1 / 60; // Fixed time step for physics

            // Update Earth
            if (this.earth) {
                this.earth.update();
            }

            // Update Water if it exists
            if (this.water) {
                this.water.update();
            }

            // Update Launch Pad if it exists
            if (this.launchPad) {
                this.launchPad.update(this.earth.rotationSpeed);
            }

            // Update Space Shuttle if it exists
            if (this.spaceShuttle) {
                this.spaceShuttle.update(deltaTime);
            }

            // Update camera
            if (this.camera) {
                this.camera.update();
            }

            // Render scene
            this.renderer.render(this.scene, this.camera.getCamera());
        } catch (error) {
            console.error('Error in animation loop:', error);
        }
    }
} 
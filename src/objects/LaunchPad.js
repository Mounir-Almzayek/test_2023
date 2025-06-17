import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Units } from '../utils/Units';

export class LaunchPad {
    constructor(earth) {
        this.earth = earth;
        this.model = null;
        this.rotationSpeed = 0;
    }

    // Function to load a model
    loadModel(path, position = { x: 0, y: 0, z: 0 }, rotation = { x: 0, y: 0, z: 0 }, scale = 1) {
        return new Promise((resolve, reject) => {
            const loader = new GLTFLoader();
            loader.load(
                path,
                (gltf) => {
                    const model = gltf.scene;
                    model.position.set(position.x, position.y, position.z);
                    model.rotation.set(rotation.x, rotation.y, rotation.z);
                    model.scale.set(scale, scale, scale);
                    resolve(model);
                },
                undefined,
                (error) => {
                    console.error(`Error loading model ${path}:`, error);
                    reject(error);
                }
            );
        });
    }

    async load() {
        try {
            // Load launch pad model
            this.model = await this.loadModel('/models/rocket_laucher_pad/launch_site.glb');

            // Scale the model to be 500 meters tall
            const targetHeight = Units.toProjectUnits(600); // 600 meters
            const box = new THREE.Box3().setFromObject(this.model);
            const currentHeight = box.max.y - box.min.y;
            const scale = targetHeight / currentHeight;
            this.model.scale.set(scale, scale, scale);

            // Position at camera location (2 meters above surface)
            const height = Units.toProjectUnits(-50); // 50 meters height
            const radius = this.earth.getRadius();
            this.model.position.set(0, radius + height, 0);

            // Add point light to the launch pad
            const light = new THREE.PointLight(0xffffff, 1, Units.toProjectUnits(1000));
            light.position.set(0, Units.toProjectUnits(100), 0);
            this.model.add(light);

            console.log('Launch pad loaded successfully');
            return this.model;
        } catch (error) {
            console.error('Error loading launch pad model:', error);
            return null;
        }
    }

    update(earthRotationSpeed) {
        if (this.model) {
            // Rotate with Earth
            this.model.rotation.y = earthRotationSpeed;
        }
    }
} 
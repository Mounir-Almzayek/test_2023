import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Units } from '../utils/Units';
import { ShuttlePhysics } from '../physics/ShuttlePhysics';
import { ShuttleStages } from '../constants/ShuttleStages';

export class SpaceShuttle {
    constructor(earth) {
        this.earth = earth;
        this.model = null;
        this.rotationSpeed = 0;

        // Store references to individual parts
        this.shuttle = null;
        this.fuelTank = null;
        this.rocket1 = null;
        this.rocket2 = null;

        // Initialize physics system
        this.physics = new ShuttlePhysics();

        // Store initial position and rotation
        this.initialPosition = null;
        this.initialRotation = new THREE.Euler(-Math.PI / 2, 0, -Math.PI / 2);

        // Bind the key handler to this instance
        this.handleKeyDown = this.handleKeyDown.bind(this);
        window.addEventListener('keydown', this.handleKeyDown);
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
            // Create a group for all parts
            this.model = new THREE.Group();

            // Load space shuttle in the middle
            this.shuttle = await this.loadModel('/models/space_shuttle/space_shuttle.glb',
                { x: 0, y: 0, z: 0 },
                { x: -Math.PI / 2, y: 0, z: -Math.PI } // Point upward
            );
            this.model.add(this.shuttle);

            // Load fuel tank
            this.fuelTank = await this.loadModel('/models/fuel_tank/fuel_tank.glb',
                { x: 0, y: 0, z: 0 },
                { x: -Math.PI / 2, y: 0, z: -Math.PI } // Point upward
            );
            this.model.add(this.fuelTank);

            // Load rockets
            this.rocket1 = await this.loadModel('/models/rocket/rocket_1.glb',
                { x: 0, y: 0, z: 0 },
                { x: -Math.PI / 2, y: 0, z: -Math.PI } // Point upward
            );
            this.rocket2 = await this.loadModel('/models/rocket/rocket_2.glb',
                { x: 0, y: 0, z: 0 },
                { x: -Math.PI / 2, y: 0, z: -Math.PI } // Point upward
            );
            this.model.add(this.rocket1);
            this.model.add(this.rocket2);

            // Scale the entire group
            const targetHeight = Units.toProjectUnits(400); // 400 meters height
            const box = new THREE.Box3().setFromObject(this.model);
            const currentHeight = box.max.y - box.min.y;
            const scale = targetHeight / currentHeight;
            this.model.scale.set(scale, scale, scale);

            // Position the entire group
            const height = Units.toProjectUnits(145); // 145 meters height
            const width = Units.toProjectUnits(-210); // 130 meters width
            const radius = this.earth.getRadius();
            this.model.position.set(0, radius + height, width);

            // Store initial position and rotation
            this.initialPosition = this.model.position.clone();
            this.initialRotation = this.model.rotation.clone();

            // Initialize physics with initial position
            this.physics.position.copy(this.initialPosition);

            // Add point light to the shuttle
            const light = new THREE.PointLight(0xffffff, 1, Units.toProjectUnits(1000));
            light.position.set(0, Units.toProjectUnits(100), 0);
            this.model.add(light);

            console.log('Space shuttle loaded successfully');
            return this.model;
        } catch (error) {
            console.error('Error loading space shuttle model:', error);
            return null;
        }
    }

    handleKeyDown(event) {
        // Start launch sequence on spacebar
        if (event.key === ' ' && this.physics.stage === ShuttleStages.IDLE) {
            console.log('Starting launch sequence');
            this.physics.setStage(ShuttleStages.LIFTOFF);
        }
    }

    update(deltaTime) {
        if (this.model) {
            if (this.physics.stage === ShuttleStages.IDLE) {
                // Rocket is stationary on launch pad
                this.model.position.copy(this.initialPosition);
                this.model.rotation.copy(this.initialRotation);
            } else {
                // Update physics
                this.physics.update(deltaTime);

                // Update model position based on physics
                // Scale the movement to make it more visible
                const scaledPosition = this.physics.position.clone();
                scaledPosition.y = this.initialPosition.y + (this.physics.position.y - this.initialPosition.y) * 10;
                this.model.position.copy(scaledPosition);

                // Maintain the original rotation
                this.model.rotation.copy(this.initialRotation);

                // Handle stage-specific effects
                switch (this.physics.stage) {
                    case ShuttleStages.LIFTOFF:
                        // Launch Phase
                        // - Engine sound starts gradually
                        // - Light fire effect for several seconds
                        // - Fire intensity increases significantly
                        // - Fire effect stabilizes with increasing altitude
                        // - Add smoke effect
                        // - Camera shake due to pressure
                        // - Strong air resistance effects
                        // - Breaking the sound barrier
                        break;

                    case ShuttleStages.ATMOSPHERIC_ASCENT:
                        // Atmospheric Ascent Phase
                        // - Engines at full power
                        // - Fire effect decreases due to lower air density
                        // - Continuous smoke effects
                        // - Gradual speed increase
                        // - Noticeable decrease in air resistance
                        // - Reaching 90km altitude
                        // - Booster rockets separation after 2.5 minutes
                        // - Removal of fire and smoke effects from boosters
                        break;

                    case ShuttleStages.ORBITAL_INSERTION:
                        // Orbital Insertion Phase
                        // - Reaching 100km altitude
                        // - Reducing main engine thrust
                        //   (due to mass reduction from booster separation and fuel consumption)
                        // - No air resistance effects
                        // - External tank separation
                        break;

                    case ShuttleStages.ORBITAL_STABILIZATION:
                        // Orbital Stabilization Phase
                        // - Main engines shutdown
                        // - Simulating satellite-like motion
                        // - Exiting Earth's orbit
                        break;

                    case ShuttleStages.FREE_SPACE_MOTION:
                        // Free Space Motion Phase
                        // - Free motion in space
                        // - Influenced only by gravitational forces
                        //   (planets, moon, and nearby celestial bodies)
                        // - No propulsion forces
                        break;

                    case ShuttleStages.ORBITAL_MANEUVERING:
                        // Orbital Maneuvering Phase
                        // - Re-engaging engines
                        // - Applying thrust force
                        // - Changing velocity and direction
                        // - Orbital changes
                        //   (entering and exiting different orbits)
                        break;
                }
            }
        }
    }

    dispose() {
        window.removeEventListener('keydown', this.handleKeyDown);
    }
} 
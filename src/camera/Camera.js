import * as THREE from 'three';
import { Units } from '../utils/Units';

export class Camera {
    constructor(earth) {
        this.earth = earth;
        this.radius = earth.getRadius();

        // Camera settings with our unit system
        this.height = Units.toProjectUnits(2); // 2 meters height
        this.speed = Units.toProjectUnits(2); // 2 meters per second
        this.angle = 0; // Rotation angle around Y axis
        this.pitch = 0; // Look up/down angle
        this.roll = 0;  // Side tilt angle

        // Camera position
        this.position = new THREE.Vector3(0, this.radius + this.height, 0);
        this.lookAt = new THREE.Vector3(0, this.radius + this.height, -1);

        // Setup camera with adjusted near and far planes
        this.camera = new THREE.PerspectiveCamera(
            45, // FOV
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.001, // Near plane - increased to prevent clipping
            this.radius * 100 // Far plane - increased to allow viewing from far away
        );
        this.updateCamera();

        // Setup controls
        this.setupControls();

        // Minimum height above Earth's surface
        this.minHeight = Units.toProjectUnits(0); // 1 meter minimum height
    }

    setupControls() {
        this.keys = {};
        window.addEventListener('keydown', (e) => this.keys[e.key.toLowerCase()] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key.toLowerCase()] = false);
    }

    updateCamera() {
        this.camera.position.copy(this.position);

        const cosPitch = Math.cos(this.pitch);
        const sinPitch = Math.sin(this.pitch);
        const cosAngle = Math.cos(this.angle);
        const sinAngle = Math.sin(this.angle);

        const lookAtPosition = new THREE.Vector3(
            this.position.x + cosAngle * cosPitch,
            this.position.y + sinPitch,
            this.position.z + sinAngle * cosPitch
        );

        this.camera.lookAt(lookAtPosition);
    }

    update() {
        // Speed control
        if (this.keys['shift']) {
            this.speed = Units.toProjectUnits(300); // 300 m/s
        } else {
            this.speed = Units.toProjectUnits(2); // 2 m/s
        }

        // Forward/Backward movement
        if (this.keys['w']) {
            this.moveForward();
        }
        if (this.keys['s']) {
            this.moveBackward();
        }

        // Left/Right movement
        if (this.keys['d']) {
            this.moveLeft();
        }
        if (this.keys['a']) {
            this.moveRight();
        }

        // Up/Down movement
        if (this.keys['q']) {
            this.moveUp();
        }
        if (this.keys['z']) {
            this.moveDown();
        }

        // Rotation
        if (this.keys['arrowright']) {
            this.angle += 0.04;
        }
        if (this.keys['arrowleft']) {
            this.angle -= 0.04;
        }

        // Look up/down
        if (this.keys['arrowup'] && this.pitch + 0.02 < Math.PI / 2) {
            this.pitch += 0.01;
        }
        if (this.keys['arrowdown'] && this.pitch - 0.02 > -Math.PI / 2) {
            this.pitch -= 0.01;
        }

        this.updatePositionOnEarth();
        this.updateCamera();
    }

    moveForward() {
        const cosAngle = Math.cos(this.angle);
        const sinAngle = Math.sin(this.angle);
        const cosPitch = Math.cos(this.pitch);

        const newX = this.position.x + cosAngle * cosPitch * this.speed;
        const newY = this.position.y;
        const newZ = this.position.z + sinAngle * cosPitch * this.speed;

        this.position.set(newX, newY, newZ);
    }

    moveBackward() {
        const cosAngle = Math.cos(this.angle);
        const sinAngle = Math.sin(this.angle);
        const cosPitch = Math.cos(this.pitch);

        const newX = this.position.x - cosAngle * cosPitch * this.speed;
        const newY = this.position.y;
        const newZ = this.position.z - sinAngle * cosPitch * this.speed;

        this.position.set(newX, newY, newZ);
    }

    moveLeft() {
        const cosAngle = Math.cos(this.angle + Math.PI / 2);
        const sinAngle = Math.sin(this.angle + Math.PI / 2);

        const newX = this.position.x + cosAngle * this.speed;
        const newZ = this.position.z + sinAngle * this.speed;

        this.position.set(newX, this.position.y, newZ);
    }

    moveRight() {
        const cosAngle = Math.cos(this.angle + Math.PI / 2);
        const sinAngle = Math.sin(this.angle + Math.PI / 2);

        const newX = this.position.x - cosAngle * this.speed;
        const newZ = this.position.z - sinAngle * this.speed;

        this.position.set(newX, this.position.y, newZ);
    }

    moveUp() {
        const direction = this.position.clone().normalize();
        const newHeight = this.height + this.speed;
        this.height = newHeight;
        this.position.copy(direction.multiplyScalar(this.radius + this.height));
    }

    moveDown() {
        const direction = this.position.clone().normalize();
        const newHeight = this.height - this.speed;

        // Prevent going below minimum height
        if (newHeight > this.minHeight) {
            this.height = newHeight;
            this.position.copy(direction.multiplyScalar(this.radius + this.height));
        }
    }

    updatePositionOnEarth() {
        const distanceFromCenter = this.position.length();
        const targetDistance = this.radius + this.height;

        // Keep camera at fixed height above surface
        if (Math.abs(distanceFromCenter - targetDistance) > 0.1) {
            const direction = this.position.clone().normalize();
            this.position.copy(direction.multiplyScalar(targetDistance));
        }
    }

    getCamera() {
        return this.camera;
    }
} 
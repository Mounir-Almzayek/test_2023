import { PhysicsConstants } from '../constants/PhysicsConstants';
import { ShuttleStages } from '../constants/ShuttleStages';
import * as THREE from 'three';

export class ShuttlePhysics {
    constructor() {
        // Current stage of the shuttle (starts in IDLE)
        this.stage = ShuttleStages.IDLE;

        // Initialize physics properties
        this.position = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.acceleration = new THREE.Vector3();
        this.force = new THREE.Vector3();

        this.currentThrust = 0;
        this.maxThrust = PhysicsConstants.THRUST_MAIN_ENGINES + 2 * PhysicsConstants.THRUST_SOLID_ROCKETS;
        this.thrustRampRate = this.maxThrust / 40;

        // Component masses
        this.shuttleMass = PhysicsConstants.SHUTTLE_MASS;
        this.fuelTankMass = PhysicsConstants.FUEL_TANK_MASS;
        this.rocketMass = PhysicsConstants.ROCKET_MASS;

        // Component states
        this.isFuelTankAttached = true;
        this.isRocket1Attached = true;
        this.isRocket2Attached = true;

        // Remaining fuel percentage (starts at 100%)
        this.fuel = 100;
        this.time = 0;
    }

    /**
     * Calculate total mass based on attached components
     * @returns {number} Total mass of the shuttle system
     */
    calculateTotalMass() {
        let totalMass = this.shuttleMass;

        if (this.isFuelTankAttached) {
            totalMass += this.fuelTankMass;
        }
        if (this.isRocket1Attached) {
            totalMass += this.rocketMass;
        }
        if (this.isRocket2Attached) {
            totalMass += this.rocketMass;
        }

        return totalMass;
    }

    /**
     * Calculate gravitational force using Newton's law of universal gravitation
     * F = G * (M * m) / r²
     * @param {THREE.Vector3} position - Current position vector
     * @returns {THREE.Vector3} Gravitational force vector
     */
    calculateGravityForce(position) {
        const distance = position.length();
        const gravityForce = PhysicsConstants.GRAVITY_CONSTANT *
            PhysicsConstants.EARTH_MASS *
            this.calculateTotalMass() /
            (distance * distance);
        // Point gravity force towards Earth's center (opposite to position vector)
        return position.clone().normalize().multiplyScalar(gravityForce).negate();
    }

    /**
     * Calculate weight force using W = mg
     * @returns {THREE.Vector3} Weight force vector
     */
    calculateWeightForce() {
        // W = mg, using current total mass
        const currentMass = this.calculateTotalMass();
        const weightForce = new THREE.Vector3(0, -PhysicsConstants.GRAVITY * currentMass, 0);
        return weightForce;
    }

    /**
     * Calculate air resistance (drag) force
     * F = 0.5 * ρ * v² * Cd * A
     * @param {THREE.Vector3} velocity - Current velocity vector
     * @param {number} altitude - Current altitude in meters
     * @returns {THREE.Vector3} Air resistance force vector
     */
    calculateAirResistance(velocity, altitude) {
        if (altitude > PhysicsConstants.ATMOSPHERE_HEIGHT) {
            return new THREE.Vector3();
        }

        const airDensity = PhysicsConstants.AIR_DENSITY_SEA_LEVEL *
            Math.exp(-altitude * PhysicsConstants.AIR_DENSITY_DECAY_RATE);

        const dragCoefficient = 0.5;
        const crossSectionalArea = 100; // m²

        const speedSq = velocity.lengthSq();
        if (speedSq === 0 || !isFinite(speedSq)) {
            return new THREE.Vector3();
        }

        const dragForce = 0.5 * airDensity * dragCoefficient * crossSectionalArea * speedSq;
        const norm = velocity.length();
        if (norm === 0 || !isFinite(norm)) {
            return new THREE.Vector3();
        }
        return velocity.clone().normalize().multiplyScalar(-dragForce);
    }

    /**
     * Calculate thrust force based on current stage
     * @param {string} stage - Current shuttle stage
     * @returns {THREE.Vector3} Thrust force vector
     */
    calculateThrust(stage) {
        const thrust = new THREE.Vector3();

        switch (stage) {
            case ShuttleStages.LIFTOFF:
                // Full thrust from all engines
                // thrust.y = PhysicsConstants.THRUST_MAIN_ENGINES +
                //     2 * PhysicsConstants.THRUST_SOLID_ROCKETS;

                thrust.y = 1000000;

                break;
            case ShuttleStages.ATMOSPHERIC_ASCENT:
                // Reduced thrust for atmospheric ascent
                // thrust.y = PhysicsConstants.THRUST_MAIN_ENGINES * 0.8;
                thrust.y = 1000000;

                break;
            case ShuttleStages.ORBITAL_INSERTION:
                // Precise thrust for orbital insertion
                // thrust.y = PhysicsConstants.THRUST_MAIN_ENGINES * 0.5;
                thrust.y = 1000000;

                break;
            default:
                thrust.y = 0;
        }

        return thrust;
    }

    /**
     * Calculate normal force (reaction force from launch pad)
     * @returns {THREE.Vector3} Normal force vector
     */
    calculateNormalForce() {
        // Normal force equals weight force in magnitude but opposite in direction
        const weightForce = this.calculateWeightForce();
        return weightForce.clone().multiplyScalar(-1); // Reverse the direction
    }

    /**
     * Update physics simulation for the current frame
     * @param {number} deltaTime - Time elapsed since last frame in seconds
    */
   update(deltaTime) {
       // Reset total force
       this.force.set(0, 0, 0);
       const currentMass = this.calculateTotalMass();
       
       // // Add gravitational force
       // this.force.add(this.calculateGravityForce(this.position));
       
       // // Add normal force if in IDLE stage (on launch pad)
       // if (this.stage === ShuttleStages.IDLE) {
        //     this.force.add(this.calculateNormalForce());
        // }
        
        // // Add air resistance if in atmosphere
        // const altitude = this.position.length() - PhysicsConstants.EARTH_RADIUS;
        // this.force.add(this.calculateAirResistance(this.velocity, altitude));
        
        // Add thrust force based on current stage
        
        // Calculate acceleration (F = ma) using current total mass
        
        // Update velocity (v = v0 + at)
        
        // Update position (p = p0 + vt)
        
        // Update fuel consumption
        
        switch (this.stage) {
            case ShuttleStages.LIFTOFF: {
                this.currentThrust = Math.min(this.currentThrust + this.thrustRampRate * deltaTime, this.maxThrust);
                let thrust = new THREE.Vector3(0, this.currentThrust, 0);

                this.force.add(thrust);
                this.force.add(this.calculateWeightForce());
                this.force.add(this.calculateNormalForce());
                // Calculate altitude for air resistance
                const altitude = this.position.length() - PhysicsConstants.EARTH_RADIUS;
                this.force.add(this.calculateAirResistance(this.velocity, altitude));
                
                if (this.force.y >= 0) {
                }
                this.acceleration.copy(this.force).divideScalar(currentMass);
                this.velocity.add(this.acceleration.clone().multiplyScalar(deltaTime));
                this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
                break;
            }
            case ShuttleStages.ATMOSPHERIC_ASCENT: {
                break;
            }
            case ShuttleStages.ORBITAL_INSERTION: {
                break;
            }
            case ShuttleStages.ORBITAL_STABILIZATION: {
                break;
            }
        }
        
        if (this.stage !== ShuttleStages.IDLE) {
            this.fuel = Math.max(0, this.fuel - PhysicsConstants.FUEL_CONSUMPTION_RATE * deltaTime);
        }

        // Update stage based on conditions
        this.updateStage();

        this.time += deltaTime;
    }

    /**
     * Update shuttle stage based on current conditions
     * Transitions between stages are automatic based on altitude and velocity
     */
    updateStage() {
        const altitude = this.position.length() - PhysicsConstants.EARTH_RADIUS;
        const velocity = this.velocity.length();

        switch (this.stage) {
            case ShuttleStages.IDLE:
                // Waiting for launch command
                break;
            case ShuttleStages.LIFTOFF:
                // Transition to atmospheric ascent at 1000m altitude
                if (altitude > 1000) {
                    this.stage = ShuttleStages.ATMOSPHERIC_ASCENT;
                }
                break;
            case ShuttleStages.ATMOSPHERIC_ASCENT:
                // Transition to orbital insertion when leaving atmosphere
                if (altitude > PhysicsConstants.ATMOSPHERE_HEIGHT) {
                    this.stage = ShuttleStages.ORBITAL_INSERTION;
                }
                break;
            case ShuttleStages.ORBITAL_INSERTION:
                // Transition to orbital stabilization when reaching orbital velocity
                if (Math.abs(velocity - PhysicsConstants.ORBITAL_VELOCITY_LEO) < 100) {
                    this.stage = ShuttleStages.ORBITAL_STABILIZATION;
                }
                break;
        }
    }

    /**
     * Manually set the shuttle stage
     * @param {string} stage - New stage to set
     */
    setStage(stage) {
        this.stage = stage;
    }

    /**
     * Detach a component from the shuttle
     * @param {string} component - Component to detach ('fuelTank', 'rocket1', 'rocket2')
     */
    detachComponent(component) {
        switch (component) {
            case 'fuelTank':
                this.isFuelTankAttached = false;
                break;
            case 'rocket1':
                this.isRocket1Attached = false;
                break;
            case 'rocket2':
                this.isRocket2Attached = false;
                break;
        }
    }
} 
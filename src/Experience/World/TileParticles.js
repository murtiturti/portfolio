import * as THREE from 'three';
import Experience from '../Experience';
import { CAR_BASE_Y, CAR_TIRE_X_OFFSET } from './Car';
import tileVertexShader from '../../shaders/tiles/vertex.glsl';
import tileFragmentShader from '../../shaders/tiles/fragment.glsl';

const SPAWN_RATE = 10
const PARTICLE_LIFETIME = 1.2
const SPAWN_Y = CAR_BASE_Y - 0.5
const PARTICLE_SPAWN_Z = 3.1
const VEL_X_RANGE = 3
const VEL_Y_BASE = 5
const VEL_Y_VAR = 5
const VEL_Z_BASE = 10
const VEL_Z_VAR = 3
const GRAVITY = 9.8
const EMIT_SPEED_THRESHOLD = 0.2  // fraction of maxSpeed

export default class TileParticles {
    constructor(maxCount, right) {
        this.experience = new Experience();
        this.maxCount = maxCount;

        // Spawning and lifetime parameters:
        this.spawnRate = SPAWN_RATE;             // Number of particles to spawn per second.
        this.spawnInterval = 1 / this.spawnRate; // Time interval (seconds) between spawns.
        this.lifetime = PARTICLE_LIFETIME;       // Lifetime (in seconds) of each particle.
        this.elapsedTime = 0;             // Global elapsed time tracker.
        this.wasEmitting = false;
        this.right = right

        this.geometry = new THREE.PlaneGeometry(1, 1);

        this.material = new THREE.ShaderMaterial({
            vertexShader: tileVertexShader,
            fragmentShader: tileFragmentShader,
            side: THREE.DoubleSide,
        });

        this.instancedMesh = new THREE.InstancedMesh(this.geometry, this.material, this.maxCount);
        this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

        this.dummy = new THREE.Object3D();
        this.particles = [];

        // Create a pool of particles. For each particle we
        // initialize the spawnTime, and start with a hidden scale.
        for (let i = 0; i < this.maxCount; i++) {
            // Stagger initial spawns so that the first particle spawns immediately.
            const spawnTime = i * this.spawnInterval;
            const particle = {
                // Define the spawn position.
                position: new THREE.Vector3(0, SPAWN_Y, PARTICLE_SPAWN_Z),
                rotation: new THREE.Euler(0, 0, 90),
                // Start off hidden.
                scale: new THREE.Vector3(0, 0, 0),
                velocity: new THREE.Vector3((Math.random() - 0.5) * VEL_X_RANGE, VEL_Y_BASE + Math.random() * VEL_Y_VAR, VEL_Z_BASE + Math.random() * VEL_Z_VAR),
                life: 0,           // Time (seconds) particle has been active.
                active: false,     // Is the particle spawned/active?
                spawnTime: spawnTime, // When to spawn this particle.
            };

            this.particles.push(particle);

            // Initialize the instance with the particle's properties.
            this.dummy.position.copy(particle.position);
            this.dummy.rotation.copy(particle.rotation);
            this.dummy.scale.copy(particle.scale);
            this.dummy.updateMatrix();
            this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
        }

        this.instancedMesh.instanceMatrix.needsUpdate = true;
        this.experience.scene.add(this.instancedMesh);
    }


    update() {
        // Get delta time from Experience. Ensure it is in seconds.
        let deltaTime = this.experience.time.delta;
        // If delta is in milliseconds, uncomment the following line:
        deltaTime *= 0.001;


        const emit = this.experience.state.speed >= (this.experience.state.maxSpeed * EMIT_SPEED_THRESHOLD)

        // On emission start, stagger the pool so particles don't all spawn at once
        if (emit && !this.wasEmitting)
        {
            for (let i = 0; i < this.maxCount; i++)
            {
                if (!this.particles[i].active)
                {
                    this.particles[i].spawnTime = this.elapsedTime + i * this.spawnInterval
                }
            }
        }
        this.wasEmitting = emit

        if (emit)
        {
            this.elapsedTime += deltaTime
        }

        const carModel = this.experience.world.car.model

        for (let i = 0; i < this.maxCount; i++) {
            const particle = this.particles[i];

            if (!emit && !particle.active)
            {
                particle.spawnTime = this.elapsedTime
            }

            // If the particle is inactive and its scheduled spawn time has arrived, activate it.
            if (!particle.active && emit && this.elapsedTime >= particle.spawnTime) 
            {
                particle.active = true;
                particle.life = 0;
                // Reset position to spawn point.
                const tirePosition = carModel.position.x + (CAR_TIRE_X_OFFSET * this.right)
                particle.position.set(tirePosition + (Math.random() - 0.5) * 0.125, SPAWN_Y, PARTICLE_SPAWN_Z);
                // Make it visible.
                particle.scale.set(Math.random() * 0.5 + 0.1, Math.random() * 0.5 + 0.1, Math.random() * 0.5 + 0.1);
                // Reset particle velocity
                particle.velocity.set((Math.random() - 0.5) * VEL_X_RANGE, VEL_Y_BASE + Math.random() * VEL_Y_VAR, VEL_Z_BASE + Math.random() * VEL_Z_VAR)
                // Reset particle rotation
                particle.rotation.set(0, 0, 90)
            }

            if (particle.active) {
                // Update the particle's life.
                particle.life += deltaTime;

                // Check if the particle has exceeded its lifetime.
                if (particle.life > this.lifetime) {
                    particle.active = false;
                    particle.life = 0;
                    // Schedule the next spawn.
                    particle.spawnTime = this.elapsedTime + this.spawnInterval;
                    // Hide the particle.
                    particle.scale.set(0, 0, 0);
                } else {
                    // Update the particle's position based on velocity (time-based).
                    particle.position.addScaledVector(particle.velocity, deltaTime);
                    particle.rotation.x += deltaTime * 10
                    particle.rotation.y += deltaTime * 3
                    // Increase z velocity here
                    particle.velocity.z += deltaTime * this.experience.state.speed
                    particle.velocity.y -= deltaTime * GRAVITY
                }
            }

            // Update the instance matrix for this particle.
            this.dummy.position.copy(particle.position);
            this.dummy.rotation.copy(particle.rotation);
            this.dummy.scale.copy(particle.scale);
            this.dummy.updateMatrix();
            this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
        }

        this.instancedMesh.instanceMatrix.needsUpdate = true;
        this.instancedMesh.computeBoundingSphere();
    }
}

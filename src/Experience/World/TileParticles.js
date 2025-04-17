import * as THREE from 'three';
import Experience from '../Experience';
import tileVertexShader from '../../shaders/tiles/vertex.glsl';
import tileFragmentShader from '../../shaders/tiles/fragment.glsl';

export default class TileParticles {
    constructor(maxCount, right) {
        this.experience = new Experience();
        this.maxCount = maxCount;

        // Spawning and lifetime parameters:
        this.spawnRate = 4;              // Number of particles to spawn per second.
        this.spawnInterval = 1 / this.spawnRate; // Time interval (seconds) between spawns.
        this.lifetime = 5;                // Lifetime (in seconds) of each particle.
        this.elapsedTime = 0;             // Global elapsed time tracker.
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
                position: new THREE.Vector3(0, -7.2, 3.1),
                rotation: new THREE.Euler(0, 0, 0),
                // Start off hidden.
                scale: new THREE.Vector3(0, 0, 0),
                velocity: new THREE.Vector3((Math.random() - 0.5) * 0.5, 1.5, 6),
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


        // Only spawn new particles if current speed is at least half of max speed
        const emit = this.experience.world.terrain.currentSpeed >= (this.experience.world.terrain.maxSpeed * 0.5)

        if (emit)
        {
            this.elapsedTime += deltaTime
        }

        const carModel = this.experience.world.car.model

        for (let i = 0; i < this.maxCount; i++) {
            const particle = this.particles[i];

            if (!emit && !particle.active)
            {
                particle.spawnTime += deltaTime
            }

            // If the particle is inactive and its scheduled spawn time has arrived, activate it.
            if (!particle.active && this.elapsedTime >= particle.spawnTime) 
            {
                particle.active = true;
                particle.life = 0;
                // Reset position to spawn point.
                const tirePosition = carModel.position.x + (1.25 * this.right)
                particle.position.set(tirePosition, -7.5, 3.1);
                // Make it visible.
                particle.scale.set(Math.random() * 0.5 + 0.1, Math.random() * 0.5 + 0.1, Math.random() * 0.5 + 0.1);
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

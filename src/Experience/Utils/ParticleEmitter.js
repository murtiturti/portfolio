import * as THREE from 'three'

export default class ParticleEmitter
{
    constructor({particles, position, time})
    {
        // Particle data
        this.geometry = particles.geometry
        this.material = particles.material
        this.points = new THREE.Points(this.geometry, this.material) // ADD TO SCENE

        // Particle anim data
        this.speed = 1
        this.direction = new THREE.Vector3(0, 0.2, 1)

        this.particles = particles

        // Emitter
        this.position = position
        this.maxParticleCount = this.particles.maxCount
        this.currentParticleCount = 0
        this.particleLifeTime = 2
        this.lastEmissionTime = 0
        this.rate = 2 // 2 tiles per second
        this.time = time
    }

    // Emit is called once per update
    emit()
    {
        if (this.currentParticleCount >= this.maxParticleCount)
        {
            return
        }
    
        const i = this.currentParticleCount
        const currentTime = this.time.elapsed / 1000
        const posIndex = i * 3

        // Set initial position
        this.geometry.attributes.position.array[posIndex] = this.position.x
        this.geometry.attributes.position.array[posIndex + 1] = this.position.y
        this.geometry.attributes.position.array[posIndex + 2] = this.position.z

        this.geometry.attributes.aBirthTime.array[i] = currentTime

        // Set the particle's velocity
        const velocity = this.direction.multiplyScalar(this.speed)

        this.geometry.attributes.aVelocity.array[posIndex] = velocity.x
        this.geometry.attributes.aVelocity.array[posIndex + 1] = velocity.y
        this.geometry.attributes.aVelocity.array[posIndex + 2] = velocity.z

        this.currentParticleCount++
    }

    update()
    {
        const currentTime = this.time.elapsed / 1000

        this.particles.material.uniforms.uTime.value = currentTime

        const emissionInterval = 1 / this.rate
        while (currentTime - this.lastEmissionTime > emissionInterval && this.currentParticleCount < this.maxParticleCount)
        {
            this.emit()
            this.lastEmissionTime += emissionInterval
        }

        this.geometry.attributes.position.needsUpdate = true
        this.geometry.attributes.aBirthTime.needsUpdate = true
        this.geometry.attributes.aVelocity.needsUpdate = true
    }
}
import * as THREE from 'three'
import Experience from '../Experience.js'
import terrainVertexShader from '../../shaders/terrain/vertex.glsl'
import terrainFragmentShader from '../../shaders/terrain/fragment.glsl'

export default class Terrain 
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug
        this.time = this.experience.time
        this.uniforms = 
        {
            uBigHillElevation: new THREE.Uniform(8.45),
            uBigHillFrequency: new THREE.Uniform(new THREE.Vector2(0.145, 0.084)),
            uColor: new THREE.Uniform(new THREE.Color('#00ff00')),
            uTime: new THREE.Uniform(0),
            uRoadElevation: new THREE.Uniform(-8),
            uValleyDepth: new THREE.Uniform(27.8),
            uCarYRotation: new THREE.Uniform(0),
            uDistance: new THREE.Uniform(0),
            uHorizonLineIntensity: new THREE.Uniform(3.0)
        }

        this.distance = 0
        this.maxSpeed = 10
        this.currentSpeed = 0
        this.acceleration = 0.0075
        this.deceleration = -0.05

        if (this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Terrain')
        }

        this.setGeometry()
        this.setTextures()
        this.setMaterial()
        this.setMesh()
    }

    setGeometry()
    {
        this.geometry = new THREE.PlaneGeometry(64, 64, 128, 128)
    }

    setTextures()
    {
        this.textures = {}
    }

    setMaterial()
    {
        this.material = new THREE.ShaderMaterial({
            wireframe: true,
            vertexShader: terrainVertexShader,
            fragmentShader: terrainFragmentShader,
            uniforms: this.uniforms
        })

        if (this.debug.active)
        {
            this.debugFolder
                .add(this.material.uniforms.uBigHillElevation, 'value')
                .name('Big Hill Elevation')
                .min(0)
                .max(20)
                .step(0.01)
            this.debugFolder.add(this.material.uniforms.uBigHillFrequency.value, 'x')
                .name('Big Hill Frequency X')
                .min(0)
                .max(5)
                .step(0.001)
            this.debugFolder.add(this.material.uniforms.uBigHillFrequency.value, 'y')
                .name('Big Hill Frequency Z')
                .min(0)
                .max(5)
                .step(0.001)
            this.debugFolder.add(this.material.uniforms.uRoadElevation, 'value')
                .name('Road Elevation')
                .min(-10)
                .max(0)
                .step(0.01)
            this.debugFolder.add(this.material.uniforms.uValleyDepth, 'value')
                .name('Valley Depth')
                .min(8)
                .max(50)
                .step(0.01)
        }
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.rotation.x = - Math.PI * 0.5
        this.scene.add(this.mesh)
    }

    update()
    {
        if (this.experience.moving)
        {
            this.currentSpeed += this.acceleration
        }
        else
        {
            this.currentSpeed += this.deceleration
        }
        
        this.currentSpeed = Math.min(Math.max(this.currentSpeed, 0), this.maxSpeed)
        this.distance += this.currentSpeed * this.time.delta * 0.0001
        this.material.uniforms.uTime.value = this.distance
        // this.material.uniforms.uTime.value = this.experience.totalHoldTime * 0.0005 * Math.min(this.currentSpeed, this.maxSpeed)
        // this.material.uniforms.uCarYRotation.value = -this.experience.world.car.model.rotation.y * (180 / Math.PI)
    }
}
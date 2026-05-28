import * as THREE from 'three'
import Experience from '../Experience.js'
import timeline from '../timeline.js'
import terrainVertexShader from '../../shaders/terrain/vertex.glsl'
import terrainFragmentShader from '../../shaders/terrain/fragment.glsl'

const ACCELERATION = 0.0095
const DECELERATION = -0.05
const DEFAULT_HILL_ELEVATION = 8.45
const DEFAULT_HILL_FREQUENCY = new THREE.Vector2(0.145, 0.084)
const DEFAULT_ROAD_ELEVATION = -8
const DEFAULT_VALLEY_DEPTH = 27.8
const TERRAIN_SIZE = 64
const TERRAIN_SEGMENTS = 128

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
            uBigHillElevation: new THREE.Uniform(DEFAULT_HILL_ELEVATION),
            uBigHillFrequency: new THREE.Uniform(DEFAULT_HILL_FREQUENCY.clone()),
            uColor: new THREE.Uniform(new THREE.Color('#00ff00')),
            uTime: new THREE.Uniform(0),
            uRoadElevation: new THREE.Uniform(DEFAULT_ROAD_ELEVATION),
            uValleyDepth: new THREE.Uniform(DEFAULT_VALLEY_DEPTH),
            uCarYRotation: new THREE.Uniform(0),
            uDistance: new THREE.Uniform(0),
            uHorizonLineIntensity: new THREE.Uniform(this.experience.state.horizonIntensity)
        }

        this.distance = 0
        this.finishDistance = this.experience.state.finishDistance
        this.flattenAmount = 0
        this.baseHillElevation = this.uniforms.uBigHillElevation.value
        this.baseRoadElevation = this.uniforms.uRoadElevation.value

        this.maxSpeed = this.experience.state.maxSpeed
        this.currentSpeed = 0
        this.acceleration = ACCELERATION
        this.deceleration = DECELERATION

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
        this.geometry = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS)
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
            this.debugFolder.add(this, 'finishDistance')
                .name('Finish Distance')
                .min(100)
                .max(2000)
                .step(1)
            this.debugFolder.add(this, 'acceleration')
                .name('Acceleration')
                .min(0.001)
                .max(0.05)
                .step(0.0001)
            this.debugFolder.add(this, 'deceleration')
                .name('Deceleration')
                .min(-0.2)
                .max(-0.001)
                .step(0.001)
            this.debugFolder.add(this, 'maxSpeed')
                .name('Max Speed')
                .min(1)
                .max(30)
                .step(0.1)
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
        const flatStart = this.finishDistance * timeline.terrain.flattenStart
        const flatEnd = this.finishDistance * timeline.terrain.flattenEnd
        const raw = Math.max(0, Math.min(1, (this.distance - flatStart) / (flatEnd - flatStart)))
        this.flattenAmount = raw * raw * (3 - 2 * raw)
        this.uniforms.uBigHillElevation.value = this.baseHillElevation * (1 - this.flattenAmount)
        this.uniforms.uRoadElevation.value  = this.baseRoadElevation  * (1 - this.flattenAmount)

        const { isDragging, moving } = this.experience.state

        if (!isDragging && this.distance < this.finishDistance)
        {
            if (this.distance >= flatEnd)
            {
                this.currentSpeed = moving ? this.maxSpeed : 0
            }
            else if (moving)
            {
                this.currentSpeed += this.acceleration
            }
            else
            {
                this.currentSpeed += this.deceleration
            }
            this.currentSpeed = Math.min(Math.max(this.currentSpeed, 0), this.maxSpeed)
            this.distance += this.currentSpeed * this.time.delta * 0.0001
            this.distance = Math.min(this.distance, this.finishDistance)
        }
        else
        {
            this.currentSpeed = 0
        }

        this.material.uniforms.uTime.value = this.distance
    }
}
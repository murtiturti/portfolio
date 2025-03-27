import * as THREE from 'three'
import Experience from '../experience'
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
        this.uniforms = 
        {
            uBigHillElevation: new THREE.Uniform(10),
            uBigHillFrequency: new THREE.Uniform(new THREE.Vector2(0.145, 0.084)),
            uColor: new THREE.Uniform(new THREE.Color('#00ff00'))
        }

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
                .max(10)
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
        }
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.rotation.x = - Math.PI * 0.5
        this.scene.add(this.mesh)
    }
}
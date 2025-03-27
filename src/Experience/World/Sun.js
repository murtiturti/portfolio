import * as THREE from 'three'
import Experience from '../experience'
import sunVertexShader from '../../shaders/sun/vertex.glsl'
import sunFragmentShader from '../../shaders/sun/fragment.glsl'

export default class Sun
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        // this.time = this.experience.time
        this.debug = this.experience.debug

        if (this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Sun')
        }

        this.setGeometry()
        this.setTextures()
        this.setMaterial()
        this.setMesh()
    }

    setGeometry()
    {
        this.geometry = new THREE.SphereGeometry(10, 32, 32)
    }

    setTextures()
    {
        this.textures = {} //TODO: Add sun texture later (maybe)
    }

    setMaterial()
    {
        this.material = new THREE.ShaderMaterial({
            vertexShader: sunVertexShader,
            fragmentShader: sunFragmentShader,
            uniforms:
            {
                uColor: new THREE.Uniform(new THREE.Color('#f58505')),
                uTime: new THREE.Uniform(0)
            }
        })
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.position.set(0.2, 8, -65)
        this.mesh.receiveShadow = false
        this.scene.add(this.mesh)
    }

    update()
    {
        this.material.uniforms.uTime.value += this.experience.time.delta
    }


}
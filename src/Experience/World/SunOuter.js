import * as THREE from 'three'
import Experience from '../experience'
import sunVertexShader from '../../shaders/sunOuter/vertex.glsl'
import sunFragmentShader from '../../shaders/sunOuter/fragment.glsl'

export default class SunOuter
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        // this.time = this.experience.time
        this.debug = this.experience.debug

        this.setGeometry()
        this.setTextures()
        this.setMaterial()
        this.setMesh()
    }

    setGeometry()
    {
        this.geometry = new THREE.SphereGeometry(12, 32, 32)
    }

    setTextures()
    {
        this.textures = {} //TODO: Add sun texture later (maybe)
    }

    setMaterial()
    {   
        this.material = new THREE.ShaderMaterial({
            side: THREE.BackSide,
            transparent: true,
            vertexShader: sunVertexShader,
            fragmentShader: sunFragmentShader,
            uniforms:
            {
                uAtmosphereDayColor: new THREE.Uniform(new THREE.Color('#f74205'))
            }
        })
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.scale.setScalar(1.017);
        this.mesh.position.set(0.2, 5, -65)
        this.mesh.rotation.set(Math.PI, 0, 0)
        this.mesh.receiveShadow = false
        this.scene.add(this.mesh)
    }

    update()
    {
        this.material.uniforms.uTime.value += this.experience.time.delta
    }


}
import * as THREE from 'three'
import Experience from '../experience'
import sunVertexShader from '../../shaders/sun/vertex.glsl'
import sunFragmentShader from '../../shaders/sun/fragment.glsl'
import GradientTexture from '../Utils/GradientTexture'

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

        if (this.debug.active)
        {
            const debugObject = {
                topColor: '#' + this.material.uniforms.uTopColor.value.getHexString(),
                bottomColor: '#' + this.material.uniforms.uBottomColor.value.getHexString()
            }
            this.debugFolder.addColor(debugObject, 'topColor')
                .name('Sun Top Color')
                .onChange((value) => {
                    this.material.uniforms.uTopColor.value.set(value)
                })
            this.debugFolder.addColor(debugObject, 'bottomColor')
                .name('Sun Bottom Color')
                .onChange((value) => {
                    this.material.uniforms.uBottomColor.value.set(value)
                })
        }
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
            vertexShader: sunVertexShader,
            fragmentShader: sunFragmentShader,
            transparent: true,
            depthWrite: false,
            uniforms:
            {
                uTime: new THREE.Uniform(0),
                uNumBands: new THREE.Uniform(12),
                uTopColor: new THREE.Uniform(new THREE.Color('#f74205')),
                uBottomColor: new THREE.Uniform(new THREE.Color('#ff1803'))
            }
        })
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.position.set(0.2, 5, -65)
        this.mesh.rotation.set(Math.PI, 0, 0)
        this.mesh.receiveShadow = false
        this.scene.add(this.mesh)
    }

    update()
    {
        this.material.uniforms.uTime.value += this.experience.time.delta
        this.mesh.rotation.y += this.experience.time.delta / 5000;
    }


}
import * as THREE from 'three'
import SunBase from './SunBase.js'
import sunVertexShader from '../../shaders/sun/vertex.glsl'
import sunFragmentShader from '../../shaders/sun/fragment.glsl'

export { SUN_POSITION, SUN_ROTATION } from './SunBase.js'

const ROTATION_RATE = 1 / 5000

export default class Sun extends SunBase
{
    setMaterial()
    {
        this.material = new THREE.ShaderMaterial({
            vertexShader: sunVertexShader,
            fragmentShader: sunFragmentShader,
            transparent: true,
            depthWrite: false,
            uniforms:
            {
                uTime:        new THREE.Uniform(0),
                uNumBands:    new THREE.Uniform(12),
                uTopColor:    new THREE.Uniform(new THREE.Color('#f74205')),
                uBottomColor: new THREE.Uniform(new THREE.Color('#ff1803')),
            },
        })
    }

    setDebug()
    {
        if (!this.debug.active) return

        const folder = this.debug.ui.addFolder('Sun')
        const debugObject = {
            topColor:    '#' + this.material.uniforms.uTopColor.value.getHexString(),
            bottomColor: '#' + this.material.uniforms.uBottomColor.value.getHexString(),
        }
        folder.addColor(debugObject, 'topColor')
            .name('Sun Top Color')
            .onChange((value) => this.material.uniforms.uTopColor.value.set(value))
        folder.addColor(debugObject, 'bottomColor')
            .name('Sun Bottom Color')
            .onChange((value) => this.material.uniforms.uBottomColor.value.set(value))
        folder.add(this.mesh.position, 'x').min(-100).max(100).step(0.01).name('Sun Position X')
        folder.add(this.mesh.position, 'y').min(-100).max(100).step(0.01).name('Sun Position Y')
        folder.add(this.mesh.position, 'z').min(-100).max(100).step(0.01).name('Sun Position Z')
    }

    update()
    {
        const delta = this.experience.time.delta
        this.material.uniforms.uTime.value += delta
        this.mesh.rotation.y += delta * ROTATION_RATE
    }
}

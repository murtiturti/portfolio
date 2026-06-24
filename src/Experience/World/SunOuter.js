import * as THREE from 'three'
import SunBase from './SunBase.js'
import sunOuterVertexShader from '../../shaders/sunOuter/vertex.glsl'
import sunOuterFragmentShader from '../../shaders/sunOuter/fragment.glsl'

const SCALE = 1.07

export default class SunOuter extends SunBase
{
    setMaterial()
    {
        this.material = new THREE.ShaderMaterial({
            side: THREE.BackSide,
            transparent: true,
            vertexShader: sunOuterVertexShader,
            fragmentShader: sunOuterFragmentShader,
            uniforms:
            {
                uAtmosphereDayColor: new THREE.Uniform(new THREE.Color('#f74205')),
            },
        })
    }

    setMesh()
    {
        super.setMesh()
        this.mesh.scale.setScalar(SCALE)
    }
}

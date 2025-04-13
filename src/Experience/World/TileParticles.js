import * as THREE from 'three'
import tileVertexShader from '../../shaders/tiles/vertex.glsl'
import tileFragmentShader from '../../shaders/tiles/fragment.glsl'

export default class TileParticles
{
    constructor(maxCount)
    {
        this.maxCount = maxCount

        this.geometry = new THREE.BufferGeometry()

        this.setAttributes()

        this.material = new THREE.ShaderMaterial(
            {
                depthWrite: false,
                blending: THREE.NoBlending,
                vertexShader: tileVertexShader,
                fragmentShader: tileFragmentShader
            }
        )
    }

    setAttributes()
    {
        this.positions = new Float32Array(this.maxCount * 3)
        this.aBirthTime = new Float32Array(this.maxCount)
        this.aVelocity = new Float32Array(this.maxCount * 3)

        this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
        this.geometry.setAttribute('aBirthTime', new THREE.BufferAttribute(this.aBirthTime, 1))
        this.geometry.setAttribute('aVelocity', new THREE.BufferAttribute(this.aVelocity, 3))
    }
}
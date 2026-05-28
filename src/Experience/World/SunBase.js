import * as THREE from 'three'
import Experience from '../Experience'

export const SUN_POSITION = new THREE.Vector3(-1, -6, -65)
export const SUN_ROTATION = new THREE.Euler(Math.PI, 0, 0)

// Shared base for sun-like spheres positioned on the horizon.
// Subclasses supply their own material in setMaterial().
export default class SunBase
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.debug = this.experience.debug

        this.setGeometry()
        this.setMaterial()
        this.setMesh()
        this.setDebug?.()
    }

    setGeometry()
    {
        this.geometry = new THREE.SphereGeometry(6, 32, 32)
    }

    setMaterial()
    {
        throw new Error('SunBase subclass must implement setMaterial()')
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.position.copy(SUN_POSITION)
        this.mesh.rotation.copy(SUN_ROTATION)
        this.mesh.receiveShadow = false
        this.scene.add(this.mesh)
    }
}

import * as THREE from 'three'
import Experience from '../experience'

export default class Background
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
            this.debugFolder = this.debug.ui.addFolder('Background')
        }

        // Setup
        this.resource = this.resources.items.backgroundTexture

        this.setGeometry()
        this.setTextures()
        this.setMaterial()
        this.setMesh()
        this.setDebug()
    }

    setGeometry()
    {
        this.geometry = new THREE.PlaneGeometry(32, 16, 1, 1)
    }

    setTextures()
    {
        this.textures = {}
        this.textures.color = this.resources.items.backgroundTexture
        this.textures.color.colorSpace = THREE.SRGBColorSpace
    }

    setMaterial()
    {
        this.material = new THREE.MeshBasicMaterial({
            map: this.textures.color,
            transparent: true
        }
        )
    }

    setMesh()
    {
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.position.y = -4.3
        this.mesh.position.z = -37

        this.experience.scene.add(this.mesh)
    }

    setDebug()
    {
        if (this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('Background')
            this.debugFolder.add(this.mesh.position, 'x', -50, 50, 0.1).name('Position X')
            this.debugFolder.add(this.mesh.position, 'y', -50, 50, 0.1).name('Position Y')
            this.debugFolder.add(this.mesh.position, 'z', -50, 50, 0.1).name('Position Z')
        }
    }
}
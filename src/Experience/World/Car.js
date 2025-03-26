import * as THREE from 'three'
import Experience from '../experience'

export default class Car
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
            this.debugFolder = this.debug.ui.addFolder('Car')
        }

        // Setup
        this.resource = this.resources.items.carModel

        this.setModel()
        this.setAnimation()
    }

    setModel()
    {
        this.model = this.resource.scene
        this.model.scale.setScalar(1.0)
        this.model.position.y += 0.5
        this.scene.add(this.model)

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh)
            {
                child.castShadow = true
            }
        })
    }

    setAnimation()
    {
        this.animation = {} // No anim
    }

}
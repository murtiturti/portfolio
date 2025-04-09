import * as THREE from 'three'
import Experience from '../Experience'

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

        this.totalMoveTime = 0

        this.setModel()
        this.setAnimation()
    }

    setModel()
    {
        this.model = this.resource.scene
        this.model.scale.setScalar(1.0)
        this.model.position.y = -7
        this.scene.add(this.model)

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh)
            {
                child.castShadow = true
            }
        })

        if (this.debug.active)
        {
            this.debugFolder.add(this.model.position, 'y')
                            .name('Car Position Y')
                            .min(-10)
                            .max(10)
                            .step(0.01)
        }
    }

    setAnimation()
    {
        this.animation = {} // No anim
    }


    update()
    {
        // if (this.experience.moving)
        // {
            //this.model.rotation.y = Math.sin(this.experience.time.elapsed * 0.0005) * Math.PI / 6
            // this.totalMoveTime = this.experience.totalHoldTime * 0.0005
            this.totalMoveTime = this.experience.world.terrain.distance

            // Calculate derivative at point 0.5 (center of terrain uv)
            const v = 0.5
            const rotationSampleDelta = 0.001 

            const rotationSample0 = (Math.sin(0.3 * 0.5 + this.totalMoveTime) * Math.sin(0.1 * 0.5 + this.totalMoveTime)) * 3.0
            const rotationSample1 = (Math.sin(0.3 * 0.5 + this.totalMoveTime + rotationSampleDelta) * Math.sin(0.1 * 0.5 + this.totalMoveTime + rotationSampleDelta)) * 3.0
            const theta = Math.atan2(rotationSample1 - rotationSample0, rotationSampleDelta)
            this.model.rotation.y = theta * 0.1
            this.model.position.x = 0 - (Math.sin(0.3 * 0.5 + this.totalMoveTime * 1.0) * Math.sin(0.1 * 0.5 + this.totalMoveTime * 1.0)) * 3.0
        // }
    }
}
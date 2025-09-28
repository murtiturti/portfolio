import * as THREE from 'three'
import Experience from './Experience'

export default class BillboardController
{
    constructor(billboardsArray)
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        
        this.billboardsArray = billboardsArray
        this.activeBillboardIndex = 0 // for initial spawn

        this.spawnPositionZ = -20
    }

    spawn()
    {
        const newActiveBillboard = this.billboardsArray[this.activeBillboardIndex]
        newActiveBillboard.model.position.z = this.spawnPositionZ
        newActiveBillboard.setActive(true)
    }

    despawn()
    {
        const activeBillboard = this.billboardsArray[this.activeBillboardIndex] 
        activeBillboard.setActive(false)
    }

    update()
    {
        const activeBillboard = this.billboardsArray[this.activeBillboardIndex]
        activeBillboard.update()
        if (activeBillboard.model.position.z > this.experience.world.car.model.position.z)
        {
            this.despawn()
            this.next()
            this.spawn()
        }
    }

    next()
    {
        const billboardCount = this.billboardsArray.length // use for index checking

        // choose new active billboard index
        let newIndex = this.activeBillboardIndex + 1
        if (newIndex === billboardCount)
        {
            newIndex = 0
        }
        this.activeBillboardIndex = newIndex
    }
}
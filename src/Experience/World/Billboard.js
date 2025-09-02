import * as THREE from 'three'
import Experience from '../Experience'
import gsap from 'gsap'

export default class Billboard
{
    constructor(resourceName)
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.resource = this.resources.items[resourceName]
        
        this.billboardDefaultHeight = 0
        
        this.setModel()
        this.setActive(false)
    }

    setModel()
    {
        // this.model = this.resource.scene
        // uncomment line below for placeholder
        this.model = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), new THREE.MeshBasicMaterial({color: 'cyan'}))
        this.model.position.y = this.billboardDefaultHeight
        this.model.position.z = -10
        this.model.scale.x = 2
        this.model.scale.z = 0.2

        this.scene.add(this.model)
        this.hoverAnimation = gsap.to(
            this.model.position,
            {
                duration: 1, 
                y: this.billboardDefaultHeight + 2,
                yoyo: true,
                repeat: -1,
                ease: 'sine.inOut'
            }   
        )
    }

    setActive(isActive)
    {
        this.isActive = isActive
        if (!isActive)
        {
            this.hoverAnimation?.pause()
            this.model.visible = false
        }
        else
        {
            this.hoverAnimation?.resume()
            this.model.visible = true
        }
    }

    update()
    {
        if (this.isActive)
        {
            // Do whatever logic here if needed
        }   
    }
}
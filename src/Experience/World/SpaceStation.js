import * as THREE from 'three'
import Experience from '../Experience'

export default class SpaceStation
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene

        this.startZ = -80

        this.group = new THREE.Group()
        this.group.position.set(0, 0, this.startZ)
        this.group.visible = false

        this.buildLaunchpad()
        this.buildRocket()

        this.scene.add(this.group)
    }

    buildLaunchpad()
    {
        // Main pad surface
        const padGeo = new THREE.CylinderGeometry(8, 8, 0.4, 8)
        const padMat = new THREE.MeshStandardMaterial({ color: '#555560' })
        const pad = new THREE.Mesh(padGeo, padMat)
        pad.position.y = 0.2
        this.group.add(pad)

        // Raised center ring
        const ringGeo = new THREE.CylinderGeometry(2.5, 2.5, 0.3, 16)
        const ringMat = new THREE.MeshStandardMaterial({ color: '#888899' })
        const ring = new THREE.Mesh(ringGeo, ringMat)
        ring.position.y = 0.55
        this.group.add(ring)

        // Four support legs
        const legGeo = new THREE.BoxGeometry(0.4, 1.5, 0.4)
        const legMat = new THREE.MeshStandardMaterial({ color: '#444450' })
        const legOffsets = [
            [ 5,  5], [-5,  5],
            [ 5, -5], [-5, -5]
        ]
        for (const [x, z] of legOffsets)
        {
            const leg = new THREE.Mesh(legGeo, legMat)
            leg.position.set(x, -0.55, z)
            this.group.add(leg)
        }
    }

    buildRocket()
    {
        const rocketGroup = new THREE.Group()
        rocketGroup.position.y = 0.7  // sit on pad

        // Body
        const bodyGeo = new THREE.CylinderGeometry(1, 1.4, 9, 12)
        const bodyMat = new THREE.MeshStandardMaterial({ color: '#e8e8f0' })
        const body = new THREE.Mesh(bodyGeo, bodyMat)
        body.position.y = 4.5
        rocketGroup.add(body)

        // Nose cone
        const noseGeo = new THREE.ConeGeometry(1, 3.5, 12)
        const noseMat = new THREE.MeshStandardMaterial({ color: '#cc3300' })
        const nose = new THREE.Mesh(noseGeo, noseMat)
        nose.position.y = 10.75
        rocketGroup.add(nose)

        // Engine nozzle
        const nozzleGeo = new THREE.CylinderGeometry(1.4, 1.8, 1, 12)
        const nozzleMat = new THREE.MeshStandardMaterial({ color: '#777788' })
        const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat)
        nozzle.position.y = -0.5
        rocketGroup.add(nozzle)

        // Fins (4x)
        const finGeo = new THREE.BoxGeometry(0.15, 3, 2)
        const finMat = new THREE.MeshStandardMaterial({ color: '#cc3300' })
        const finAngles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5]
        for (const angle of finAngles)
        {
            const fin = new THREE.Mesh(finGeo, finMat)
            fin.position.set(Math.sin(angle) * 2, 1, Math.cos(angle) * 2)
            fin.rotation.y = angle
            rocketGroup.add(fin)
        }

        this.group.add(rocketGroup)
    }

    update()
    {
        const terrain = this.experience.world.terrain
        const car = this.experience.world.car

        const activationDistance = terrain.finishDistance * 0.6
        const targetZ = car.model.position.z - 15

        // Visibility driven purely by terrain distance
        const isActive = terrain.distance >= activationDistance
        this.group.visible = isActive

        if (isActive)
        {
            // Z advances 1:1 with terrain distance past activation, clamped at target
            const traveled = terrain.distance - activationDistance
            this.group.position.z = Math.min(targetZ, this.startZ + traveled)
        }

        // Follow horizon curve — unclamped quadratic extends beyond terrain bounds
        const z = this.group.position.z
        const H = terrain.uniforms.uHorizonLineIntensity.value
        if (z < 0)
        {
            const diff = -z / 32
            this.group.position.y = -(diff * diff * H)
            const slope = -H * z / 512  // dy/dz at this z
            this.group.rotation.x = Math.atan2(-slope, 1)
        }
        else
        {
            this.group.position.y = 0
            this.group.rotation.x = 0
        }
    }
}

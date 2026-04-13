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
        this.rocketGroup = new THREE.Group()
        const rocketGroup = this.rocketGroup
        rocketGroup.position.y = 0.7  // sit on pad

        this.engineLight = new THREE.PointLight(0xff6600, 0, 12)
        this.engineLight.position.y = -1
        rocketGroup.add(this.engineLight)

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

        const activationDistance = terrain.finishDistance * 0.43
        const arrivalDistance = terrain.finishDistance * 0.47
        const targetZ = car.model.position.z - 15

        const isActive = terrain.distance >= activationDistance
        if (!isActive)
        {
            this.group.visible = false
            this.experience.camera.cameraExtraY = 0
            return
        }

        // Normalized t from activation to arrival, then clamp at targetZ
        const t = Math.max(0, Math.min(1, (terrain.distance - activationDistance) / (arrivalDistance - activationDistance)))
        const baseZ = this.startZ + t * (targetZ - this.startZ)

        const fd = terrain.finishDistance
        const dist = terrain.distance

        // Pre-launch (0.47–0.50): engine glow + vibration
        const prelaunchT = Math.max(0, Math.min(1, (dist - fd * 0.47) / (fd * 0.03)))
        this.engineLight.intensity = prelaunchT * 8
        if (prelaunchT > 0 && prelaunchT < 1)
        {
            this.rocketGroup.position.x = (Math.random() - 0.5) * 0.3 * prelaunchT
        }
        else
        {
            this.rocketGroup.position.x = 0
        }

        // Phase 1 (0.50–0.53): ease-in to 60 units over fd*0.03
        const phase1T = Math.max(0, Math.min(1, (dist - fd * 0.50) / (fd * 0.03)))
        const rocketPhase1Y = phase1T * phase1T * 60
        // Phase 2 (0.53+): constant speed matching derivative at end of phase 1
        // d(t²*60)/d(dist) at t=1 = 2*60/(fd*0.03) = 40 units per fd-unit
        const phase2Speed = 40
        const rocketPhase2Y = dist > fd * 0.53 ? (dist - fd * 0.53) * phase2Speed : 0
        this.rocketGroup.position.y = 0.7 + rocketPhase1Y + rocketPhase2Y

        // easedLaunch for group tilt: based on phase1T only (fully straight by 0.63)
        const easedLaunch = phase1T * phase1T

        // Camera: tracks rocket Y during 0.50-0.53, then gentle independent scroll
        const cameraScrollSpeed = 3
        const cameraPhase2 = Math.min(Math.max(0, dist - fd * 0.53), fd * 0.02)
        const cameraExtraY = phase1T < 1
            ? rocketPhase1Y
            : 60 + cameraPhase2 * cameraScrollSpeed
        this.experience.camera.cameraExtraY = dist >= fd * 0.50 ? cameraExtraY : 0

        // Follow horizon curve — unclamped quadratic extends beyond terrain bounds
        const H = terrain.uniforms.uHorizonLineIntensity.value
        let rx = 0
        if (baseZ < 0)
        {
            const diff = -baseZ / 32
            this.group.position.y = -(diff * diff * H)
            const slope = -H * baseZ / 512  // dy/dz at this z
            rx = Math.atan2(-slope, 1)
        }
        else
        {
            this.group.position.y = 0
        }

        // Straighten group tilt as rocket launches
        this.group.rotation.x = rx * (1 - easedLaunch)

        // Sink 0.39 units along local -Y (surface normal) to hide base underside
        this.group.position.y -= Math.cos(rx) * 0.39
        this.group.position.z = baseZ - Math.sin(rx) * 0.39

        // Only show once past the sun
        this.group.visible = this.group.position.z > -65
    }
}

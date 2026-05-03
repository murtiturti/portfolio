import * as THREE from 'three'
import Experience from "./Experience";
import { OrbitControls } from 'three/examples/jsm/Addons.js';

export default class Camera
{
    constructor()
    {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas

        // Reusable vectors to avoid per-frame allocation
        this._targetPos      = new THREE.Vector3()
        this._lookAt         = new THREE.Vector3()
        this._rocketWorldPos = new THREE.Vector3()

        this.rocketTarget   = null
        this.rocketSettings = { distance: 12, height: -4, lookAheadY: 8, lerp: 0.05 }
        this.cameraExtraY   = 0

        // Follow camera settings
        this.followSettings = {
            distanceMin:  20,
            distanceMax:  28,
            height:       6.9,
            lookAhead:    5,
            lookAheadY:   2.9,
            lerp:         0.03,
            useOrbit:     false,
        }

        this.setInstance()
        this.setOrbitControls()
        this.setDebug()
    }

    setInstance()
    {
        this.instance = new THREE.PerspectiveCamera(
            35,
            this.sizes.width / this.sizes.height,
            0.1,
            500
        )
        this.instance.position.set(6, 4, 8)
        this.scene.add(this.instance)
    }

    setOrbitControls()
    {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping = true
        this.controls.enabled = this.experience.debug.active
    }

    setDebug()
    {
        if (!this.experience.debug.active) return

        const f = this.experience.debug.ui.addFolder('Camera')
        const s = this.followSettings
        f.add(s, 'useOrbit').name('Orbit Controls').onChange((value) => {
            this.controls.enabled = value
        })
        f.add(s, 'distanceMin').min(1).max(50).step(0.1).name('Distance Min')
        f.add(s, 'distanceMax').min(1).max(80).step(0.1).name('Distance Max')
        f.add(s, 'height').min(-5).max(20).step(0.1).name('Height')
        f.add(s, 'lookAhead').min(-10).max(20).step(0.1).name('Look Ahead')
        f.add(s, 'lookAheadY').min(-5).max(10).step(0.1).name('Look Ahead Y')
        f.add(s, 'lerp').min(0.01).max(1).step(0.01).name('Lerp')
    }

    resize()
    {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update()
    {
        if (this.followSettings.useOrbit)
        {
            this.controls.update()
            return
        }

        const world = this.experience.world
        if (!world?.car?.model) return

        const car  = world.car.model
        const s    = this.followSettings
        const { speedT } = this.experience.state
        const distance = s.distanceMin + speedT * (s.distanceMax - s.distanceMin)

        const angle = car.rotation.y
        this._targetPos.set(
            car.position.x + Math.sin(angle) * distance,
            car.position.y + s.height,
            car.position.z + Math.cos(angle) * distance
        )

        this._targetPos.y = car.position.y + s.height + this.cameraExtraY

        this.instance.position.lerp(this._targetPos, s.lerp)

        if (this.cameraExtraY === 0)
        {
            this._lookAt.set(
                car.position.x - Math.sin(angle) * s.lookAhead,
                car.position.y + s.lookAheadY,
                car.position.z - Math.cos(angle) * s.lookAhead
            )
            this.instance.lookAt(this._lookAt)
        }
    }
}
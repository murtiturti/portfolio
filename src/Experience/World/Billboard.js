import * as THREE from 'three'
import Experience from '../Experience'

const INITIAL_Z        = -60
const Z_SCROLL_RATE    = 8
const Z_FADE_IN_END    = -30  // opacity reaches 1 here
const Z_FADE_OUT_START = 4    // opacity starts dropping from 1 here
const Z_KILL           = 24   // mesh hidden, video paused beyond this
const WORLD_W          = 8
const WORLD_H          = 4.5  // 16:9
const MOUNT_Y          = 6    // billboard floats above car height

export default class Billboard
{
    constructor(src, spawnDistance)
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.spawnDistance = spawnDistance

        // Detached <video> element — never added to DOM. VideoTexture polls
        // its frames directly; preload=metadata keeps initial page load cheap.
        const video = document.createElement('video')
        video.src         = src
        video.muted       = true
        video.loop        = true
        video.playsInline = true
        video.preload     = 'metadata'
        video.crossOrigin = 'anonymous'
        this.video = video

        const texture = new THREE.VideoTexture(video)
        texture.colorSpace = THREE.SRGBColorSpace
        this.texture = texture

        this.material = new THREE.MeshBasicMaterial({
            map:         texture,
            transparent: true,
            side:        THREE.DoubleSide,
            depthWrite:  false,
        })

        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(WORLD_W, WORLD_H),
            this.material,
        )
        this.mesh.position.set(0, MOUNT_Y, INITIAL_Z)
        this.mesh.visible = false
        this.scene.add(this.mesh)
    }

    update()
    {
        const { distance } = this.experience.state
        const z = INITIAL_Z + (distance - this.spawnDistance) * Z_SCROLL_RATE

        if (distance < this.spawnDistance || z >= Z_KILL)
        {
            this.mesh.visible = false
            this._pause()
            return
        }

        let opacity
        if (z < Z_FADE_IN_END)
        {
            opacity = (z - INITIAL_Z) / (Z_FADE_IN_END - INITIAL_Z)
        }
        else if (z < Z_FADE_OUT_START)
        {
            opacity = 1
        }
        else
        {
            opacity = 1 - (z - Z_FADE_OUT_START) / (Z_KILL - Z_FADE_OUT_START)
        }

        this.mesh.position.z = z
        this.material.opacity = opacity
        this.mesh.visible = true

        // Y-axis billboard — same trick HintText uses to stay readable on curves
        const cam = this.experience.camera.instance
        this.mesh.rotation.y = Math.atan2(
            cam.position.x - this.mesh.position.x,
            cam.position.z - this.mesh.position.z,
        )

        // Gate playback: only the billboards currently fading/visible upload to GPU.
        if (opacity > 0) this._play()
        else this._pause()
    }

    _play()
    {
        if (!this.video.paused) return
        // play() returns a Promise that can reject on autoplay block — swallow it.
        this.video.play().catch(() => {})
    }

    _pause()
    {
        if (this.video.paused) return
        this.video.pause()
    }
}

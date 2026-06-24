import * as THREE from 'three'
import Experience from '../Experience'

const CANVAS_W = 1800
const CANVAS_H = 200
const FONT_SIZE_MAX = 82
const FONT_SIZE_MIN = 20
const WORLD_WIDTH = 18
const INITIAL_Z = -15
const Z_SCROLL_RATE = 8
const Z_FADE_START = 8
const Z_KILL = 24
const Z_FADE_RANGE = 14
const GLOW_BLUR_OUTER = 48
const GLOW_BLUR_MID = 20
const GLOW_BLUR_CORE = 4
const FLICKER_FREQ_A = 9.1
const FLICKER_FREQ_B = 19.7
const FLICKER_AMP_A = 0.09
const FLICKER_AMP_B = 0.06
const FLICKER_BASE = 0.82

export default class HintText
{
    constructor(text, spawnDistance = 0)
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.spawnDistance = spawnDistance

        const canvas = document.createElement('canvas')
        canvas.width  = CANVAS_W
        canvas.height = CANVAS_H
        const ctx = canvas.getContext('2d')

        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

        // Auto-fit font: start at max size, shrink until text fits within 90% of canvas width
        const maxWidth = CANVAS_W * 0.90
        let fontSize = FONT_SIZE_MAX
        ctx.font = `bold ${fontSize}px monospace`
        while (ctx.measureText(text).width > maxWidth && fontSize > FONT_SIZE_MIN)
        {
            fontSize -= 2
            ctx.font = `bold ${fontSize}px monospace`
        }

        // Scanlines
        ctx.fillStyle = 'rgba(0, 255, 255, 0.04)'
        for (let y = 0; y < CANVAS_H; y += 5)
            ctx.fillRect(0, y, CANVAS_W, 2)

        ctx.textAlign    = 'center'
        ctx.textBaseline = 'middle'

        // Outer glow pass
        ctx.shadowColor = '#00ffff'
        ctx.shadowBlur  = GLOW_BLUR_OUTER
        ctx.fillStyle   = 'rgba(0, 255, 255, 0.2)'
        ctx.fillText(text, CANVAS_W / 2, CANVAS_H / 2)

        // Mid glow pass
        ctx.shadowBlur = GLOW_BLUR_MID
        ctx.fillStyle  = 'rgba(0, 255, 255, 0.65)'
        ctx.fillText(text, CANVAS_W / 2, CANVAS_H / 2)

        // Core — bright white with thin cyan tint
        ctx.shadowBlur = GLOW_BLUR_CORE
        ctx.fillStyle  = '#dfffff'
        ctx.fillText(text, CANVAS_W / 2, CANVAS_H / 2)

        const tex = new THREE.CanvasTexture(canvas)
        tex.colorSpace = THREE.SRGBColorSpace

        const worldW = WORLD_WIDTH
        const worldH = worldW * (CANVAS_H / CANVAS_W)

        this.material = new THREE.MeshBasicMaterial({
            map:         tex,
            transparent: true,
            side:        THREE.DoubleSide,
            depthWrite:  false,
        })

        this.mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(worldW, worldH),
            this.material
        )
        this.mesh.position.set(0, 3, INITIAL_Z)
        this.scene.add(this.mesh)
    }

    update()
    {
        const { distance } = this.experience.state
        const elapsed = this.experience.time.elapsed * 0.001   // seconds

        const z = INITIAL_Z + (distance - this.spawnDistance) * Z_SCROLL_RATE

        if (distance < this.spawnDistance || z >= Z_KILL)
        {
            this.mesh.visible = false
            return
        }

        this.mesh.position.z = z

        // Fade out as it passes the camera
        let opacity = 1
        if (z > Z_FADE_START) opacity = Math.max(0, 1 - (z - Z_FADE_START) / Z_FADE_RANGE)

        // Subtle hologram flicker
        const flicker = FLICKER_BASE + Math.sin(elapsed * FLICKER_FREQ_A) * FLICKER_AMP_A + Math.sin(elapsed * FLICKER_FREQ_B) * FLICKER_AMP_B

        this.material.opacity = opacity * flicker
        this.mesh.visible     = true

        // Y-axis billboard — always face camera
        const cam = this.experience.camera.instance
        this.mesh.rotation.y = Math.atan2(
            cam.position.x - this.mesh.position.x,
            cam.position.z - this.mesh.position.z
        )
    }
}

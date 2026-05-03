import * as THREE from 'three'
import Experience from '../Experience'

const CANVAS_W = 1800
const CANVAS_H = 200

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
        let fontSize = 82
        ctx.font = `bold ${fontSize}px monospace`
        while (ctx.measureText(text).width > maxWidth && fontSize > 20)
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
        ctx.shadowBlur  = 48
        ctx.fillStyle   = 'rgba(0, 255, 255, 0.2)'
        ctx.fillText(text, CANVAS_W / 2, CANVAS_H / 2)

        // Mid glow pass
        ctx.shadowBlur = 20
        ctx.fillStyle  = 'rgba(0, 255, 255, 0.65)'
        ctx.fillText(text, CANVAS_W / 2, CANVAS_H / 2)

        // Core — bright white with thin cyan tint
        ctx.shadowBlur = 4
        ctx.fillStyle  = '#dfffff'
        ctx.fillText(text, CANVAS_W / 2, CANVAS_H / 2)

        const tex = new THREE.CanvasTexture(canvas)
        tex.colorSpace = THREE.SRGBColorSpace

        const worldW = 18
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
        this.mesh.position.set(0, 3, -15)
        this.scene.add(this.mesh)
    }

    update()
    {
        const { distance } = this.experience.state
        const elapsed = this.experience.time.elapsed * 0.001   // seconds

        const z = -15 + (distance - this.spawnDistance) * 8

        if (distance < this.spawnDistance || z >= 24)
        {
            this.mesh.visible = false
            return
        }

        this.mesh.position.z = z

        // Fade out as it passes the camera (z: 8 → 22)
        let opacity = 1
        if (z > 8) opacity = Math.max(0, 1 - (z - 8) / 14)

        // Subtle hologram flicker
        const flicker = 0.82 + Math.sin(elapsed * 9.1) * 0.09 + Math.sin(elapsed * 19.7) * 0.06

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

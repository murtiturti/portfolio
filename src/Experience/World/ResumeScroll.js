import * as THREE from 'three'
import Experience from '../Experience'
import resumeData from '../../data/resume.json'

const CANVAS_W     = 1400   // fixed canvas px width (text resolution)
const GAP          = 0.8    // world-unit gap between cards
const CARD_Z       = 0
const GROUP_START_Y = 100
const SCROLL_SPEED  = 1.5

export default class ResumeScroll
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene

        // Card width derived from what's actually visible at the camera's minimum
        // follow distance (worst case — slow speed) with a safe margin.
        const { width, height } = this.experience.sizes
        const d = this.experience.camera.followSettings.distanceMin  // 20 wu
        const visH = 2 * Math.tan((35 * Math.PI / 180) / 2) * d     // visible height at d
        const visW = visH * (width / height)
        this._cardW = Math.min(14, visW * 0.82)

        this.group = new THREE.Group()
        this.group.position.set(0, GROUP_START_Y, CARD_Z)
        this.group.visible = false
        this.scene.add(this.group)

        this._linkCards = []
        this._raycaster = new THREE.Raycaster()
        this._mouse = new THREE.Vector2()

        this._buildCards()
        this._initClickHandler()
    }

    // ── layout helpers ────────────────────────────────────────────────────────

    // Convert canvas pixel height → world units (preserves aspect with cardW)
    _wu(canvasH) { return (canvasH / CANVAS_W) * this._cardW }

    // Place mesh centered at (yBottom - h/2), return new yBottom
    _place(mesh, h, yBottom)
    {
        mesh.position.y = yBottom - h / 2
        this.group.add(mesh)
        return yBottom - h - GAP
    }

    // ── card builders ─────────────────────────────────────────────────────────

    _buildCards()
    {
        let yBottom = 0

        // Projects cards first (seen last), then label (seen before its cards)
        for (const proj of resumeData.projects)
        {
            const canvasH = proj.url ? 420 : 320
            const h = this._wu(canvasH)
            const card = this._mesh(this._canvasProject(proj, canvasH), h)
            yBottom = this._place(card, h, yBottom)
            if (proj.url) this._linkCards.push({ mesh: card, url: proj.url })
        }
        yBottom = this._sectionLabel('PROJECTS', '#ffaa00', yBottom)
        yBottom -= GAP

        // Experience cards, then label
        for (const exp of resumeData.experiences)
        {
            const canvasH = 200 + exp.bullets.length * 90
            const h = this._wu(canvasH)
            yBottom = this._place(this._mesh(this._canvasExperience(exp, canvasH), h), h, yBottom)
        }
        yBottom = this._sectionLabel('EXPERIENCE', '#00ffff', yBottom)
        yBottom -= GAP * 0.5

        // Header spawned last = seen first
        const headerH = this._wu(350)
        this._place(this._mesh(this._canvasHeader(), headerH), headerH, yBottom)
    }

    _sectionLabel(text, color, yBottom)
    {
        const canvasH = 110
        const h = this._wu(canvasH)
        const canvas = document.createElement('canvas')
        canvas.width = CANVAS_W; canvas.height = canvasH
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = color
        ctx.font = 'bold 68px monospace'
        ctx.textBaseline = 'middle'
        ctx.fillText('── ' + text + ' ──────────────────────', 20, canvasH / 2)
        return this._place(this._mesh(canvas, h), h, yBottom) - GAP * 0.3
    }

    // ── canvas renderers ──────────────────────────────────────────────────────

    _canvasHeader()
    {
        const H = 350
        const canvas = document.createElement('canvas')
        canvas.width = CANVAS_W; canvas.height = H
        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#050514'
        ctx.fillRect(0, 0, CANVAS_W, H)
        ctx.strokeStyle = '#00ffff'
        ctx.lineWidth = 4
        ctx.strokeRect(3, 3, CANVAS_W - 6, H - 6)

        ctx.textAlign = 'center'
        ctx.fillStyle = '#00ffff'
        ctx.font = 'bold 110px monospace'
        ctx.fillText(resumeData.name, CANVAS_W / 2, 160)

        ctx.fillStyle = '#ff00ff'
        ctx.font = '62px monospace'
        ctx.fillText(resumeData.title, CANVAS_W / 2, 280)

        return canvas
    }

    _canvasExperience(exp, H)
    {
        const canvas = document.createElement('canvas')
        canvas.width = CANVAS_W; canvas.height = H
        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#050514'
        ctx.fillRect(0, 0, CANVAS_W, H)
        ctx.strokeStyle = '#ff00ff'
        ctx.lineWidth = 2
        ctx.strokeRect(3, 3, CANVAS_W - 6, H - 6)

        ctx.textAlign = 'left'
        ctx.fillStyle = '#ff00ff'
        ctx.font = 'bold 58px monospace'
        ctx.fillText(exp.role, 40, 72)

        ctx.fillStyle = '#00ffff'
        ctx.font = '42px monospace'
        ctx.fillText(exp.company + '  ·  ' + exp.period, 40, 138)

        ctx.strokeStyle = '#1a1a3a'
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(40, 158); ctx.lineTo(CANVAS_W - 40, 158); ctx.stroke()

        ctx.fillStyle = '#ccccee'
        ctx.font = '38px monospace'
        exp.bullets.forEach((b, i) => {
            ctx.fillText('▸ ' + b, 50, 210 + i * 90)
        })

        return canvas
    }

    _canvasProject(proj, H)
    {
        const canvas = document.createElement('canvas')
        canvas.width = CANVAS_W; canvas.height = H
        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#050514'
        ctx.fillRect(0, 0, CANVAS_W, H)
        ctx.strokeStyle = proj.url ? '#ffaa00' : '#664400'
        ctx.lineWidth = proj.url ? 3 : 2
        ctx.strokeRect(3, 3, CANVAS_W - 6, H - 6)

        ctx.textAlign = 'left'
        ctx.fillStyle = '#ffaa00'
        ctx.font = 'bold 58px monospace'
        ctx.fillText(proj.name, 40, 72)

        ctx.fillStyle = '#ccccee'
        ctx.font = '38px monospace'
        this._wrapText(ctx, proj.description, 40, 148, CANVAS_W - 80, 54)

        if (proj.url)
        {
            const display = proj.url.length > 58 ? proj.url.slice(0, 55) + '…' : proj.url
            ctx.fillStyle = '#00ffff'
            ctx.font = 'bold 36px monospace'
            ctx.fillText('→ ' + display, 40, H - 40)
        }

        return canvas
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    _mesh(canvas, worldH)
    {
        const tex = new THREE.CanvasTexture(canvas)
        tex.colorSpace = THREE.SRGBColorSpace
        return new THREE.Mesh(
            new THREE.PlaneGeometry(this._cardW, worldH),
            new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
        )
    }

    _wrapText(ctx, text, x, y, maxWidth, lineHeight)
    {
        const words = text.split(' ')
        let line = ''
        for (const word of words)
        {
            const test = line + word + ' '
            if (ctx.measureText(test).width > maxWidth && line)
            {
                ctx.fillText(line.trim(), x, y)
                line = word + ' '
                y += lineHeight
            }
            else { line = test }
        }
        if (line) ctx.fillText(line.trim(), x, y)
    }

    _initClickHandler()
    {
        this.experience.canvas.addEventListener('click', (e) =>
        {
            if (!this.group.visible || !this._linkCards.length) return
            const rect = this.experience.canvas.getBoundingClientRect()
            this._mouse.set(
                ((e.clientX - rect.left) / rect.width) * 2 - 1,
               -((e.clientY - rect.top) / rect.height) * 2 + 1
            )
            this._raycaster.setFromCamera(this._mouse, this.experience.camera.instance)
            for (const { mesh, url } of this._linkCards)
            {
                if (this._raycaster.intersectObject(mesh).length)
                {
                    window.open(url, '_blank')
                    return
                }
            }
        })
    }

    // ── update ────────────────────────────────────────────────────────────────

    update()
    {
        const { distance: dist, finishDistance: fd } = this.experience.state

        this.group.visible = dist >= fd * 0.55

        if (this.group.visible)
        {
            const car = this.experience.world.car.model
            const cam = this.experience.camera.instance

            // Center on car X
            this.group.position.x = car.position.x
            this.group.position.y = GROUP_START_Y - (dist - fd * 0.55) * SCROLL_SPEED

            // Rotate group to face camera (Y axis only, no tilt)
            this.group.rotation.y = Math.atan2(
                cam.position.x - this.group.position.x,
                cam.position.z - this.group.position.z
            )
        }
    }
}

import * as THREE from 'three'
import Experience from '../Experience'
import timeline from '../timeline.js'
import resumeData from '../../data/resume.json'

const CANVAS_W      = 1400  // fixed canvas px width (text resolution)
const GAP           = 0.8   // world-unit gap between cards
const CARD_Z        = 0
const SCROLL_SPEED  = 1.5
const ENTRY_LEAD    = 12   // world units the first card starts above reading height

const VIDEO_ACTIVE_BAND = 22  // world-unit half-band around screen center where a clip plays

const CARD_W_MAX      = 14   // world-unit cap on card width
const CARD_W_VIS_FRAC = 0.82 // fraction of visible width to fill at min camera distance

const CARD_HEIGHT_PX = {
    projectLinked:  420, // project card with clickable URL
    project:        320, // project card without URL
    experienceBase: 200, // experience card baseline (per-bullet height added)
    bullet:          90, // height contribution per bullet line
    header:         350,
    sectionLabel:   110,
}

export default class ResumeScroll
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene

        // Card width derived from what's actually visible at the camera's minimum
        // follow distance (worst case — slow speed) with a safe margin.
        const { width, height } = this.experience.sizes
        const d = this.experience.camera.followSettings.distanceMin
        const fov = this.experience.camera.instance.fov
        const visH = 2 * Math.tan((fov * Math.PI / 180) / 2) * d
        const visW = visH * (width / height)
        this._cardW = Math.min(CARD_W_MAX, visW * CARD_W_VIS_FRAC)

        this.group = new THREE.Group()
        this.group.position.set(0, 0, CARD_Z)
        this.group.visible = false
        this.scene.add(this.group)

        this._startY = null  // scroll anchor, computed on the first visible frame
        this._linkCards = []
        this._videos = []
        this._raycaster = new THREE.Raycaster()
        this._mouse = new THREE.Vector2()
        this._tmp = new THREE.Vector3()

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
            const { mesh, h, videoEntry } = this._buildProjectCard(proj)
            yBottom = this._place(mesh, h, yBottom)
            if (proj.url) this._linkCards.push({ mesh, url: proj.url })
            if (videoEntry) this._videos.push(videoEntry)
        }
        yBottom = this._sectionLabel('PROJECTS', '#ffaa00', yBottom)
        yBottom -= GAP

        // Experience cards, then label
        for (const exp of resumeData.experiences)
        {
            const canvasH = CARD_HEIGHT_PX.experienceBase + exp.bullets.length * CARD_HEIGHT_PX.bullet
            const h = this._wu(canvasH)
            yBottom = this._place(this._mesh(this._canvasExperience(exp, canvasH), h), h, yBottom)
        }
        yBottom = this._sectionLabel('EXPERIENCE', '#00ffff', yBottom)
        yBottom -= GAP * 0.5

        // Header spawned last = seen first
        const headerH = this._wu(CARD_HEIGHT_PX.header)
        this._firstCardY = yBottom - headerH / 2  // most-negative card center; first seen
        this._place(this._mesh(this._canvasHeader(), headerH), headerH, yBottom)
    }

    _sectionLabel(text, color, yBottom)
    {
        const canvasH = CARD_HEIGHT_PX.sectionLabel
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
        const H = CARD_HEIGHT_PX.header
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
            ctx.fillText('▸ ' + b, 50, 210 + i * CARD_HEIGHT_PX.bullet)
        })

        return canvas
    }

    // Build a project card mesh. Plain projects use the static text canvas; a
    // project with `media` reserves a 16:9 region inside the card and overlays a
    // video mesh exactly on it (added as a child so it scrolls with the card).
    _buildProjectCard(proj)
    {
        if (!proj.media)
        {
            const canvasH = proj.url ? CARD_HEIGHT_PX.projectLinked : CARD_HEIGHT_PX.project
            const h = this._wu(canvasH)
            return { mesh: this._mesh(this._canvasProject(proj, canvasH), h), h }
        }

        const PAD       = 40
        const NAME_H    = 80
        const DESC_LINE = 54
        const DESC_ROWS = 3
        const VID_MARGIN= 40
        const URL_H     = proj.url ? 70 : 0

        const descTop = PAD + NAME_H
        const vidTop  = descTop + DESC_ROWS * DESC_LINE + 20
        const vidW    = CANVAS_W - VID_MARGIN * 2
        const vidH    = Math.round(vidW * 9 / 16)
        const canvasH = vidTop + vidH + URL_H + PAD

        const canvas = document.createElement('canvas')
        canvas.width = CANVAS_W; canvas.height = canvasH
        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#050514'
        ctx.fillRect(0, 0, CANVAS_W, canvasH)
        ctx.strokeStyle = proj.url ? '#ffaa00' : '#664400'
        ctx.lineWidth = proj.url ? 3 : 2
        ctx.strokeRect(3, 3, CANVAS_W - 6, canvasH - 6)

        ctx.textAlign = 'left'
        ctx.fillStyle = '#ffaa00'
        ctx.font = 'bold 58px monospace'
        ctx.fillText(proj.name, PAD, PAD + 52)

        ctx.fillStyle = '#ccccee'
        ctx.font = '38px monospace'
        this._wrapText(ctx, proj.description, PAD, descTop + 36, CANVAS_W - PAD * 2, DESC_LINE)

        // Dark box where the video mesh sits — also the placeholder before load.
        ctx.fillStyle = '#000000'
        ctx.fillRect(VID_MARGIN, vidTop, vidW, vidH)

        if (proj.url)
        {
            const display = proj.url.length > 58 ? proj.url.slice(0, 55) + '…' : proj.url
            ctx.fillStyle = '#00ffff'
            ctx.font = 'bold 36px monospace'
            ctx.fillText('→ ' + display, PAD, vidTop + vidH + 48)
        }

        const h = this._wu(canvasH)
        const mesh = this._mesh(canvas, h)

        // Overlay the video plane on the reserved box. Canvas px → card-local world
        // (origin at card center, +y up), nudged forward in z to sit on the face.
        const ppw = this._cardW / CANVAS_W
        const clip = new THREE.Mesh(
            new THREE.PlaneGeometry(vidW * ppw, vidH * ppw),
            new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide })
        )
        clip.position.set(
            (VID_MARGIN + vidW / 2 - CANVAS_W / 2) * ppw,
            (canvasH / 2 - (vidTop + vidH / 2)) * ppw,
            0.02,
        )
        mesh.add(clip)

        return { mesh, h, videoEntry: { mesh: clip, src: proj.media, video: null } }
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

    // ── video clips ─────────────────────────────────────────────────────────

    // Lazily build the <video> + VideoTexture the first time a clip nears the
    // screen. Nothing video-related is fetched at startup — the resume section
    // only appears past timeline.resume.start (~55% in), so clips load on demand.
    _ensureVideo(entry)
    {
        if (entry.video) return

        const video = document.createElement('video')
        video.src         = entry.src
        video.muted       = true
        video.loop        = true
        video.playsInline = true
        video.preload     = 'auto'
        video.crossOrigin = 'anonymous'
        entry.video = video

        const tex = new THREE.VideoTexture(video)
        tex.colorSpace = THREE.SRGBColorSpace
        entry.mesh.material.map = tex
        entry.mesh.material.color.set(0xffffff)  // reveal texture; placeholder was black
        entry.mesh.material.needsUpdate = true
    }

    _updateVideos(cam)
    {
        // A card centered on screen sits near the camera's look-at height.
        const eyeY = cam.position.y - 4

        for (const v of this._videos)
        {
            const worldY = v.mesh.getWorldPosition(this._tmp).y
            if (Math.abs(worldY - eyeY) < VIDEO_ACTIVE_BAND)
            {
                this._ensureVideo(v)
                if (v.video.paused) v.video.play().catch(() => {})
            }
            else if (v.video && !v.video.paused)
            {
                v.video.pause()
            }
        }
    }

    _pauseVideos()
    {
        for (const v of this._videos)
            if (v.video && !v.video.paused) v.video.pause()
    }

    // ── update ────────────────────────────────────────────────────────────────

    update()
    {
        const { distance: dist, finishDistance: fd } = this.experience.state
        const startDist = fd * timeline.resume.start

        this.group.visible = dist >= startDist

        if (!this.group.visible)
        {
            this._pauseVideos()
            return
        }

        const car = this.experience.world.car.model
        const cam = this.experience.camera.instance

        // First visible frame: anchor the scroll so the first card (the header, at
        // the most-negative local Y) starts just above reading height — regardless
        // of how tall the stack is. Reading height matches _updateVideos' eye height.
        if (this._startY === null)
        {
            const eyeY = cam.position.y - 4
            this._startY = eyeY + ENTRY_LEAD - this._firstCardY + (dist - startDist) * SCROLL_SPEED
        }

        // Center on car X
        this.group.position.x = car.position.x
        this.group.position.y = this._startY - (dist - startDist) * SCROLL_SPEED

        // Rotate group to face camera (Y axis only, no tilt)
        this.group.rotation.y = Math.atan2(
            cam.position.x - this.group.position.x,
            cam.position.z - this.group.position.z
        )

        this._updateVideos(cam)
    }
}

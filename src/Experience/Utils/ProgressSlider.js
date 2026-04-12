import Experience from '../Experience'

export default class ProgressSlider {
    constructor() {
        this.experience = new Experience()
        this.isDragging = false
        this.lastMouseY = 0

        this.buildDOM()
        this.bindEvents()
    }

    get terrain() {
        return this.experience.world?.terrain
    }

    buildDOM() {
        this.container = document.createElement('div')
        this.container.id = 'progress-slider'

        this.finishLabel = document.createElement('div')
        this.finishLabel.className = 'slider-label'
        this.finishLabel.textContent = 'FINISH'

        this.track = document.createElement('div')
        this.track.className = 'slider-track'

        this.fill = document.createElement('div')
        this.fill.className = 'slider-fill'

        this.thumb = document.createElement('div')
        this.thumb.className = 'slider-thumb'

        this.track.appendChild(this.fill)
        this.track.appendChild(this.thumb)

        this.startLabel = document.createElement('div')
        this.startLabel.className = 'slider-label'
        this.startLabel.textContent = 'START'

        this.container.appendChild(this.finishLabel)
        this.container.appendChild(this.track)
        this.container.appendChild(this.startLabel)

        document.body.appendChild(this.container)
    }

    bindEvents() {
        const onMouseDown = (e) => {
            this.isDragging = true
            this.lastMouseY = e.clientY
            document.body.style.cursor = 'grabbing'
            e.preventDefault()
        }

        const onMouseMove = (e) => {
            if (!this.isDragging) return
            const terrain = this.terrain
            if (!terrain) return

            const deltaY = e.clientY - this.lastMouseY
            this.lastMouseY = e.clientY

            const trackHeight = this.track.getBoundingClientRect().height
            const distancePerPixel = terrain.finishDistance / trackHeight

            // Dragging up (negative deltaY) advances distance
            terrain.distance = Math.max(
                0,
                Math.min(terrain.finishDistance, terrain.distance - deltaY * distancePerPixel)
            )
        }

        const onMouseUp = () => {
            if (!this.isDragging) return
            this.isDragging = false
            document.body.style.cursor = ''
        }

        this.track.addEventListener('mousedown', onMouseDown)
        this.thumb.addEventListener('mousedown', onMouseDown)
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
    }

    update() {
        const terrain = this.terrain
        if (!terrain) return

        const progress = Math.min(terrain.distance / terrain.finishDistance, 1)
        const percent = (progress * 100).toFixed(2) + '%'

        this.fill.style.height = percent
        this.thumb.style.bottom = percent
    }

    destroy() {
        document.body.removeChild(this.container)
    }
}

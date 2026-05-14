import * as THREE from 'three'

const TEXTURE_WIDTH = 2
const TEXTURE_HEIGHT = 512

export default class GradientTexture
{
    // stops: array of [position (0–1), color string] pairs
    constructor(stops)
    {
        this.canvas = document.createElement('canvas')
        this.canvas.width = TEXTURE_WIDTH
        this.canvas.height = TEXTURE_HEIGHT
        this.context = this.canvas.getContext('2d')

        this.gradient = this.context.createLinearGradient(0, 0, 0, TEXTURE_HEIGHT)
        for (const [pos, color] of stops)
        {
            this.gradient.addColorStop(pos, color)
        }

        this.context.fillStyle = this.gradient
        this.context.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT)

        this.gradientTexture = new THREE.CanvasTexture(this.canvas)
        this.gradientTexture.colorSpace = THREE.SRGBColorSpace
    }

    update(stops)
    {
        const grad = this.context.createLinearGradient(0, 0, 0, TEXTURE_HEIGHT)
        for (const [pos, color] of stops) grad.addColorStop(pos, color)
        this.context.fillStyle = grad
        this.context.fillRect(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT)
        this.gradientTexture.needsUpdate = true
    }
}

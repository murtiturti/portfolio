import * as THREE from 'three'

export default class GradientTexture
{
    // stops: array of [position (0–1), color string] pairs
    constructor(stops)
    {
        this.canvas = document.createElement('canvas')
        this.canvas.width = 2
        this.canvas.height = 512
        this.context = this.canvas.getContext('2d')

        this.gradient = this.context.createLinearGradient(0, 0, 0, 512)
        for (const [pos, color] of stops)
        {
            this.gradient.addColorStop(pos, color)
        }

        this.context.fillStyle = this.gradient
        this.context.fillRect(0, 0, 2, 512)

        this.gradientTexture = new THREE.CanvasTexture(this.canvas)
        this.gradientTexture.colorSpace = THREE.SRGBColorSpace
    }
}

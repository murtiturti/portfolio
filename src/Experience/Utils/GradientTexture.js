import * as THREE from 'three'

export default class GradientTexture
{
    constructor(color0, color1)
    {
        this.canvas = document.createElement('canvas')
        this.context = this.canvas.getContext('2d')

        this.gradient = this.context.createLinearGradient(0, 0, 0, window.innerHeight)
        this.gradient.addColorStop(0, color0)
        this.gradient.addColorStop(1, color1)

        this.context.fillStyle = this.gradient
        this.context.fillRect(0, 0, window.innerWidth, window.innerHeight)

        this.gradientTexture = new THREE.CanvasTexture(this.canvas)
    }
}

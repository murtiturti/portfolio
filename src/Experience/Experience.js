import * as THREE from 'three'
import Sizes from "./Utils/Sizes"
import Time from "./Utils/Time"
import Camera from './Camera'
import Renderer from './Renderer'
import World from './World/World'
import Resources from './Utils/Resources'
import sources from './sources.js'
import Debug from './Utils/Debug.js'
import GradientTexture from './Utils/GradientTexture.js'
import UserInput from './Utils/UserInput.js'
import Timer from './Utils/Timer.js'

let instance = null

export default class Experience 
{
    constructor(canvas) 
    {
        if (instance) 
        {
            return instance
        }

        instance = this

        // Global access
        window.experience = this

        // Options
        this.canvas = canvas

        // Setup
        this.debug = new Debug()
        this.sizes = new Sizes()
        this.time = new Time()
        this.userInput = new UserInput()
        this.scene = new THREE.Scene()
        this.backgroundTexture = new GradientTexture('#ff0000', '#0000ff')
        this.scene.background = this.backgroundTexture.gradientTexture
        this.resources = new Resources(sources)
        this.camera = new Camera()
        this.renderer = new Renderer()
        this.world = new World()

        // Time-based Animation
        this.totalHoldTime = 0
        this.currentHoldTime = 0

        this.accelerationTimer = new Timer(3)
        this.slowDownTimer = new Timer(2)

        // Sizes resize event
        this.sizes.on('resize', () =>
        {
            this.resize()
        })

        // Time tick event
        this.time.on('tick', () => {
            this.update()
        })

        this.userInput.on('mousedown', () => {
            this.moving = true
            this.accelerationTimer.start()
            this.slowDownTimer.reset()
        })

        this.userInput.on('mouseup', () => {
            // this.moving = false
            this.slowDownTimer.start()
        })

        this.userInput.on('mouseheld', () => {
            this.totalHoldTime += this.time.delta * this.accelerationTimer.progress
        })

        this.slowDownTimer.on('over', () =>
        {
            this.moving = false
        })

    }

    resize() 
    {
        this.camera.resize()
        this.renderer.resize()
    }

    update() 
    {
        this.camera.update()
        this.world.update()
        this.renderer.update()
        this.accelerationTimer.update()
        this.slowDownTimer.update()

        if (this.slowDownTimer.running)
        {
            this.totalHoldTime += this.time.delta * (1 - this.slowDownTimer.progress)
        }
    }

    destroy()
    {
        this.sizes.off('resize')
        this.time.off('tick')
        this.userInput.off('mousedown')
        this.userInput.off('mouseup')
        this.userInput.off('mouseheld')

        // Traverse the whole scene
        this.scene.traverse((child) => 
        {
            if (child instanceof THREE.Mesh)
            {
                child.geometry.dispose()
                
                for (const key in child.material)
                {
                    const value = child.material[key]

                    if (value && typeof value.dispose === 'function')
                    {
                        value.dispose()
                    }
                }
            }
        })

        this.camera.controls.dispose()
        this.renderer.instance.dispose()

        if (this.debug.active)
        {
            this.debug.ui.destroy()
        }
    }
}
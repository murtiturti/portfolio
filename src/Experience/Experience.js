import * as THREE from 'three'

const _c1 = new THREE.Color()
const _c2 = new THREE.Color()
function lerpHex(a, b, t) {
    return '#' + _c1.set(a).lerp(_c2.set(b), t).getHexString()
}

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
        this.backgroundTexture = new GradientTexture([
            [0.0,  '#0a0015'],  // near-black deep purple
            [0.25, '#2b0060'],  // dark violet
            [0.45, '#d4006e'],  // hot magenta
            [0.6,  '#ff4500'],  // neon orange-red
            [0.75, '#ff9900'],  // amber
            [1.0,  '#ff9900'],  // hold amber to bottom
        ])
        const skyGeo = new THREE.SphereGeometry(100, 32, 16)
        const skyMat = new THREE.MeshBasicMaterial({
            map: this.backgroundTexture.gradientTexture,
            side: THREE.BackSide,
            depthWrite: false,
            depthTest: false,
        })
        const skyMesh = new THREE.Mesh(skyGeo, skyMat)
        skyMesh.renderOrder = -1
        this.scene.add(skyMesh)
        this.resources = new Resources(sources)
        this.camera = new Camera()
        this.renderer = new Renderer()
        this.world = new World()

        // Time-based Animation
        this.totalHoldTime = 0
        this.currentHoldTime = 0

        // Sky transition state
        this._sunsetStops = [[0,'#0a0015'],[0.25,'#2b0060'],[0.45,'#d4006e'],[0.6,'#ff4500'],[0.75,'#ff9900'],[1.0,'#ff9900']]
        this._spaceStops  = [[0,'#000000'],[0.25,'#00001a'],[0.45,'#000033'],[0.6,'#000022'],[0.75,'#000010'],[1.0,'#000000']]
        this._lastSpaceT  = -1

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
        })

        this.userInput.on('mouseup', () => {
            this.moving = false
        })

        this.userInput.on('mouseheld', () => {
            this.totalHoldTime += this.time.delta
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
        this._updateSky()
    }

    _updateSky()
    {
        const fd   = this.world?.terrain?.finishDistance
        const dist = this.world?.terrain?.distance
        if (fd == null || dist == null) return

        const spaceT = Math.max(0, Math.min(1, (dist - fd * 0.60) / (fd * 0.015)))
        if (spaceT === this._lastSpaceT) return
        this._lastSpaceT = spaceT

        const lerped = this._sunsetStops.map(([pos, sc], i) =>
            [pos, lerpHex(sc, this._spaceStops[i][1], spaceT)]
        )
        this.backgroundTexture.update(lerped)
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
import Experience from "../Experience.js";
import Environment from './Environment';
import Terrain from "./Terrain";
import Car from './Car'
import Sun from "./Sun";
import SolidTerrain from "./SolidTerrain";
import SunOuter from "./SunOuter";
import TileParticles from "./TileParticles.js";
import ProgressSlider from "../Utils/ProgressSlider.js";
import SpaceStation from "./SpaceStation.js";
import ResumeScroll from "./ResumeScroll.js";
import HintText from "./HintText.js";
import timeline from "../timeline.js";
import * as THREE from 'three'

export default class World
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.resources.on('ready', ()=>
        {
            this.terrain        = new Terrain()
            this.solidTerrain   = new SolidTerrain()
            this.car            = new Car()
            this.sun            = new Sun()
            this.sunOuter       = new SunOuter()
            this.particlesRight = new TileParticles(80,  1)
            this.particlesLeft  = new TileParticles(80, -1)
            this.spaceStation   = new SpaceStation()
            this.resumeScroll   = new ResumeScroll()

            const fd = this.terrain.finishDistance
            const hintSpecs = [
                ['press and hold anywhere to move',          timeline.hints.move],
                ['use the slider to fast forward or rewind', timeline.hints.slider],
                ['check my profiles from the links',         timeline.hints.links],
                ['stay tuned for my resume',                 timeline.hints.resume],
            ]
            this.hintTexts = hintSpecs.map(([text, key]) => new HintText(text, fd * key))

            // Group the car and its particles so they share a transform.
            // attach() preserves each child's world transform during reparent.
            this.carGroup = new THREE.Group()
            this.scene.add(this.carGroup)
            this.carGroup.attach(this.car.model)
            this.carGroup.attach(this.particlesRight.instancedMesh)
            this.carGroup.attach(this.particlesLeft.instancedMesh)

            // One-shot setup modules (no per-frame update)
            this.environment = new Environment()

            // UI utility — kept separate from world modules below
            this.progressSlider = new ProgressSlider()

            // Per-frame update registry. To add a new scene module, append it here.
            this.modules = [
                this.terrain,
                this.solidTerrain,
                this.car,
                this.sun,
                this.sunOuter,
                this.particlesRight,
                this.particlesLeft,
                this.spaceStation,
                this.resumeScroll,
                ...this.hintTexts,
            ]
        })
    }

    update()
    {
        if (!this.modules) return

        for (const m of this.modules) m.update?.()

        const { flattenAmount, baseRoadElevation } = this.experience.state
        this.carGroup.position.y = -baseRoadElevation * flattenAmount

        this.progressSlider.update()
    }
}
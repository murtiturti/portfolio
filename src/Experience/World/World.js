import Experience from "../Experience.js";
import Environment from './Environment';
import Floor from './Floor';
import Terrain from "./Terrain";
import Fox from './Fox';
import Car from './Car'
import Sun from "./Sun";
import SolidTerrain from "./SolidTerrain";
import SunOuter from "./SunOuter";
import Background from "./Background.js";
import ParticleEmitter from "../Utils/ParticleEmitter.js";
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
            // Setup
            //this.floor = new Floor()
            this.terrain = new Terrain()
            this.solidTerrain = new SolidTerrain()
            //this.fox = new Fox()
            this.car = new Car()
            this.sun = new Sun()
            this.sunOuter = new SunOuter()
            //this.backgroundPlane = new Background()
            this.environment = new Environment()

            this.particlesRight = new TileParticles(80, 1)
            this.particlesLeft = new TileParticles(80, -1)

            // Group the car and its particles so they share a transform
            // (e.g. car rises with the terrain flatten and particles follow).
            // attach() preserves each child's world transform during reparent.
            this.carGroup = new THREE.Group()
            this.scene.add(this.carGroup)
            this.carGroup.attach(this.car.model)
            this.carGroup.attach(this.particlesRight.instancedMesh)
            this.carGroup.attach(this.particlesLeft.instancedMesh)

            this.progressSlider = new ProgressSlider()
            this.spaceStation = new SpaceStation()
            this.resumeScroll = new ResumeScroll()
            const fd = this.terrain.finishDistance
            const hintSpecs = [
                ['press and hold anywhere to move',          timeline.hints.move],
                ['use the slider to fast forward or rewind', timeline.hints.slider],
                ['check my profiles from the links',         timeline.hints.links],
                ['stay tuned for my resume',                 timeline.hints.resume],
            ]
            this.hintTexts = hintSpecs.map(([text, key]) => new HintText(text, fd * key))
        })
    }

    update()
    {
        if (this.fox)
        {
            this.fox.update()
        }
        if (this.terrain && this.solidTerrain)
        {
            this.terrain.update()
            this.solidTerrain.update()
        }
        if (this.sun)
        {
            this.sun.update()
        }
        if (this.car)
        {
            this.car.update()
        }
        if (this.carGroup)
        {
            const { flattenAmount, baseRoadElevation } = this.experience.state
            this.carGroup.position.y = -baseRoadElevation * flattenAmount
        }
        if (this.particlesRight && this.particlesLeft)
        {
            this.particlesRight.update()
            this.particlesLeft.update()
        }
        if (this.progressSlider)
        {
            this.progressSlider.update()
        }
        if (this.spaceStation)
        {
            this.spaceStation.update()
        }
        if (this.resumeScroll)
        {
            this.resumeScroll.update()
        }
        if (this.hintTexts)
        {
            for (const h of this.hintTexts) h.update()
        }
    }
}
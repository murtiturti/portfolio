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
            // this.scene.add(this.particles)

            this.progressSlider = new ProgressSlider()
            this.spaceStation = new SpaceStation()
            this.resumeScroll = new ResumeScroll()
            const fd = this.terrain.finishDistance
            this.hintText  = new HintText('press and hold anywhere to move',          fd * timeline.hints.move)
            this.hintText2 = new HintText('use the slider to fast forward or rewind', fd * timeline.hints.slider)
            this.hintText3 = new HintText('check my profiles from the links',         fd * timeline.hints.links)
            this.hintText4 = new HintText('stay tuned for my resume',                 fd * timeline.hints.resume)
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
        if (this.hintText)
        {
            this.hintText.update()
        }
        if (this.hintText2)
        {
            this.hintText2.update()
        }
        if (this.hintText3)
        {
            this.hintText3.update()
        }
        if (this.hintText4)
        {
            this.hintText4.update()
        }
    }
}
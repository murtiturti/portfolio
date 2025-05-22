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

            this.particlesRight = new TileParticles(40, 1)
            this.particlesLeft = new TileParticles(40, -1)
            // this.scene.add(this.particles)
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

    }
}
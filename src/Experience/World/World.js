import Experience from "../experience";
import Environment from './Environment';
import Floor from './Floor';
import Terrain from "./Terrain";
import Fox from './Fox';
import Car from './Car'
import Sun from "./Sun";

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
            //this.fox = new Fox()
            this.car = new Car()
            this.sun = new Sun()
            this.environment = new Environment()
        })

        
    }

    update() 
    {
        if (this.fox)
        {
            this.fox.update()
        }
    }
}
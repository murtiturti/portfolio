import EventEmitter from "./EventEmitter";

export default class UserInput extends EventEmitter
{
    constructor()
    {
        super()

        this.mouseDown = false

        window.addEventListener('mousedown', (event) => {
            this.mouseDown = true
            this.trigger('mousedown', [event])
        })

        window.addEventListener('mouseup', (event) => {
            this.mouseDown = false
            this.trigger('mouseup', [event])
        })

        window.experience.time.on('tick', () => {
            if (this.mouseDown)
            {
                this.trigger('mouseheld')
            }
        })
    }
}
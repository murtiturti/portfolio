import EventEmitter from "./EventEmitter";

export default class UserInput extends EventEmitter
{
    constructor()
    {
        super()

        window.addEventListener('mousedown', (event) => {
            this.trigger('mousedown', [event])
        })

        window.addEventListener('mouseup', (event) => {
            this.trigger('mouseup', [event])
        })
    }
}
import EventEmitter from "./EventEmitter";

export default class Timer extends EventEmitter {
  constructor(durationInSeconds) {
    super();
    // Store duration in milliseconds
    this.duration = durationInSeconds * 1000;
    this.elapsed = 0;
    this.progress = 0; // Value between 0 and 1
    this.running = false;
  }

  // Start (or restart) the timer
  start() {
    this.running = true;
    this.elapsed = 0;
    this.progress = 0;
  }

  // Call update on every tick with deltaTime (in ms)
  update() 
  {
    if (!this.running) return;
    this.elapsed += window.experience.time.delta
    this.progress = Math.min(this.elapsed / this.duration, 1);
    
    if (this.progress === 1) {
      this.running = false;
      this.trigger("over");
    }
  }

  // Optional: reset the timer
  reset() 
  {
    this.elapsed = 0;
    this.progress = 0;
    this.running = false;
  }
}

// All values are fractions of finishDistance (0–1).
// Edit these to retime the experience.
export default {
    hints: {
        move:   0.00,  // "press and hold anywhere to move"
        slider: 0.10,  // "use the slider to fast forward or rewind"
        links:  0.30,  // "check my profiles from the links"
        resume: 0.40,  // "stay tuned for my resume"
    },
    terrain: {
        flattenStart: 0.43,  // hills start smoothing into a flat road
        flattenEnd:   0.47,  // terrain fully flat
    },
    station: {
        activate:        0.43,  // station begins approaching from offscreen
        arrive:          0.47,  // station settles in front of car; prelaunch begins
        launch:          0.50,  // rocket starts rising (ease-in phase)
        phase2:          0.53,  // rocket switches to constant speed
        cameraFollowEnd: 0.55,  // camera stops following the rocket
    },
    sky: {
        transitionStart:    0.50,  // sky begins fading from sunset to space
        transitionDuration: 0.015, // length of that fade
    },
    resume: {
        start: 0.55,  // resume cards begin scrolling into view
    },
}

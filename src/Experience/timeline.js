// All values are fractions of finishDistance (0–1).
// Edit these to retime the experience.
export default {
    hints: {
        move:   0.00,  // "press and hold anywhere to move"
        slider: 0.04,  // "use the slider to fast forward or rewind"
        links:  0.08,  // "check my profiles from the links"
        resume: 0.12,  // "stay tuned for my resume"
    },
    terrain: {
        flattenStart: 0.15,  // hills start smoothing into a flat road
        flattenEnd:   0.18,  // terrain fully flat
    },
    station: {
        activate:        0.18,  // station begins approaching from offscreen
        arrive:          0.20,  // station settles in front of car; prelaunch begins
        launch:          0.215,  // rocket starts rising (ease-in phase)
        phase2:          0.23,  // rocket switches to constant speed
        cameraFollowEnd: 0.24,  // camera stops following the rocket
    },
    sky: {
        transitionStart:    0.215,  // sky begins fading from sunset to space
        transitionDuration: 0.05, // length of that fade
    },
    resume: {
        start: 0.24,  // resume cards begin scrolling into view
    },
}

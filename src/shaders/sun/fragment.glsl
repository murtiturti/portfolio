uniform float uTime;
uniform vec3 uTopColor;
uniform vec3 uBottomColor;
uniform float uNumBands;
varying vec2 vUv;
varying vec3 vPosition;

void main()
{
    float t = (1.0 - cos(vUv.y * 3.14159265)) * 0.5;
    vec3 color = mix(uTopColor, uBottomColor, t);

    float strength = mod(vUv.y * uNumBands, 1.0);
    strength = step(0.6 * vUv.y, strength);

    gl_FragColor = vec4(color, strength);

    #include <colorspace_fragment>
    #include <tonemapping_fragment>
}
uniform vec3 uColor;
uniform float uTime;
varying vec2 vUv;
varying vec3 vPosition;

void main()
{
    vec3 color = uColor;

    gl_FragColor = vec4(color, 1.0);

    #include <colorspace_fragment>
    #include <tonemapping_fragment>
}
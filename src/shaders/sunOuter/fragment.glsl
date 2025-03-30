uniform vec3 uAtmosphereDayColor;

varying vec3 vNormal;
varying vec3 vPosition;

void main()
{
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    float intensity = pow(1.0 - dot(normalize(vNormal), viewDirection), 3.0);

    vec3 glow = uAtmosphereDayColor * intensity;

    // vec3 normal = normalize(vNormal);
    // vec3 color = uAtmosphereDayColor;

    // Final color
    gl_FragColor = vec4(glow, intensity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
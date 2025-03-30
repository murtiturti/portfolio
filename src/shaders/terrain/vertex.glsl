uniform vec2 uBigHillFrequency;
uniform float uBigHillElevation;
uniform float uTime;
uniform float uRoadElevation;

#include ../includes/cnoise

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Elevation
    float elevation = cnoise(vec3(modelPosition.xz * uBigHillFrequency, uTime)) * uBigHillElevation;

    float fade = smoothstep(0.0, 20.0, abs(modelPosition.x));
    elevation *= fade;
    elevation -= (1.0 - fade) * -uRoadElevation;

    modelPosition.y += elevation;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
}
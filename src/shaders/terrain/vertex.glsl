uniform float uBigHillElevation;
uniform vec2 uBigHillFrequency;

#include ../includes/cnoise

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Elevation
    //float elevation = sin(modelPosition.z * uBigHillFrequency.y) * sin(modelPosition.x * uBigHillFrequency.x) * uBigHillElevation;
    float elevation = cnoise(vec3(modelPosition.xz * uBigHillFrequency, 0.0)) * uBigHillElevation;

    float fade = smoothstep(0.0, 15.0, abs(modelPosition.x));
    elevation *= fade;

    modelPosition.y += elevation;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
}
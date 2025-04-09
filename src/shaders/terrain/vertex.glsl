uniform float uBigHillElevation;
uniform float uTime;
uniform float uRoadElevation;
uniform float uValleyDepth;
uniform vec2 uBigHillFrequency;
uniform float uCarYRotation;
uniform float uDistance;


#include ../includes/cnoise

void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Elevation
    float elevation = cnoise(vec3(modelPosition.xz * uBigHillFrequency, uTime)) * uBigHillElevation;

    // Curve
    float xOffset = sin(0.3 * uv.y + uTime) * sin(0.1 * uv.y + uTime) * 3.0;

    float diff = uv.y - 0.5;
    diff = clamp(diff, 0.0, 0.5) / 0.5;
    float side = uCarYRotation / 30.0;

    float fade = smoothstep(0.0, uValleyDepth + abs(sin(uTime)) * 8.0, abs(modelPosition.x + xOffset));
    elevation *= fade;
    elevation -= (1.0 - fade) * -uRoadElevation;

    modelPosition.y += elevation;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
}
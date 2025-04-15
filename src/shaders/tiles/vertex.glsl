varying vec2 vUv;

void main()
{
    vec4 transformed = instanceMatrix * vec4(position, 1.0);

    vec4 modelPosition = modelMatrix * transformed;
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    vUv = uv;
}
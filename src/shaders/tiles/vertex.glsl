attribute vec3 aVelocity;
attribute float aBirthTime;

uniform float uTime;
uniform float uPointSize;

void main()
{
    float age = uTime - aBirthTime;

    vec3 displacedPosition = position + aVelocity * age;

    vec4 modelPosition = modelMatrix * vec4(displacedPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    gl_PointSize = uPointSize * 8.0;
    gl_PointSize *= (1.0 / -viewPosition.z);
}
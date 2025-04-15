precision mediump float;

varying vec2 vUv;

// Uniforms for outline control
float uOutlineThickness = 0.075;  // e.g. 0.05
vec4 uOutlineColor = vec4(0.0, 0.8, 0.1, 1.0);       // e.g. vec4(0.0, 0.0, 0.0, 1.0) for black outline

// Hardcoded fill color (or you could pass it as a uniform)
vec4 uFillColor = vec4(vec3(0.02), 1.0);

// Edge distance helper function
float edgeDistance(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  // Invert y so that (0,0) is bottom-left
  vec2 p = vec2(vUv.x, vUv.y);

  // Calculate distances to each of the triangle's edges.
  float d1 = edgeDistance(p, vec2(0.0, 0.0), vec2(1.0, 0.0));
  float d2 = edgeDistance(p, vec2(1.0, 0.0), vec2(0.5, 0.75));
  float d3 = edgeDistance(p, vec2(0.5, 0.75), vec2(0.0, 0.0));
  float d = min(d1, min(d2, d3));

  // Determine if the fragment is inside the triangle.
  // For p.x < 0.5, the top edge is defined by y = 1.5 * x,
  // and for p.x >= 0.5, by y = 1.5 * (1.0 - x).
  float upperBound = (p.x < 0.5) ? (1.5 * p.x) : (1.5 * (1.0 - p.x));
  if (p.y > upperBound) {
    discard;
  }
  
  // Compute an outline factor; fragments very near an edge get a higher factor.
  float outlineFactor = 1.0 - smoothstep(0.0, uOutlineThickness, d);
  
  // Mix fill and outline colors based on the computed edge proximity.
  vec4 color = mix(uFillColor, uOutlineColor, outlineFactor);
  
  gl_FragColor = color;

  #include <colorspace_fragment>
  #include <tonemapping_fragment>
}

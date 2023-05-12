precision mediump float;

attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {
  vec3 p = position;

  p.z -= 1.;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
}
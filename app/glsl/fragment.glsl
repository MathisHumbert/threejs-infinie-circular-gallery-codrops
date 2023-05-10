precision mediump float;

uniform sampler2D tMap;
uniform vec2 uImageSize;
uniform vec2 uPlaneSize;

varying vec2 vUv;

void main() {
  vec2 ratio = vec2(
    min((uPlaneSize.x / uPlaneSize.y) / (uImageSize.x / uImageSize.y), 1.),
    min((uPlaneSize.y / uPlaneSize.x) / (uImageSize.y / uImageSize.x), 1.)
  );

  vec2 uv = vec2(
    vUv.x * ratio.x + (1. - ratio.x) * 0.5,
    vUv.y * ratio.y + (1. - ratio.y) * 0.5
  );

  vec4 texture = texture2D(tMap, uv);

  gl_FragColor = texture;
}
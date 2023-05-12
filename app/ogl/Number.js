import { Color, Geometry, Mesh, Program, Text, Texture } from 'ogl';

import font from './fonts/forma.json';
import src from './fonts/forma.png';
import fragment from './shaders/title-fragment.glsl';
import vertex from './shaders/title-vertex.glsl';

export default class Number {
  constructor({ gl, plane, renderer, text }) {
    this.gl = gl;
    this.plane = plane;
    this.renderer = renderer;
    this.text = text;

    this.createShader();
    this.createMesh();
  }

  createShader() {
    const texture = new Texture(this.gl, {
      generateMipmaps: false,
    });
    const textureImg = new Image();

    textureImg.src = src;
    textureImg.onload = () => (texture.image = textureImg);

    const vertex100 = `${vertex}`;

    const fragment100 = `
    #extension GL_OES_standard_derivatives : enable

    precision mediump float;

    ${fragment}
  `;

    const vertex300 = `#version 300 es

    #define attribute in
    #define varying out

    ${vertex}
  `;

    const fragment300 = `#version 300 es

    precision mediump float;

    #define varying in
    #define texture2D texture
    #define gl_FragColor FragColor

    out vec4 FragColor;

    ${fragment}
  `;

    this.program = new Program(this.gl, {
      cullFace: null,
      depthTest: false,
      depthWrite: false,
      transparent: true,
      vertex: this.renderer.isWebgl2 ? vertex300 : vertex100,
      fragment: this.renderer.isWebgl2 ? fragment300 : fragment100,
      uniforms: {
        uColor: { value: new Color('#545050') },
        tMap: { value: texture },
      },
    });
  }

  createMesh() {
    const text = new Text({
      font,
      text: `${this.text < 10 ? `0${this.text}` : this.text}`,
      align: 'center',
      letterSpacing: -0.05,
      size: 0.025,
      wordSpacing: 0,
    });

    const geometry = new Geometry(this.gl, {
      position: { size: 3, data: text.buffers.position },
      uv: { size: 2, data: text.buffers.uv },
      id: { size: 1, data: text.buffers.id },
      index: { data: text.buffers.index },
    });

    geometry.computeBoundingBox();

    this.mesh = new Mesh(this.gl, { geometry, program: this.program });
    this.mesh.position.y = -this.plane.scale.y * 0.5 - 0.03;
    this.mesh.setParent(this.plane);
  }
}

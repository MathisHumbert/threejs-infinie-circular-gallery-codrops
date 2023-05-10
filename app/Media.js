import { Mesh, Program, Texture } from 'ogl';

import fragment from './glsl/fragment.glsl';
import vertex from './glsl/vertex.glsl';

export default class Media {
  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    scene,
    screen,
    text,
    viewport,
  }) {
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.viewport = viewport;

    this.createShader();
    this.createMesh();

    this.onResize();
  }

  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: false });

    this.program = new Program(this.gl, {
      fragment,
      vertex,
      uniforms: {
        tMap: { value: texture },
        uImageSize: { value: [0, 0] },
        uPlaneSize: { value: [0, 0] },
        uViewportSizes: { value: [this.viewport.width, this.viewport.height] },
      },
      transparent: true,
    });

    const image = new Image();

    image.src = this.image;
    image.onload = () => {
      texture.image = image;

      this.program.uniforms.uImageSize.value = [
        image.naturalWidth,
        image.naturalHeight,
      ];
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    });

    this.plane.setParent(this.scene);
  }

  onResize({ screen, viewport } = {}) {
    if (screen) this.screen = screen;

    if (viewport) {
      this.viewport = viewport;

      this.program.uniforms.uViewportSizes.value = [
        this.viewport.width,
        this.viewport.height,
      ];
    }

    this.scale = this.screen.height / 1500;

    this.plane.scale.x =
      (this.viewport.width * (this.scale * 700)) / this.screen.width;
    this.plane.scale.y =
      (this.viewport.height * (this.scale * 900)) / this.screen.height;

    this.program.uniforms.uPlaneSize.value = [
      this.plane.scale.x,
      this.plane.scale.y,
    ];

    this.padding = 2;

    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;

    this.x = this.width * this.index;
  }

  update() {
    this.plane.position.x = this.x;
  }
}

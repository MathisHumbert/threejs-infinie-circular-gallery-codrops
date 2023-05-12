import { Mesh, Program, Texture } from 'ogl';
import { map } from '../utils';

import fragment from './shaders/image-fragment.glsl';
import vertex from './shaders/image-vertex.glsl';
import Title from './Title';
import Number from './Number';

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
    renderer,
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
    this.renderer = renderer;

    this.extra = 0;

    this.createShader();
    this.createMesh();
    this.createTitle();

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
        uSpeed: { value: 0 },
        uTime: { value: 0 },
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

  createTitle() {
    new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
    });

    new Number({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: (this.index % (this.length / 2)) + 1,
    });
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

    // set size for the plane
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

  update(scroll, direction) {
    // update plane position
    this.plane.position.x = this.x - scroll.current * 1.5 - this.extra;

    // circular rotation
    this.plane.rotation.z = map(
      this.plane.position.x,
      -this.widthTotal,
      this.widthTotal,
      Math.PI,
      -Math.PI
    );
    this.plane.position.y =
      Math.cos((this.plane.position.x / this.widthTotal) * Math.PI) * 75 - 75;

    this.speed = scroll.current - scroll.last;

    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    // infinite gallery
    const planeOffset = this.plane.scale.x / 2;
    const viewportOffest = this.viewport.width;

    this.isBefore = this.plane.position.x + planeOffset < -viewportOffest;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffest;

    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;

      this.isBefore = false;
      this.isAfter = false;
    }

    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;

      this.isBefore = false;
      this.isAfter = false;
    }
  }
}

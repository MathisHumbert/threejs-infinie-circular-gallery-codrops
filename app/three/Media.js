import * as THREE from 'three';

import vertex from './shaders/vertex.glsl';
import fragment from './shaders/fragment.glsl';
import Title from './Title';
import Number from './Number';
import { map } from '../utils';

export default class Media {
  constructor({
    geometry,
    scene,
    image,
    screen,
    viewport,
    index,
    length,
    text,
  }) {
    this.geometry = geometry;
    this.scene = scene;
    this.image = image;
    this.screen = screen;
    this.viewport = viewport;
    this.index = index;
    this.length = length;
    this.text = text;

    this.xExtra = 0;
    this.group = new THREE.Group();

    this.createShader();
    this.createMesh();

    this.onResize();

    this.createTitle();
  }

  createShader() {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(this.image, (texture) => {
      this.material.uniforms.uImageSizes.value = new THREE.Vector2(
        texture.image.naturalWidth,
        texture.image.naturalHeight
      );

      return texture;
    });

    this.material = new THREE.RawShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uTexture: { value: texture },
        uPlaneSizes: { value: new THREE.Vector2(0, 0) },
        uImageSizes: { value: new THREE.Vector2(0, 0) },
        uTime: { value: 0 },
        uSpeed: { value: 0 },
      },
      transparent: true,
    });
  }

  createMesh() {
    this.plane = new THREE.Mesh(this.geometry, this.material);

    this.group.add(this.plane);

    this.scene.add(this.group);
  }

  createTitle() {
    new Title({
      text: this.text,
      group: this.group,
      planeHeight: this.plane.scale.y,
    });

    new Number({
      text: this.index % (this.length / 2),
      group: this.group,
      planeHeight: this.plane.scale.y,
    });
  }

  onResize({ screen, viewport } = {}) {
    if (screen) {
      this.screen = screen;
    }

    if (viewport) {
      this.viewport = viewport;
    }

    this.scale = this.screen.height / 1500;

    this.plane.scale.x =
      (this.viewport.width * (this.scale * 700)) / this.screen.width;
    this.plane.scale.y =
      (this.viewport.height * (this.scale * 900)) / this.screen.height;

    this.material.uniforms.uPlaneSizes.value = new THREE.Vector2(
      this.plane.scale.x,
      this.plane.scale.y
    );

    this.padding = 2;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;

    this.x = this.width * this.index;
  }

  update(scroll, direction, time, speed) {
    this.group.position.x = this.x - scroll * 0.5 - this.xExtra;

    this.group.rotation.z = map(
      this.group.position.x,
      -this.widthTotal,
      this.widthTotal,
      Math.PI,
      -Math.PI
    );

    this.group.position.y =
      Math.cos((this.group.position.x / this.widthTotal) * Math.PI) * 75 - 75;

    this.material.uniforms.uTime.value = time;
    this.material.uniforms.uSpeed.value = speed;

    const planeOffset = this.plane.scale.x * 0.75;
    const viewportOffset = this.viewport.width * 0.5;

    this.isBefore = this.group.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.group.position.x - planeOffset > viewportOffset;

    if (direction === 'right' && this.isBefore) {
      this.xExtra -= this.widthTotal;

      this.isBefore = false;
      this.isAfter = false;
    }

    if (direction === 'left' && this.isAfter) {
      this.xExtra += this.widthTotal;

      this.isBefore = false;
      this.isAfter = false;
    }
  }
}

import * as THREE from 'three';
import vertex from './shaders/vertex.glsl';
import fragment from './shaders/fragment.glsl';
import { map } from '../utils';

export default class Media {
  constructor({ geometry, scene, image, screen, viewport, index, length }) {
    this.geometry = geometry;
    this.scene = scene;
    this.image = image;
    this.screen = screen;
    this.viewport = viewport;
    this.index = index;
    this.length = length;

    this.xExtra = 0;

    this.createShader();
    this.createMesh();

    this.onResize();
  }

  createShader() {
    // const img = new Image()
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(this.image, (texture) => {
      this.material.uniforms.uImageSizes.value = new THREE.Vector2(
        texture.image.naturalWidth,
        texture.image.naturalHeight
      );

      return texture;
    });

    // shader
    this.material = new THREE.RawShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uTexture: { value: texture },
        uPlaneSizes: { value: new THREE.Vector2(0, 0) },
        uImageSizes: { value: new THREE.Vector2(0, 0) },
      },
      transparent: true,
      // wireframe: true,
    });
  }

  createMesh() {
    this.plane = new THREE.Mesh(this.geometry, this.material);

    this.scene.add(this.plane);
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

  update(scroll, direction) {
    this.plane.position.x = this.x - scroll.current - this.xExtra;
    this.plane.rotation.z = map(
      this.plane.position.x,
      -this.widthTotal,
      this.widthTotal,
      Math.PI,
      -Math.PI
    );

    this.plane.position.y =
      Math.cos((this.plane.position.x / this.widthTotal) * Math.PI) * 75 - 75;
    const planeOffset = this.plane.scale.x * 0.5;
    const viewportOffset = this.viewport.width * 0.5;

    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;

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

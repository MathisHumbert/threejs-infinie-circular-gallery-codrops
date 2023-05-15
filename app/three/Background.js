import * as THREE from 'three';
import { random } from '../utils';
export default class Background {
  constructor({ scene, viewport }) {
    this.scene = scene;
    this.viewport = viewport;

    const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: '#c4c3b6' });

    this.meshes = [];

    for (let i = 0; i < 50; i++) {
      let mesh = new THREE.Mesh(geometry, material);

      const scale = random(0.75, 1);

      mesh.scale.x = 1.6 * scale;
      mesh.scale.y = 0.9 * scale;

      mesh.speed = random(0.75, 1);

      mesh.xEtra = 0;

      mesh.x = mesh.position.x = random(
        -viewport.width * 0.5,
        viewport.width * 0.5
      );
      mesh.y = mesh.position.y = random(
        -viewport.height * 0.5,
        viewport.height * 0.5
      );
      mesh.position.z -= 2;

      this.meshes.push(mesh);

      this.scene.add(mesh);
    }
  }

  onResize(viewport) {
    if (viewport) {
      this.viewport = viewport;

      this.meshes.forEach((mesh) => {
        mesh.x = mesh.position.x = random(
          -viewport.width * 0.5,
          viewport.width * 0.5
        );
        mesh.y = mesh.position.y = random(
          -viewport.height * 0.5,
          viewport.height * 0.5
        );
      });
    }
  }

  update(scroll, direction) {
    this.meshes.forEach((mesh) => {
      mesh.position.x = mesh.x - scroll * mesh.speed - mesh.xEtra;

      const viewportOffset = this.viewport.width * 0.5;
      const widthTotal = this.viewport.width + mesh.scale.x;

      mesh.isBefore = mesh.position.x < -viewportOffset;
      mesh.isAfter = mesh.position.x > viewportOffset;

      if (direction == 'right' && mesh.isBefore) {
        mesh.xEtra -= widthTotal;

        mesh.isBefore = false;
        mesh.isAfter = false;
      }

      if (direction == 'left' && mesh.isAfter) {
        mesh.xEtra += widthTotal;

        mesh.isBefore = false;
        mesh.isAfter = false;
      }

      mesh.position.y += 0.05 * mesh.speed;

      if (mesh.position.y > this.viewport.height * 0.5 + mesh.scale.y) {
        mesh.position.y -= this.viewport.height + mesh.scale.y + 2;
      }
    });
  }
}

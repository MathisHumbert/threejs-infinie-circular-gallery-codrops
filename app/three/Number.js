import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

export default class Number {
  constructor({ text, group, planeHeight }) {
    const fontLoader = new FontLoader();

    fontLoader.load('/font/forma.json', (font) => {
      const geometry = new TextGeometry(`${text < 10 ? 0 : ''}${text + 1}`, {
        font,
        size: 0.2,
        height: 0.01,
        curveSegments: 12,
        bevelEnabled: false,
        letterSpacing: 0.05,
      });

      const material = new THREE.MeshBasicMaterial({ color: '#545050' });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = -planeHeight * 0.5 - 0.5;
      mesh.geometry.center();

      group.add(mesh);
    });
  }
}

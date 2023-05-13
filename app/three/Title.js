import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

export default class Title {
  constructor({ text, group, planeHeight }) {
    const fontLoader = new FontLoader();

    fontLoader.load('/font/freight.json', (font) => {
      const geometry = new TextGeometry(text, {
        font,
        size: 0.55,
        height: 0.01,
        curveSegments: 12,
        bevelEnabled: false,
      });

      const material = new THREE.MeshBasicMaterial({ color: '#545050' });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.y = -planeHeight * 0.5 - 1.25;
      mesh.geometry.center();

      group.add(mesh);
    });
  }
}

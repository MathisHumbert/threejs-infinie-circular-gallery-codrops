import * as THREE from 'three';
import normalizeWheel from 'normalize-wheel';
import { debounce } from 'lodash';

import Media from './Media';
import { lerp } from '../utils';

export default class App {
  constructor() {
    this.scroll = {
      current: 0,
      target: 0,
      last: 0,
      ease: 0.05,
    };

    this.screen = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.time = 0;

    this.onCheckDebounce = debounce(this.onCheck, 200);

    this.createScene();
    this.createCamera();
    this.createRenderer();

    this.onResize();

    this.createGeometry();
    this.createMedia();

    this.update();

    this.addEventListeners();
  }

  createScene() {
    this.scene = new THREE.Scene();
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.screen.width / this.screen.height,
      1,
      100
    );
    this.camera.position.z = 20;
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.screen.width, this.screen.height);

    document.body.appendChild(this.renderer.domElement);
  }

  createGeometry() {
    this.planeGeometry = new THREE.PlaneGeometry(1, 1, 100, 50);
  }

  createMedia() {
    this.mediasImages = [
      { image: '/img/1.jpg', text: 'New Synagogue' },
      { image: '/img/2.jpg', text: 'Paro Taktsang' },
      { image: '/img/3.jpg', text: 'Petra' },
      { image: '/img/4.jpg', text: 'Gooderham Building' },
      { image: '/img/5.jpg', text: 'Catherine Palace' },
      { image: '/img/6.jpg', text: 'Sheikh Zayed Mosque' },
      { image: '/img/7.jpg', text: 'Madonna Corona' },
      { image: '/img/8.jpg', text: 'Plaza de Espana' },
      { image: '/img/9.jpg', text: 'Saint Martin' },
      { image: '/img/10.jpg', text: 'Tugela Falls' },
      { image: '/img/11.jpg', text: 'Sintra-Cascais' },
      { image: '/img/12.jpg', text: "The Prophet's Mosque" },
      { image: '/img/1.jpg', text: 'New Synagogue' },
      { image: '/img/2.jpg', text: 'Paro Taktsang' },
      { image: '/img/3.jpg', text: 'Petra' },
      { image: '/img/4.jpg', text: 'Gooderham Building' },
      { image: '/img/5.jpg', text: 'Catherine Palace' },
      { image: '/img/6.jpg', text: 'Sheikh Zayed Mosque' },
      { image: '/img/7.jpg', text: 'Madonna Corona' },
      { image: '/img/8.jpg', text: 'Plaza de Espana' },
      { image: '/img/9.jpg', text: 'Saint Martin' },
      { image: '/img/10.jpg', text: 'Tugela Falls' },
      { image: '/img/11.jpg', text: 'Sintra-Cascais' },
      { image: '/img/12.jpg', text: "The Prophet's Mosque" },
    ];

    this.medias = this.mediasImages.map(
      ({ image, text }, index) =>
        new Media({
          image,
          text,
          index,
          length: this.mediasImages.length,
          screen: this.screen,
          viewport: this.viewport,
          geometry: this.planeGeometry,
          scene: this.scene,
        })
    );
  }

  onResize() {
    this.screen = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.renderer.setSize(this.screen.width, this.screen.height);

    this.camera.aspect = this.screen.width / this.screen.height;
    this.camera.updateProjectionMatrix();

    const fov = this.camera.fov * (Math.PI / 180);
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;

    this.viewport = { width, height };

    if (this.medias) {
      this.medias.forEach((media) =>
        media.onResize({ screen: this.screen, viewport: this.viewport })
      );
    }
  }

  onWheel(event) {
    const normalized = normalizeWheel(event);
    this.scroll.target += normalized.pixelY * 0.01;

    this.onCheckDebounce();
  }

  onTouchDown(event) {
    this.isDown = true;

    this.scroll.position = this.scroll.current;
    this.startX = event.touches ? event.touches[0].clientX : event.clientX;
  }

  onTouchMove(event) {
    if (!this.isDown) return;

    const x = event.touches ? event.touches[0].clientX : event.clientX;
    const distance = (this.startX - x) * 0.05;
    this.scroll.target = this.scroll.position + distance;
  }

  onTouchUp() {
    this.isDown = false;

    this.onCheck();
  }

  onCheck() {
    const mediaWidth = this.medias[0].width;
    const mediaIndex = Math.round(
      Math.abs(this.scroll.target / (mediaWidth * 2))
    );

    const item = mediaWidth * (mediaIndex * 2);

    if (this.scroll.target < 0) {
      this.scroll.target = -item;
    } else {
      this.scroll.target = item;
    }
  }

  update() {
    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease
    );

    if (this.scroll.current > this.scroll.last) {
      this.direction = 'right';
    } else {
      this.direction = 'left';
    }

    this.scroll.speed = this.scroll.current - this.scroll.last;
    this.time += 0.04;

    if (this.medias) {
      this.medias.forEach((media) =>
        media.update(
          this.scroll.current,
          this.direction,
          this.time,
          this.scroll.speed
        )
      );
    }

    this.scroll.last = this.scroll.current;
    this.renderer.render(this.scene, this.camera);

    window.requestAnimationFrame(this.update.bind(this));
  }

  addEventListeners() {
    window.addEventListener('resize', this.onResize.bind(this));

    window.addEventListener('mousewheel', this.onWheel.bind(this));
    window.addEventListener('wheel', this.onWheel.bind(this));

    window.addEventListener('mousedown', this.onTouchDown.bind(this));
    window.addEventListener('mousemove', this.onTouchMove.bind(this));
    window.addEventListener('mouseup', this.onTouchUp.bind(this));

    window.addEventListener('touchstart', this.onTouchDown.bind(this));
    window.addEventListener('touchmove', this.onTouchMove.bind(this));
    window.addEventListener('touchend', this.onTouchUp.bind(this));
  }
}

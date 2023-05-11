import { Renderer, Camera, Transform, Plane } from 'ogl';
import normalizeWheel from 'normalize-wheel';
import { debounce } from 'lodash';

import Media from './Media';
import { lerp } from './utils';
export default class App {
  constructor() {
    this.scroll = {
      current: 0,
      target: 0,
      last: 0,
      ease: 0.05,
    };

    this.onCheckDebounce = debounce(this.onCheck, 200);

    this.createRenderer();
    this.createCamera();
    this.createScene();

    this.createGeometry();

    this.onResize();

    this.createMedias();

    this.update();

    this.addEventListeners();
  }

  createRenderer() {
    this.renderer = new Renderer({
      antialias: true,
    });

    this.gl = this.renderer.gl;
    this.gl.clearColor(0.79607843137, 0.79215686274, 0.74117647058, 1);

    document.body.appendChild(this.gl.canvas);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 50,
      widthSegments: 100,
    });
  }

  createMedias() {
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

    this.medias = this.mediasImages.map(({ image, text }, index) => {
      const media = new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image,
        index,
        length: this.mediasImages.length,
        scene: this.scene,
        screen: this.screen,
        text,
        viewport: this.viewport,
        renderer: this.renderer,
      });

      return media;
    });
  }

  onResize() {
    this.screen = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.renderer.setSize(this.screen.width, this.screen.height);

    this.camera.perspective({
      aspect: this.gl.canvas.width / this.gl.canvas.height,
    });

    const fov = this.camera.fov * (Math.PI / 180);
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;

    this.viewport = {
      width,
      height,
    };

    if (this.medias) {
      this.medias.forEach((media) =>
        media.onResize({ screen: this.screen, viewport: this.viewport })
      );
    }
  }

  onWheel(event) {
    const normalized = normalizeWheel(event);
    const speed = normalized.pixelY;

    this.scroll.target += speed * 0.005;

    this.onCheckDebounce();
  }

  onTouchDown(event) {
    this.isDown = true;

    this.scroll.position = this.scroll.current;
    this.start = event.touches ? event.touches[0].clientX : event.clientX;
  }

  onTouchMove(event) {
    if (!this.isDown) return;

    const x = event.touches ? event.touches[0].clientX : event.clientX;
    const distance = (this.start - x) * 0.01;
    this.scroll.target = this.scroll.position + distance;
  }

  onTouchUp() {
    this.isDown = false;

    this.onCheck();
  }

  // snapping the closest item
  onCheck() {
    const { width } = this.medias[0];
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;

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

    if (this.medias) {
      this.medias.forEach((media) => media.update(this.scroll, this.direction));
    }

    this.scroll.last = this.scroll.current;

    this.renderer.render({
      scene: this.scene,
      camera: this.camera,
    });

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

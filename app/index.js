import imagesLoaded from 'imagesloaded';

import THREE from './three/App';
import OGL from './ogl/App';

const preloadImages = () => {
  return new Promise((resolve) => {
    imagesLoaded(document.querySelectorAll('img'), resolve);
  });
};

preloadImages().then(() => {
  new THREE();
});

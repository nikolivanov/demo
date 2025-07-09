import { initScene, animate } from './scene.js';
import { initMediaPipe } from './mediapipe.js';
import { initUI } from './ui.js';

initScene().then(initUI);
initMediaPipe();
animate();

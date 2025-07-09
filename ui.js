import { getShowLandmarks, setShowLandmarks } from './scene.js';

export function initUI() {
  const toggle = document.getElementById('toggle_landmarks');
  if (toggle) {
    toggle.checked = getShowLandmarks();
    toggle.addEventListener('change', () => {
      setShowLandmarks(toggle.checked);
    });
  }
}

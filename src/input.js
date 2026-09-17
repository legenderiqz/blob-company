import { gs } from './core/state.js';
import { canvasClicked } from './update.js';
import { getCanvas } from './core/dom.js';
import {
  playSound,
  playMusic,
  currentMusic,
  pauseMusic,
  resumeMusic,
} from './utils/soundManager.js';

export function buttonInteractions(up, down, left, right, e, q) {
  [up, down, left, right, e, q].forEach((btn) => {

    btn.addEventListener('pointerdown', () => {
      if (gs.menuOpen) return;

      switch (btn.id) {
        case 'up':    setTouch('up', true); break;
        case 'down':  setTouch('down', true); break;
        case 'left':  setTouch('left', true); break;
        case 'right': setTouch('right', true); break;
        case 'e':     setTouch('e', true); break;
        case 'q':     setTouch('q', true); break;
      }
    });

    const release = () => {
      switch (btn.id) {
        case 'up':    setTouch('up', false); break;
        case 'down':  setTouch('down', false); break;
        case 'left':  setTouch('left', false); break;
        case 'right': setTouch('right', false); break;
        case 'e':     setTouch('e', false); break;
        case 'q':     setTouch('q', false); break;
      }
    };

    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointercancel', release);
    btn.addEventListener('pointerleave', release);
  });
}

export function updateKeys() {
  console.log('deneme1')
  if (gs.menuOpen) return;
  console.log('deneme2')
  const { keyboard, touch } = gs.keys;

  gs.keys.up =
    keyboard.w || touch.up;

  gs.keys.down =
    keyboard.s || touch.down;

  gs.keys.left =
    keyboard.a || touch.left;

  gs.keys.right =
    keyboard.d || touch.right;

  gs.keys.ePressed =
    keyboard.e || touch.e;

  gs.keys.qPressed =
    keyboard.q || touch.q;
}

export function keyInteractions() {
  window.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'KeyW': gs.keys.keyboard.w = true; break;
      case 'KeyA': gs.keys.keyboard.a = true; break;
      case 'KeyS': gs.keys.keyboard.s = true; break;
      case 'KeyD': gs.keys.keyboard.d = true; break;
      case 'KeyE': gs.keys.keyboard.e = true; break;
      case 'KeyQ': gs.keys.keyboard.q = true; break;
      default: return;
    }

    updateKeys();
  });

  window.addEventListener('keyup', (e) => {
    switch (e.code) {
      case 'KeyW': gs.keys.keyboard.w = false; break;
      case 'KeyA': gs.keys.keyboard.a = false; break;
      case 'KeyS': gs.keys.keyboard.s = false; break;
      case 'KeyD': gs.keys.keyboard.d = false; break;
      case 'KeyE': gs.keys.keyboard.e = false; break;
      case 'KeyQ': gs.keys.keyboard.q = false; break;
      default: return;
    }

    updateKeys();
  });
}

function setTouch(key, state) {
  gs.keys.touch[key] = state;
  updateKeys();
}

export function canvasInteractions() {
  const canvas = getCanvas();

  canvas.addEventListener('pointerup', (e) => {
    try {
      if (!document.fullscreenElement) {
        const el = document.documentElement;

        if (el.requestFullscreen) {
          el.requestFullscreen().catch(() => {});
        }
      }
    } catch (e) {}

    // canvasClicked her zaman çalışsın
    try {
      canvasClicked(e);
    } catch (e) {}
  });
}

document.addEventListener('click', (e) => {
  if (gs.speakerOn && !currentMusic) {
    playMusic('speakerMusic');
  }
  if (!gs.soundEnabled) return;
  const btn = e.target.closest('button');
  if (!btn) return;

  playSound(btn.dataset.sound || 'click', 0.6);
});

document.addEventListener('visibilitychange', () => {
  gs.paused = document.hidden;

  if (gs.paused) {
    pauseMusic();
  } else {
    resumeMusic();
  }
});
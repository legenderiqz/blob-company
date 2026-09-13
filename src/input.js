import { gs, createInitialGS } from './core/state.js';
import { canvasClicked } from './update.js';
import { getCanvas } from './core/dom.js';
import {
  playSound,
  playMusic,
  currentMusic,
  pauseMusic,
  resumeMusic,
  stopAllSounds
} from './utils/soundManager.js';

export function buttonInteractions(up, down, left, right, e, q) {
  [up, down, left, right, e, q].forEach((btn) => {
    btn.addEventListener('pointerdown', () => {
      if (gs.menuOpen) return;
      switch(btn.id) {
        case 'up': gs.keys.up = true; break;
        case 'down': gs.keys.down = true; break;
        case 'left': gs.keys.left = true; break;
        case 'right': gs.keys.right = true; break;
        case 'e': gs.keys.ePressed = true; break;
        case 'q': gs.keys.qPressed = true; break;
      }
    });
    
    btn.addEventListener('pointerup', () => {
      switch(btn.id) {
        case 'up': gs.keys.up = false; break;
        case 'down': gs.keys.down = false; break;
        case 'left': gs.keys.left = false; break;
        case 'right': gs.keys.right = false; break;
        case 'e': gs.keys.ePressed = false; break;
        case 'q': gs.keys.qPressed = false; break;
      }
    });
    
    btn.addEventListener('pointercancel', () => {
      switch(btn.id) {
        case 'up': gs.keys.up = false; break;
        case 'down': gs.keys.down = false; break;
        case 'left': gs.keys.left = false; break;
        case 'right': gs.keys.right = false; break;
        case 'e': gs.keys.ePressed = true; break;
        case 'q': gs.keys.qPressed = true; break;
      }
    });
  });
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
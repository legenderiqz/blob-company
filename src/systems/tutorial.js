import { gs } from '../core/state.js';
import { saveGame } from './save.js';

export function notifyTutorialAction(action) {
  gs.tutorialActions ??= {};

  if (!gs.tutorialActions[action]) {
    gs.tutorialActions[action] = true;
    saveGame();
  }

  window.dispatchEvent(
    new CustomEvent('game-tutorial-action', { detail: action })
  );
}

export function notifyTutorialAction(action) {
  window.dispatchEvent(
    new CustomEvent('game-tutorial-action', { detail: action })
  );
}

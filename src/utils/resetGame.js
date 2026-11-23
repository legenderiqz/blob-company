import { gs, createInitialGS } from '../core/state.js';
import { initPlants } from '../data/gardenData.js';
import { initUpgrades } from '../data/upgradeData.js';
import { stopAllSounds } from './soundManager.js';
import { saveGame } from '../systems/save.js';

export function resetGame() {
  const ctx = gs.ctx;
  const tutorialSeen = gs.tutorialSeen ||
    gs.tutorialCompleted ||
    gs.tutorialVersion > 0;
  const tutorialCompleted = gs.tutorialCompleted;
  const tutorialVersion = gs.tutorialVersion;
  const settings = {
    currentLang: gs.currentLang,
    autoSave: gs.autoSave,
    soundEnabled: gs.soundEnabled,
    debug: gs.debug,
    ePosRight: gs.ePosRight,
    qPosRight: gs.qPosRight,
    autoFullscreen: gs.autoFullscreen
  };

  stopAllSounds();

  for (const key of Object.keys(gs)) delete gs[key];
  Object.assign(gs, createInitialGS(), {
    ctx,
    tutorialSeen,
    tutorialCompleted,
    tutorialVersion,
    ...settings
  });

  initUpgrades();
  initPlants();
  window.dispatchEvent(new Event('game-reset'));
  saveGame();
}

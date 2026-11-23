import { gs } from '../core/state.js';
import { saveGame } from './save.js';
import { updateAutoSave } from '../update.js';
import { t, languages } from '../core/localization.js';
import {
  applyEPosChange,
  applyQPosChange,
  startTutorial
} from '../ui.js';
import { resetGame } from '../utils/resetGame.js';

export function initSettings() {
  const btn = document.getElementById('settings-btn');
  const overlay = document.getElementById('settings-overlay');
  const close = document.getElementById('set-close');

  const autoSaveBtn = document.getElementById('auto-save');
  const soundBtn = document.getElementById('sfx-toggle');
  const resetBtn = document.getElementById('set-reset');
  const debugBtn = document.getElementById('debug-toggle');
  const setTitle = document.getElementById('set-title');
  const ePos = document.getElementById('e-pos-toggle');
  const qPos = document.getElementById('q-pos-toggle');
  const langSelect = document.getElementById('lang-select');
  const fullScreen = document.getElementById('fullScreen-toggle');
  const tutorialReplayBtn =
    document.getElementById('tutorial-replay');
  
  btn.onclick = () => {
    overlay.classList.add('active');

    gs.menuOpen = true;
    
    setTitle.textContent =
      t('settings.title');
    
    autoSaveBtn.textContent =
      t('settings.autoSave') + ': ' +
      (gs.autoSave ? t('settings.on') : t('settings.off'));
    
    soundBtn.textContent =
      t('settings.sound') + ': ' +
      (gs.soundEnabled ? t('settings.on') : t('settings.off'));
    
    debugBtn.textContent =
      t('settings.debug') + ': ' +
      (gs.debug ? t('settings.on') : t('settings.off'));
    
    langSelect.replaceChildren(
      ...Object.entries(languages).map(([code, language]) => {
        const option = document.createElement('option');
        option.value = code;
        option.textContent =
          `${language.settings.language}: ${language.languageName}`;
        return option;
      })
    );
    langSelect.value = gs.currentLang;
      
    ePos.textContent =
      t('settings.ePos') +
      ': ' + 
      (gs.ePosRight ? t('settings.ePosRight') : t('settings.ePosLeft'));
      
    qPos.textContent =
      t('settings.qPos') +
      ': ' + 
      (gs.qPosRight ? t('settings.qPosRight') : t('settings.qPosLeft'));

    fullScreen.textContent =
      t('settings.fullScreen') +
      ': ' +
      (gs.autoFullscreen ? t('settings.on') : t('settings.off'));
      
    resetBtn.textContent = 
      t('settings.reset');
    tutorialReplayBtn.textContent =
      t('settings.replayTutorial');
  };


  close.onclick = () => {
    overlay.classList.remove('active');

    gs.menuOpen = false;
  };


  autoSaveBtn.onclick = () => {
    gs.autoSave = !gs.autoSave;
    updateAutoSave();
    saveGame();

    autoSaveBtn.textContent =
      t('settings.autoSave') + ': ' +
      (gs.autoSave ? t('settings.on') : t('settings.off'));
  };


  soundBtn.onclick = () => {
    gs.soundEnabled = !gs.soundEnabled;
    saveGame();

    soundBtn.textContent =
      t('settings.sound') + ': ' +
      (gs.soundEnabled ? t('settings.on') : t('settings.off'));
  };
  
  debugBtn.onclick = () => {
    gs.debug = !gs.debug;
    saveGame();

    debugBtn.textContent =
      t('settings.debug') + ': ' +
      (gs.debug ? t('settings.on') : t('settings.off'));
    
  };
  
  langSelect.onchange = () => {
    gs.currentLang = langSelect.value;
    localStorage.setItem('preferred-language', gs.currentLang);
    saveGame();
    location.reload();
  };
  
  ePos.onclick = () => {
    gs.ePosRight = !gs.ePosRight;
    applyEPosChange();
    saveGame();
    ePos.textContent =
      t('settings.ePos') + ': ' + 
      (gs.ePosRight ? t('settings.ePosRight') : t('settings.ePosLeft'));
  };
  
  qPos.onclick = () => {
    gs.qPosRight = !gs.qPosRight;
    applyQPosChange();
    saveGame();
    qPos.textContent =
      t('settings.qPos') + ': ' + 
      (gs.qPosRight ? t('settings.qPosRight') : t('settings.qPosLeft'));
  };

  fullScreen.onclick = () => {
    gs.autoFullscreen = !gs.autoFullscreen;
    saveGame();
    fullScreen.textContent =
      t('settings.fullScreen') + ': ' + 
      (gs.autoFullscreen ? t('settings.on') : t('settings.off'));
  };

  tutorialReplayBtn.onclick = () => {
    overlay.classList.remove('active');
    gs.menuOpen = false;
    startTutorial({ replay: true });
  };

  resetBtn.onclick = () => {
    if (confirm(t('settings.confirmReset'))) {
      resetGame()
    }
  };
}

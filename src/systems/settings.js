import { gs } from '../core/state.js';
import { saveGame, deleteSave } from './save.js';
import { updateAutoSave } from '../update.js';
import { t, setLanguage, languages } from '../core/localization.js';
import { applyEPosChange, applyQPosChange } from '../ui.js';
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
  const langBtn = document.getElementById('lang-btn');
  const fullScreen = document.getElementById('fullScreen-toggle')
  
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
    
    langBtn.textContent =
      t('settings.language') +
      ': ' +
      t('languageName');
      
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
      (gs.autoFullScreen ? t('settings.on') : t('settings.off'));
      
    resetBtn.textContent = 
      t('settings.reset');
  };


  close.onclick = () => {
    overlay.classList.remove('active');

    gs.menuOpen = false;
  };


  autoSaveBtn.onclick = () => {
    gs.autoSave = !gs.autoSave;
    updateAutoSave()

    autoSaveBtn.textContent =
      t('settings.autoSave') + ': ' +
      (gs.autoSave ? t('settings.on') : t('settings.off'));
  };


  soundBtn.onclick = () => {
    gs.soundEnabled = !gs.soundEnabled;

    soundBtn.textContent =
      t('settings.sound') + ': ' +
      (gs.soundEnabled ? t('settings.on') : t('settings.off'));
  };
  
  debugBtn.onclick = () => {
    gs.debug = !gs.debug;

    debugBtn.textContent =
      t('settings.debug') + ': ' +
      (gs.debug ? t('settings.on') : t('settings.off'));
    
  };
  
  langBtn.onclick = () => {
    const languageKeys = Object.keys(languages);
    const index = languageKeys.indexOf(gs.currentLang);
  
    gs.currentLang =
      languageKeys[(index + 1) % languageKeys.length];
    
    saveGame();
    location.reload();
  };
  
  ePos.onclick = () => {
    gs.ePosRight = !gs.ePosRight;
    applyEPosChange()
    ePos.textContent =
      t('settings.ePos') + ': ' + 
      (gs.ePosRight ? t('settings.ePosRight') : t('settings.ePosLeft'));
  };
  
  qPos.onclick = () => {
    gs.qPosRight = !gs.qPosRight;
    applyQPosChange()
    qPos.textContent =
      t('settings.qPos') + ': ' + 
      (gs.qPosRight ? t('settings.qPosRight') : t('settings.qPosLeft'));
  };

  fullScreen.onclick = () => {
    gs.autoFullScreen = !gs.autoFullScreen;
    fullScreen.textContent =
      t('settings.fullScreen') + ': ' + 
      (gs.autoFullScreen ? t('settings.on') : t('settings.off'));
  };

  resetBtn.onclick = () => {
    if (confirm(t('settings.confirmReset'))) {
      resetGame()
    }
  };
}



import { 
  initUI, 
  initTrendweb, 
  applyEPosChange, 
  applyQPosChange 
} from './ui.js';
import { loadAssets } from './utils/imageManager.js';
import { canvasInteractions } from './input.js';
import { loadGame, saveGame } from './systems/save.js';
import { initSettings } from './systems/settings.js';
import { initSounds } from './utils/soundManager.js';
import { initUpgrades } from './data/upgradeData.js';
import { initPlants } from './data/gardenData.js';
import { initRendering, render } from './render.js';   
import { initUpdating, update } from './update.js';
import { initDOM } from './core/dom.js';
import { gs } from './core/state.js';
import { CONFIG } from './core/config.js';
import { setWanderTarget } from './systems/ai.js';

let ctx;

function setRealHeight() {
  requestAnimationFrame(() => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', vh + 'px');
  });
}

function loop() {
  update();
  render(ctx);
  requestAnimationFrame(loop);
}

async function init() {
  loadGame();
  initUpgrades();
  initPlants();
  initSounds();
  initDOM();

  ctx = canvas.getContext('2d');
  gs.ctx = ctx;
  initUI();
  initSettings();
  applyEPosChange();
  applyQPosChange();
  initRendering(ctx);
  
  await loadAssets();

  initUpdating(canvas);
  canvasInteractions();
  
  initTrendweb()
  
  loop();
}

setRealHeight();
init();

window.addEventListener('resize', setRealHeight);
window.addEventListener('orientationchange', setRealHeight);
window.gs = gs;
window.addEventListener('error', (event) => {
  console.log('Error Stack Trace:\n', event.error?.stack);
});

if(CONFIG.GOD_MODE) {
  window.db = {
    // Shortcut to give player gold/money: db.g(500)
    c: (amount = 10000000n) => {
      gs.cash += BigInt(amount);
      console.log(`💰 Added ${amount} cash. Total: ${gs.cash}`);
    },

    // Shortcut to teleport player: db.tp(100, 200)
    tp: (x, y) => { 
      gs.player.x = x;  
      gs.player.y = y;
      console.log(`🚀 Teleported to X:${x}, Y:${y}`);
    },
    
    item: (name) => {
      if (!gs.handItem) gs.handItem = String(name);
    },
    
    h: () => {
      gs.blob.hunger = 50;
    },

    save: () => {
      saveGame();
    },

    blobPos: (x, y, e = gs.blob) => {
      setWanderTarget(x, y, e)
    }
  };
}

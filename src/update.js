import { gs } from './core/state.js';
import { CONFIG } from './core/config.js';
import { updateCashUI } from './ui.js';
import { updateAI } from './systems/ai.js';
import { resolvePushOut, getCollision } from './utils/collision.js';
import { showNews, updateNews } from './systems/news.js';
import { updateTime } from './systems/time.js';
import { updatePlants } from './systems/plants.js';
import { checkNear } from './systems/near.js';
import { t } from './core/localization.js';
import { saveGame } from './systems/save.js';
import { playSound, playMusic, stopCurrentMusic, getCurrentMusic } from './utils/soundManager.js';
import { addInterval, updateTimeouts, updateIntervals } from './systems/timeout.js';

let canvas;
let lastTime = performance.now();
export let dt = 0;
let autoSaveInterval = null;

export function initUpdating(canvasRef) {
  canvas = canvasRef;
  initStateUpdates(canvas);
  updateAutoSave()
  saveGame()
}

export function updateAutoSave() {
  if (gs.autoSave) {
    if (!gs.intervals.autoSave) {
      addInterval(
        'autoSave',
        'autoSave',
        CONFIG.SAVE_TIME
      );
    }
  } else {
    delete gs.intervals.autoSave;
  }
}

export function initStateUpdates(canvas) {
  setPositions(canvas);
  // Eksik state değişkenlerini başlat
  if (gs.inputLock === undefined) gs.inputLock = 0;
  if (gs.menuOpen === undefined) gs.menuOpen = false;
  
  if (gs.firstTry) {
    showNews('welcome');

    setTimeout(() => showNews('tutorialClickBlob'), 6000);
    setTimeout(() => showNews('tutorialBuyFood'), 12000);
    setTimeout(() => showNews('tutorialCleanToilet'), 18000);
    setTimeout(() => showNews('tutorialBuyUpgrades'), 24000);
    setTimeout(() => {
      showNews('tutorialDiscover');
      gs.firstTry = false;
      saveGame();
    }, 30000);
  } else {
    showNews('rejoin');
  }
}

// Bu fonksiyon gece rüyama girdi
function setPositions(canvas) {
  const cX = gs.rooms[gs.currentRoom].width / 2;
  const cY = gs.rooms[gs.currentRoom].height / 2;
  const pC = gs.player.size / 2;
  
  if (gs.player.x === null)
    gs.player.x = cX - pC;
  if (gs.player.y === null)
    gs.player.y = cY - pC;
  if (gs.blob.x === null)
    gs.blob.x = cX - gs.blob.size / 2;
  if (gs.blob.y === null)
    gs.blob.y = gs.player.y + gs.blob.size * 2;
  if (gs.stain.x === null)
    gs.stain.x = cX - gs.blob.size / 2;
  if (gs.stain.y === null)
    gs.stain.y = gs.player.y + gs.blob.size * 2;
  if (gs.camera.x === null)
    gs.camera.x = gs.player.x + pC - canvas.width / 2;
  if (gs.camera.y === null)
    gs.camera.y = gs.player.y + pC - canvas.height / 2;
}

export function update() {
  if (gs.paused) return;
  dt = updateDeltaTime();

  updateTime(dt);
  updateFPS();
  tryMove();
  clampPlayer();
  clampCam();
  checkNear(dt);
  updateAIEntities();
  updateCashUI();
  updateNews(dt);
  updatePlants(dt);
  updateAutoIncrease(dt);
  updateBlobHappiness(dt);
  updateTimeouts(dt);
  updateIntervals(dt);
  //updateAmbientMusic()
  
  gs.keys.ePressed = false;
  gs.keys.qPressed = false;
}

/*
export function updateAmbientMusic() {
  if (gs.currentRoom !== 'garden') {
    stopCurrentMusic();
    return;
  }

  const targetMusic =
    gs.currentDayStage === 'morning'
      ? 'day'
      : 'night';

  if (getCurrentMusic()?.dataset?.name === targetMusic) {
    return;
  }

  playMusic(targetMusic, 0.3);
}
*/

export function updateDeltaTime() {
  const now = performance.now();

  dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  gs.dtMs = Math.round(dt * 1000);

  return dt;
}

function updateAIEntities() {
  // Blob her zaman aktif
  updateAI(gs.blob, dt, gs);
  
  // Stain sadece unlock edilmişse aktif
  if (gs.stainUnlocked && gs.stain.active) {
    updateAI(gs.stain, dt, gs);
  }
}

function updateFPS() {
  const now = performance.now();
  
  gs.frames++;
  
  const elapsed = now - gs.lastFpsUpdate;
  
  if (elapsed >= 1000) {
    gs.fps = Math.round(gs.frames * 1000 / elapsed);
    
    gs.frames = 0;
    gs.lastFpsUpdate = now;
  }
}

export function tryMove() {
  const p = gs.player;
  if (gs.inputLock > 0 || gs.menuOpen) return;
  
  let dx = 0,
      dy = 0;
  if (gs.keys.up) dy -= 1;
  if (gs.keys.down) dy += 1;
  if (gs.keys.left) dx -= 1;
  if (gs.keys.right) dx += 1;
  if (dx === 0 && dy === 0) return;
  
  const len = dx || dy ? Math.sqrt(dx * dx + dy * dy) : 1;
  dx /= len;
  dy /= len;
  const speed = p.speed * dt * gs.player.speedMulti;
  
  const nextX = p.x + dx * speed;
  const nextY = p.y + dy * speed;
  
  // X ekseni hareketi ve collision
  const collidedX = getCollision(nextX, p.y, p.size, gs);
  if (!collidedX) {
    p.x = nextX;
  } else {
    resolvePushOut(p, collidedX);
  }
  
  // Y ekseni hareketi ve collision
  const collidedY = getCollision(p.x, nextY, p.size, gs);
  if (!collidedY) {
    p.y = nextY;
  } else {
    resolvePushOut(p, collidedY);
  }
}

export function clampCam() {
  const targetX = gs.player.x + gs.player.size / 2 - canvas.width / 2;
  const targetY = gs.player.y + gs.player.size / 2 - canvas.height / 2;
  
  if (canvas.width >= gs.rooms[gs.currentRoom].width) {
    gs.camera.x = (gs.rooms[gs.currentRoom].width - canvas.width) / 2;
  } else {
    gs.camera.x = Math.max(0, Math.min(gs.rooms[gs.currentRoom].width - canvas.width, targetX));
  }
  
  if (canvas.height >= gs.rooms[gs.currentRoom].height) {
    gs.camera.y = (gs.rooms[gs.currentRoom].height - canvas.height) / 2;
  } else {
    gs.camera.y = Math.max(0, Math.min(gs.rooms[gs.currentRoom].height - canvas.height, targetY));
  }
}

export function clampPlayer() {
  const p = gs.player;
  if (p.x < 0) p.x = 0;
  if (p.y < 0) p.y = 0;
  if (p.x + p.size > gs.rooms[gs.currentRoom].width) p.x = gs.rooms[gs.currentRoom].width - p.size;
  if (p.y + p.size > gs.rooms[gs.currentRoom].height) p.y = gs.rooms[gs.currentRoom].height - p.size;
}

export function canvasClicked(e) {
  const rect = canvas.getBoundingClientRect();
  const worldX = (e.clientX - rect.left) + gs.camera.x;
  const worldY = (e.clientY - rect.top) + gs.camera.y;
  const b = gs.blob;
  
  if (pointInObject(worldX, worldY, b)) {
    clickBlob();
  }
}

export function pointInObject(x,y,obj) {
  return (
    x >= obj.x && x <= obj.x + obj.size &&
    y >= obj.y && y <= obj.y + obj.size
  );
}

export function clickBlob() {
  const now = Date.now();
  if (now - gs.lastBlobClick < CONFIG.B_COOLDOWN) return;
  gs.lastBlobClick = now;
  gs.cash += gs.cashIncrease + gs.cashBoost;
  playSound('pop');
}

export function updateAutoIncrease(dt) {
  if (gs.autoClicker) handleAutoClicker(dt);
  if (gs.tableIncome) handleTableIncome(dt);
}

function handleAutoClicker(dt) {
  gs.autoTime -= dt;
  if (gs.autoTime <= 0) {
    gs.cash += gs.cashIncrease;
    gs.autoTime = gs.maxAutoTime;
  }
}

function handleTableIncome(dt) {
  gs.incomeCd -= dt;

  if (gs.incomeCd <= 0) {
    gs.companyCash += gs.companyIncome;
    if (gs.companyCash > gs.maxCompanyCash) {
      gs.companyCash = gs.maxCompanyCash;
    }
    gs.incomeCd = gs.maxIncomeCd;
  }
}


function updateBlobHappiness(dt) {
  const h = gs.blob.hunger;
  const event = gs.happinessEvent;
  
  gs.targetPlayerChance = gs.happiness / 400;
  gs.fleeChance = (100 - gs.happiness) / 400;
  
  // Olaylara göre mutluluk
  switch (gs.happinessEvent) {
    case 'big_up':
      gs.happiness += 10;
      break;
    case 'small_up':
      gs.happiness += 5;
      break;
    case 'big_down':
      gs.happiness -= 10;
      break;
    case 'small_down':
      gs.happiness -= 5;
      break;
  }
  
  if (gs.blob.hunger > gs.maxEntityHunger) {
    gs.happiness += gs.happinessGain * dt;
  } else {
    gs.happiness += (gs.happinessTarget - gs.happiness) * gs.happinessEqualize * dt;
  }
  gs.happiness = Math.max(0, Math.min(100, gs.happiness));
  gs.happinessEvent = 'neutral';
} 
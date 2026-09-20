import { gs } from './core/state.js';
import { CONFIG } from './core/config.js';
import { updateCashUI } from './ui.js';
import { updateAI } from './systems/ai.js';
import { resolvePushOut, getCollision } from './utils/collision.js';
import { showNews, updateNews } from './systems/news.js';
import { updateTime } from './systems/time.js';
import { updatePlants } from './systems/plants.js';
import { checkNear } from './systems/near.js';
import { saveGame } from './systems/save.js';
import { playSound } from './utils/soundManager.js';
import { addInterval, updateTimeouts, updateIntervals } from './systems/timeout.js';

let canvas;
let lastTime = performance.now();
export let dt = 0;

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
    gs.stain.x = cX - gs.stain.size / 2;
  if (gs.stain.y === null)
    gs.stain.y = gs.player.y + gs.stain.size * 2;

  if (gs.doze.x === null)
    gs.doze.x = cX - gs.doze.size / 2;
  if (gs.doze.y === null)
    gs.doze.y = gs.player.y + gs.doze.size * 2;

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
  updateCameraZoom();
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
  updateFloatingTexts(dt);
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
  // Doze sadece unlock edilmişse aktif
  if (gs.dozeUnlocked && gs.doze.active) {
    updateAI(gs.doze, dt, gs);
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
  const room = gs.rooms[gs.currentRoom];

  const viewWidth = canvas.width / gs.camera.zoom;
  const viewHeight = canvas.height / gs.camera.zoom;

  const targetX =
    gs.player.x +
    gs.player.size / 2 -
    viewWidth / 2;

  const targetY =
    gs.player.y +
    gs.player.size / 2 -
    viewHeight / 2;

  if (viewWidth >= room.width) {
    gs.camera.x =
      (room.width - viewWidth) / 2;
  } else {
    gs.camera.x = Math.max(
      0,
      Math.min(
        room.width - viewWidth,
        targetX
      )
    );
  }

  if (viewHeight >= room.height) {
    gs.camera.y =
      (room.height - viewHeight) / 2;
  } else {
    gs.camera.y = Math.max(
      0,
      Math.min(
        room.height - viewHeight,
        targetY
      )
    );
  }
}

export function updateCameraZoom() {
  if(!gs.setCameraZoom) return;
  gs.setCameraZoom = false;

  const shortSide = Math.min(
    canvas.width,
    canvas.height
  );

  gs.newsFontSize = Math.round(
    shortSide / 35
  );

  gs.newsFontSize = Math.max(
    13,
    Math.min(24, gs.newsFontSize)
  );

  const room = gs.rooms['house'];

  const zoomX = canvas.width / room.width;
  const zoomY = canvas.height / room.height;

  gs.camera.zoom = Math.max(
    1,
    Math.floor(Math.min(zoomX, zoomY))
  );
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

  const pos = screenToWorld(
    e.clientX - rect.left,
    e.clientY - rect.top
  );

  if (pointInObject(pos.x, pos.y, gs.blob)) {
    clickBlob();
  }
}

export function screenToWorld(screenX, screenY) {
  return {
    x: screenX / gs.camera.zoom + gs.camera.x,
    y: screenY / gs.camera.zoom + gs.camera.y
  };
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
  if (Math.random() * 100 <= gs.critChance) {
    gs.cashBoost = gs.cashIncrease;
  } else {
    gs.cashBoost = 0n;
  }
  gs.cash += gs.cashIncrease + gs.cashBoost;
  playSound('pop');
  createFloatingText(
    `+${gs.cashIncrease + gs.cashBoost}`,
    gs.blob.x + (Math.random() * 20),
    gs.blob.y - gs.blob.size,
    gs.cashBoost
  )
}

export function createFloatingText(text, x, y, boost) {
  gs.floatingTexts.push({
    text,
    x,
    y,
    life: 0.7,
    maxLife: 0.7,
    scale: 1.8,
    boost
  });
}

export function updateFloatingTexts(dt) {
  for (let i = gs.floatingTexts.length - 1; i >= 0; i--) {

    const f = gs.floatingTexts[i];

    f.life -= dt;

    f.y -= 120 * dt;

    f.scale -= 1.4 * dt;

    if (f.life <= 0) {
      gs.floatingTexts.splice(i, 1);
    }
  }
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
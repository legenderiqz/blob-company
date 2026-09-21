import { collides, resolvePushOut, aabb } from '../utils/collision.js';
import { gs, GameObject} from '../core/state.js';
import { CONFIG } from '../core/config.js';
import { endGame } from '../ui.js';
import { EAT_EFFECTS } from './food.js';

/* =========================
   HELPERS
========================= */

function setState(e, state) {
  e.aiState = state;
  e.stateTimer = 0;
}

function resetState(e, state) {
  e.aiState = state;
  e.stateTimer = 0;
  e.tx = null;
  e.ty = null;
}

function tryEat(e, dt) {
  if (
    e.ai.includes('eat') &&
    e.hunger < gs.hungerLimit
  ) {
    eat(e, dt);
    return true;
  }

  return false;
}

function tryPoop(e, dt) {
  if (
    e.ai.includes('poop') &&
    e.aiState === 'poop'
  ) {
    poop(e, dt);
    return true;
  }

  return false;
}

function trySleep(e, dt) {
  if (e.aiState === 'sleep') { 
    sleep(e, dt);
    return true;
  }

  return false;
}

function tryPlay(e, dt) {
  if (e.aiState === 'play') {
    play(e, dt);
    return true;
  }

  return false;
}

/* =========================
   MAIN UPDATE
========================= */

export function updateAI(entity, dt) {
  if (!entity?.ai) return;
  if (!entity.active) return;
  entity.stateTimer ??= 0;
  entity.stateTimer += dt;
  
  if (entity.type === 'blob' && gs.cashDropping) {
    gs.cashDropCooldown -= dt;

    if (gs.cashDropCooldown <= 0) {
      gs.cashDropCooldown = gs.moneyBagCd;

      spawnMoneyBag(entity);
    }
  }
  
  if (entity.hunger === null) {
    entity.hunger = CONFIG.E_NULL_HUNGER;
  }
  
  if (
    entity.hunger !== undefined &&
    entity.aiState !==  'sleeping' &&
    entity.aiState !== 'playing'
  ) {
    entity.hunger -= dt * gs.hungerEffect;
  }
  
  if (entity.hunger < 0) {
    entity.hunger = 0;
    endGame('deathHunger');
  }
  
  if (
    entity.aiState !== 'wander' &&
    entity.stateTimer > CONFIG.MAX_STATE_TIME
  ) {
    entity.aiState = 'wander';
    entity.tx = null;
    entity.ty = null;
    entity.stateTimer = 0;
  }
  
  if (entity.idleTimer > 0) {
    entity.idleTimer -= dt;
    if (entity.idleTimer > 0) return;
    entity.idleTimer = 0;
  }
  
  if (
  entity.ai.includes('play') &&
  gs.toybox &&
  gs.toyActive &&
  entity.aiState === 'wander' &&
  entity.hunger >= gs.hungerLimit
) {
  setState(entity, 'play');
}
  
  if (
    entity.aiState === 'sleep' &&
    entity.ai.includes('eat') &&
    entity.hunger < gs.hungerLimit
  ) {
    setState(entity, 'wander');
    eat(entity, dt);
    return;
  }
  
  if (
    entity.ai.includes('eat') &&
    entity.hunger < gs.hungerLimit &&
    entity.aiState !== 'go_bowl' &&
    entity.aiState !== 'wait_food' &&
    entity.aiState !== 'wander'
  ) {
    resetState(entity, 'wander');
  }
  
  if (
    entity.ai.includes('eat') &&
    entity.hunger < gs.hungerLimit &&
    (
      entity.aiState === 'play' ||
      entity.aiState === 'playing' ||
      entity.aiState === 'sleep' ||
      entity.aiState === 'sleeping'
    )
  ) {
    entity.idleTimer = 0;
    resetState(entity, 'wander');
  }
  
  if (
    entity.idleTimer === 0 &&
    entity.aiState === 'sleeping'
  ) {
    applySleepEffects(entity);
  }
  
  if (
    entity.idleTimer === 0 &&
    entity.aiState === 'playing'
  ) {
    applyPlayEffects(entity);
  }
  
  if (
    entity.ai.includes('sleep') && 
    gs.currentDayStage === 'morning' &&
    entity.slept
  ) {
    entity.slept = false;
  }
  
  if (
    gs.currentDayStage === 'morning' &&
    entity.aiState === 'sleeping'
  ) {
    applySleepEffects(entity);
  }
  
  if (
    entity.ai.includes('sleep') &&
    gs.currentDayStage === 'night' &&
    !entity.slept &&
    entity.aiState === 'wander' &&
    (
      !entity.ai.includes('eat') ||
      entity.hunger >= gs.hungerLimit
    )
  ) {
    setState(entity, 'sleep');
  }
  
  if (
    entity.ai.includes('play') &&
    gs.toybox &&
    gs.toyActive &&
    entity.aiState === 'wander'
  ) {
    setState(entity, 'play');
  }
  
  if (tryEat(entity, dt)) return;

  if (tryPoop(entity, dt)) return;

  if (trySleep(entity, dt)) return;

  if (tryPlay(entity, dt)) return;

  if (entity.ai.includes('wander')) {
    wander(entity, dt);
  }
}

export function spawnMoneyBag(e) {
  const bag = gs.objects.find(o => o.type === 'moneyBag') || null;
  if (bag?.active) return;
  bag.x = e.x;
  bag.y = e.y;
  bag.visible = true;
  bag.active = true;
}

/* =========================
   WANDER
========================= */

function wander(e, dt) {

  const house = gs.rooms.house;

  const minX = gs.safeMargin;
  const maxX = house.width - e.size - gs.safeMargin;

  const minY = gs.safeMargin;
  const maxY = house.height - e.size - gs.safeMargin;

  if (e.tx == null || e.ty == null) {
    chooseWanderTarget(
      e,
      minX,
      maxX,
      minY,
      maxY
    );
  }

  const reached =
    moveToTarget(e, dt, false);

  if (!reached) return;

  e.tx = null;
  e.ty = null;

  if (
    e.hunger >= gs.hungerLimit ||
    e.hunger === undefined
  ) {

    if (e.poopWaiting) {
      gs.happiness -= 10;

      e.poopWaiting = false;

      applyPoopEffects(
        e,
        false
      );
    }

    e.idleTimer =
      gs.blobWaitingTime;
  }
}

function chooseWanderTarget(e, minX, maxX, minY, maxY) {

  const r = Math.random();

  if (r < gs.targetPlayerChance) {
    choosePlayerTarget(e, minX, maxX, minY, maxY);
    return;
  } else if (r < gs.targetPlayerChance + gs.fleeChance) {
    chooseFleeTarget(e, minX, maxX, minY, maxY);
    return;
  } else {
    chooseRandomTarget(e, minX, maxX, minY, maxY);
  }
}

function choosePlayerTarget(e, minX, maxX, minY, maxY) {
  gs.happiness += 1;
  const offsetX = (Math.random() - 0.5) * 80;
  const offsetY = (Math.random() - 0.5) * 80;

  e.tx = Math.floor(gs.player.x + offsetX);
  e.ty = Math.floor(gs.player.y + offsetY);

  e.tx = Math.max(minX, Math.min(maxX, e.tx));
  e.ty = Math.max(minY, Math.min(maxY, e.ty));

  if (collides(e.tx, e.ty, e.size, gs)) {
    chooseRandomTarget(e, minX, maxX, minY, maxY);
  }
}

function chooseFleeTarget(e, minX, maxX, minY, maxY) {
  gs.happiness -= 1;
  let bestX = e.x;
  let bestY = e.y;
  let bestDist = -1;

  for (let i = 0; i < 20; i++) {

    const x = Math.floor(
      minX + Math.random() * (maxX - minX)
    );

    const y = Math.floor(
      minY + Math.random() * (maxY - minY)
    );

    if (collides(x, y, e.size, gs)) continue;

    const dx = x - gs.player.x;
    const dy = y - gs.player.y;

    const dist = dx * dx + dy * dy;

    if (dist > bestDist) {
      bestDist = dist;
      bestX = x;
      bestY = y;
    }
  }

  e.tx = bestX;
  e.ty = bestY;
}

function chooseRandomTarget(e, minX, maxX, minY, maxY) {

  let tries = 0;

  do {
    e.tx = Math.floor(
      minX + Math.random() * (maxX - minX)
    );

    e.ty = Math.floor(
      minY + Math.random() * (maxY - minY)
    );

    tries++;

  } while (
    collides(e.tx, e.ty, e.size, gs) &&
    tries < 20
  );
}

export function setWanderTarget(x, y, e = gs.blob) {
  if (!CONFIG.GOD_MODE) return;

  if (collides(x, y, e.size, gs)) {
    console.warn(
      'Target collides with object.'
    );
  }

  e.tx = x;
  e.ty = y;

  console.log(
    `Wander target set to (${x}, ${y})`
  );
}

/* =========================
   EAT 
========================= */

function eat(e, dt) {
  const bowl = gs.objects.find(o => o.type === 'bowl');
  if (!bowl) return;
  if (e.type !== 'blob') return;

  // AI state'i kontrol et - başlangıçta 'wander' veya undefined olabilir
  checkAiState(e, bowl)

  if (e.aiState === 'go_bowl') {
    checkEating(e, dt)
  }

  if (e.aiState === 'wait_food') {
    handleEat(e);
  }
}

function checkAiState(e, bowl) {
  setState(e, 'go_bowl');

  e.tx = bowl.x + bowl.width / 2 - e.size / 2;
  e.ty = bowl.y + bowl.height / 2 - e.size / 2;
}

function checkEating(e, dt) {
  moveToTarget(e, dt, false);

  const dx = e.x - e.tx;
  const dy = e.y - e.ty;
    
  if (dx * dx + dy * dy < CONFIG.MIN_DIST) {
    setState(e, 'wait_food');
  }
}

function handleEat(e) {
  const dx = e.x - e.tx;
  const dy = e.y - e.ty;
    
  if (dx * dx + dy * dy < CONFIG.MIN_DIST) {
    setState(e, 'wait_food');
  } else {
    setState(e, 'go_bowl');
    return;
  }
  
  if (gs.otoYemek && !gs.bowlFood) gs.bowlFood = 'blob_food';
    
  if (!gs.bowlFood) return;
  
  const effect = EAT_EFFECTS[gs.bowlFood] ?? 0;
  e.hunger = effect;
  
  if (!gs.otoYemek) gs.bowlFood = null;
  else if (gs.bowlFood !== 'blob_food') gs.bowlFood = 'blob_food';
  
  setState(e, 'poop');
}

/* =========================
   POOP
========================= */


function poop(e, dt) {
  const toilet = gs.objects.find(o => o.type === 'toilet');
  if (!toilet) return;
  if (e.type !== 'blob') return;

  // AI state'i kontrol et
  if (e.aiState === 'poop') {
    checkPooping(e, dt, toilet);
  }
}

function checkPooping(e, dt, toilet) {
  e.tx = toilet.x + toilet.width/2 - e.size/2;
  e.ty = toilet.y + toilet.height/2 - e.size/2;
  
  moveToTarget(e, dt, false);
    
  const dx = e.x - e.tx;
  const dy = e.y - e.ty;

  if (dx * dx + dy * dy < CONFIG.MIN_DIST) {
    handlePoop(e, dt);
  }
}

function handlePoop(e, dt) {
  if (gs.otoGubre) {
    gs.toiletFull = false;
    gs.cash += gs.poopIncome;
  }
  
  if (!gs.toiletFull) {
    applyPoopEffects(e);
  } else {
    goForPoop(dt, e);
  }
}

function applyPoopEffects(e, original = true) {
  if (!gs.otoGubre) {
    if (original) gs.toiletFull = true;
    const poop = new GameObject({ 
      type: 'poop', sprite: 'poop',
      x: e.x, y: e.y,
      width: gs.itemSize, height: gs.itemSize,
      collidable: false,
      active: true,
      visible: true,
      stage: original ? 3 : 5,
      original: original
    })
  
    gs.objects.push(poop)
    gs.poops++;
  }
  gs.poopCooldown = gs.maxPoopCd;
  resetState(e, 'wander');
}

function goForPoop(dt, e) {
  resetState(e, 'wander');
  e.poopWaiting = true;
  
  if (gs.poops >= 3) {
    endGame('deathPoop')
  }
}

/* =========================
   SLEEP
========================= */


function sleep(e, dt) {
  if (e.ai.includes('eat') && e.hunger < gs.hungerLimit) {
    eat(e, dt)
    return;
  }
  
  if (gs.currentDayStage !== 'night') {
    applySleepEffects(e); 
    return;
  }
  
  const bed = gs.objects.find(o => o.type === 'bed');
  if (!bed) return;
  if (!e.ai.includes('sleep')) return;

  // AI state'i kontrol et
  if (e.aiState === 'sleep') {
    checkSleeping(e, dt, bed);
  }
}

function checkSleeping(e, dt, bed) {
  e.tx = setSleeperTx(e, bed);
  
  e.ty = bed.y + bed.height/2 - e.size/2;
  
  moveToTarget(e, dt, false);
    
  const dx = e.x - e.tx;
  const dy = e.y - e.ty;

  if (dx * dx + dy * dy < CONFIG.MIN_DIST) {
    handleSleep(e, dt);
  }
}

function setSleeperTx(e, bed) {
  let tx = bed.x + bed.width / 2 - e.size / 2;
  switch (e.type) {
    case 'blob':
      tx = bed.x + bed.width - e.size;
      break;
    case 'doze':
      tx = bed.x + e.size / 2;
      break;
  }
  return tx;
}

function handleSleep(e, dt) {
  if (gs.newBed) {
    gs.cash += gs.bedIncome;
  }
  e.slept = true;
  e.idleTimer = gs.blobSleepingTime;
  setState(e, 'sleeping');
}

function applySleepEffects(e) {
  resetState(e, 'wander');
  e.slept = true;
}

/* =========================
   PLAY 
========================= */

function play(e, dt) {
  if (!gs.toybox) return;
  if (!gs.toyActive) return;
  if (e.aiState !== 'play') return;
  if (e.hunger < gs.hungerLimit) return;
  
  const toybox = gs.objects.find(o => o.type === 'toybox');
  if (!toybox) return;

  checkPlaying(e, dt, toybox);
}

function checkPlaying(e, dt, toybox) {
  if (e.hunger < gs.hungerLimit) return;
  
  e.tx = toybox.x + toybox.width/2 - e.size/2;
  e.ty = toybox.y + toybox.height/2 - e.size/2;
  
  moveToTarget(e, dt, false);
    
  const dx = e.x - e.tx;
  const dy = e.y - e.ty;

  if (dx * dx + dy * dy < CONFIG.MIN_DIST) {
    handlePlay(e, dt);
  }
}

function handlePlay(e, dt) {
  if (e.hunger < gs.hungerLimit) return;
  
  if (
    gs.toyActive &&
    gs.currentToy === 'bone'
  ) gs.happiness += gs.toyMenu.boneHappiness;
  setState(e, 'playing');
  e.idleTimer = gs.blobPlayingTime;
}

function applyPlayEffects(e) {
  resetState(e, 'wander');
  gs.toyActive = false;
  gs.currentToy = null;
}


/* =========================
   MOVEMENT
========================= */

function moveToTarget(e, dt, applySlowness = true) {
  if (e.tx == null || e.ty == null) return false;

  const dx = e.tx - e.x;
  const dy = e.ty - e.y;

  const dist = Math.hypot(dx, dy);

  let speed = e.speed || CONFIG.B_SPEED;

  if (applySlowness) {
    speed /= gs.slowness;
  }

  const step = speed * dt;

  if (dist <= step) {

    if (!collides(e.tx, e.ty, e.size, gs)) {
      e.x = e.tx;
      e.y = e.ty;
    }

    return true;
  }

  const nx =
    e.x + (dx / dist) * step;

  const ny =
    e.y + (dy / dist) * step;

  if (!collides(nx, ny, e.size, gs)) {
    e.x = nx;
    e.y = ny;
  } else {
    e.tx = null;
    e.ty = null;
  }

  return false;
}

/* =========================
   COLLISION SAFE MOVE
========================= */

function moveSafe(e, nx, ny, world = gs) {
  e.x = nx;
  e.y = ny;
  
  if (collides(nx, ny, e.size, world)) {
    const angle = Math.random() * Math.PI * 2;

    e.x += Math.cos(angle) * 12;
    e.y += Math.sin(angle) * 12;

    e.tx = null;
    e.ty = null;
    return;
  }


  for (const obj of world.objects) {
    if (!obj.collidable) continue;

    if ( 
      aabb(
        e.x, e.y, e.size, e.size,
        obj.x, obj.y, obj.width, obj.height
      ) 
    ) {
      const left   = obj.x - e.size;
      const right  = obj.x + obj.width;
      const top    = obj.y - e.size;
      const bottom = obj.y + obj.height;

      const dxLeft = Math.abs(e.x - left);
      const dxRight = Math.abs(e.x - right);
      const dyTop = Math.abs(e.y - top);
      const dyBottom = Math.abs(e.y - bottom);

      const min = Math.min(dxLeft, dxRight, dyTop, dyBottom);

      if (min === dxLeft) e.x = left;
      else if (min === dxRight) e.x = right;
      else if (min === dyTop) e.y = top;
      else e.y = bottom;

      e.tx = null;
      e.ty = null;
      e.stuckTimer = 0;
      return;
    }
  }
}

//test
import { collides, aabb } from '../utils/collision.js';
import { gs, GameObject} from '../core/state.js';
import { CONFIG } from '../core/config.js';
import { endGame } from '../ui.js';
import { EAT_EFFECTS } from './food.js';

/* =========================
   HELPERS
========================= */

function changeState(e, state) {
  console.log(
    "STATE",
    e.aiState,
    "->",
    state
  );


  e.aiState = state;
  e.stateTimer = 0;
  e.tx = null;
  e.ty = null;
}

function updateNeeds(e, dt) {
  if (
    e.hunger !== undefined &&
    e.aiState !== 'sleep' &&
    e.aiState !== 'play'
  ) {
    e.hunger -= dt * gs.hungerEffect;
  }

  if (e.hunger < 0) {
    e.hunger = 0;
    endGame('deathHunger');
  }
}

function updateTransitions(e) {

  if (
    e.aiState === 'wander' &&
    e.hunger < gs.hungerLimit
  ) {
    changeState(e, 'eat');
    return;
  }

  if (
    e.aiState === 'wander' &&
    gs.currentDayStage === 'night' &&
    !e.slept &&
    e.hunger >= gs.hungerLimit
  ) {
    changeState(e, 'sleep');
    return;
  }

  if (
    e.aiState === 'wander' &&
    gs.toybox &&
    gs.toyActive &&
    e.hunger >= gs.hungerLimit
  ) {
    changeState(e, 'play');
    return;
  }
}

function updateDailyFlags(e) {
  if (
    gs.currentDayStage === 'morning' &&
    e.slept
  ) {
    e.slept = false;
  }
}

function updateCashDrop(e, dt) {
  if (e.type !== 'blob') return;
  if (!gs.cashDropping) return;

  gs.cashDropCooldown -= dt;

  if (gs.cashDropCooldown > 0) {
    return;
  }

  gs.cashDropCooldown =
    gs.moneyBagCd;

  spawnMoneyBag(e);
}

function spawnMoneyBag(e) {
  const bag = gs.objects.find(o => o.type === 'moneyBag') || null;
  if (bag?.active) return;
  bag.x = e.x;
  bag.y = e.y;
  bag.visible = true;
  bag.active = true;
}

/* =========================
   MAIN FUNCTION
========================= */

export function updateAI(e, dt) {
  if (!e?.ai) return;

  e.stateTimer ??= 0;
  e.stateTimer += dt;

  updateNeeds(e, dt);
  
  if (e.type === 'blob') {
    updateCashDrop(e, dt);
  }

  updateTransitions(e);
  
  updateDailyFlags(e);
  
  if (e.idleTimer > 0) {
    e.idleTimer -= dt;

    if (e.idleTimer > 0) {
      return;
    }

    e.idleTimer = 0;
  }
  
  if (
    e.aiState !== 'wander' &&
    e.stateTimer >
    CONFIG.MAX_STATE_TIME
  ) {
    console.log(
    "MAX STATE",
    e.aiState,
    e.stateTimer
  );
    changeState(e, 'wander');
    return;
  }

  switch (e.aiState) {

    case 'eat':
      eat(e, dt);
      break;

    case 'poop':
      poop(e, dt);
      break;

    case 'sleep':
      sleep(e, dt);
      break;

    case 'play':
      play(e, dt);
      break;

    default:
      wander(e, dt);
      break;
  }
}

/* =========================
   EAT
========================= */

function eat(e, dt) {
  const bowl = gs.objects.find(o => o.type === 'bowl');

  if (!bowl) return;
  if (e.type !== 'blob') return;

  if (e.tx == null || e.ty == null) {
    e.tx = bowl.x + bowl.width / 2 - e.size / 2;
    e.ty = bowl.y + bowl.height / 2 - e.size / 2;
  }

  moveToTarget(e, dt, false);

  const dx = e.x - e.tx;
  const dy = e.y - e.ty;

  if (dx * dx + dy * dy > CONFIG.MIN_DIST) {
    return;
  }

  handleEat(e);
}

function handleEat(e) {
  if (gs.otoYemek && !gs.bowlFood) {
    gs.bowlFood = 'blob_food';
  }

  if (!gs.bowlFood) return;

  const effect = EAT_EFFECTS[gs.bowlFood] ?? 0;

  e.hunger = effect;

  if (!gs.otoYemek) {
    gs.bowlFood = null;
  } else if (gs.bowlFood !== 'blob_food') {
    gs.bowlFood = 'blob_food';
  }

  changeState(e, 'poop');
}

/* =========================
   POOP
========================= */

function poop(e, dt) {
  const toilet = gs.objects.find(o => o.type === 'toilet');

  if (!toilet) {
    changeState(e, 'wander');
    return;
  }

  if (e.tx == null || e.ty == null) {
    e.tx = toilet.x + toilet.width / 2 - e.size / 2;
    e.ty = toilet.y + toilet.height / 2 - e.size / 2;
  }

  moveToTarget(e, dt, false);

  const dx = e.x - e.tx;
  const dy = e.y - e.ty;

  if (dx * dx + dy * dy > CONFIG.MIN_DIST) {
    return;
  }

  handlePoop(e);
}

function handlePoop(e) {
  if (gs.otoGubre) {
    gs.toiletFull = false;
    gs.cash += gs.poopIncome;
  }

  if (!gs.toiletFull) {
    applyPoopEffects(e);
    return;
  }

  e.poopWaiting = true;
  changeState(e, 'wander');

  if (gs.poops >= 3) {
    endGame('deathPoop');
  }
}

function applyPoopEffects(e, original = true) {
  if (!gs.otoGubre) {

    if (original) {
      gs.toiletFull = true;
    }

    const poop = new GameObject({
      type: 'poop',
      sprite: 'poop',
      x: e.x,
      y: e.y,
      width: gs.itemSize,
      height: gs.itemSize,
      collidable: false,
      active: true,
      visible: true,
      stage: original ? 3 : 5,
      original
    });

    gs.objects.push(poop);
    gs.poops++;
  }

  gs.poopCooldown = gs.maxPoopCd;

  changeState(e, 'wander');
}

/* =========================
   SLEEP
========================= */

function sleep(e, dt) {
  const bed = gs.objects.find(o => o.type === 'bed');

  if (!bed) {
    changeState(e, 'wander');
    return;
  }
  
  if (
    gs.currentDayStage !== 'night'
  ) {
    e.sleepTimer = null;
    e.slept = true;
    changeState(e, 'wander');
    return;
  }

  if (e.tx == null || e.ty == null) {
    e.tx = bed.x + bed.width / 2 - e.size / 2;
    e.ty = bed.y + bed.height / 2 - e.size / 2;
  }

  moveToTarget(e, dt, false);

  const dx = e.x - e.tx;
  const dy = e.y - e.ty;

  if (dx * dx + dy * dy > CONFIG.MIN_DIST) {
    return;
  }

  e.sleepTimer ??= gs.blobSleepingTime;

  e.sleepTimer -= dt;

  if (e.sleepTimer > 0) {
    return;
  }

  e.sleepTimer = null;
  e.slept = true;

  if (gs.newBed) {
    gs.cash += gs.bedIncome;
  }

  changeState(e, 'wander');
}

/* =========================
   PLAY
========================= */

function play(e, dt) {
  const toybox = gs.objects.find(o => o.type === 'toybox');

  if (!toybox || !gs.toyActive) {
    changeState(e, 'wander');
    return;
  }

  if (e.tx == null || e.ty == null) {
    e.tx = toybox.x + toybox.width / 2 - e.size / 2;
    e.ty = toybox.y + toybox.height / 2 - e.size / 2;
  }

  moveToTarget(e, dt, false);

  const dx = e.x - e.tx;
  const dy = e.y - e.ty;

  if (dx * dx + dy * dy > CONFIG.MIN_DIST) {
    return;
  }

  e.playTimer ??= gs.blobPlayingTime;

  e.playTimer -= dt;

  if (e.playTimer > 0) {
    return;
  }

  e.playTimer = null;

  if (gs.currentToy === 'bone') {
    gs.happiness += gs.toyMenu.boneHappiness;
  }

  gs.toyActive = false;
  gs.currentToy = null;

  changeState(e, 'wander');
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

  const dx = e.tx - e.x;
  const dy = e.ty - e.y;

  const dist = Math.hypot(dx, dy);

  const speed =
    e.speed * dt * (e.speedMulti ?? 1);
  
  if (dist <= speed) {
    
    e.x = e.tx;
    e.y = e.ty;

    e.tx = null;
    e.ty = null;

    handleReachedTarget(e);

    return;
  }

  const nx =
    e.x + (dx / dist) * speed;

  const ny =
    e.y + (dy / dist) * speed;

  moveSafe(e, nx, ny, gs);
}

function handleReachedTarget(e) {
  console.log(
    "REACHED",
    performance.now()
  );
  
  if (e.poopWaiting) {
    gs.happiness -= 10;
    e.poopWaiting = false;
    applyPoopEffects(
      e,
      false
    );
  }

  e.idleTimer = gs.blobWaitingTime;
}

function chooseWanderTarget(
  e,
  minX,
  maxX,
  minY,
  maxY
) {
  console.log('New Target')
  const r = Math.random();
  
  if (r < gs.targetPlayerChance) {
    choosePlayerTarget(
      e,
      minX,
      maxX,
      minY,
      maxY
    );
    return;
  }
  
  if (
    r <
    gs.targetPlayerChance +
    gs.fleeChance
  ) {
    chooseFleeTarget(
      e,
      minX,
      maxX,
      minY,
      maxY
    );
    return;
  }
  
  chooseRandomTarget(
    e,
    minX,
    maxX,
    minY,
    maxY
  );
}

function choosePlayerTarget(
  e,
  minX,
  maxX,
  minY,
  maxY
) {
  gs.happiness += 1;

  const offsetX =
    (Math.random() - 0.5) * 80;

  const offsetY =
    (Math.random() - 0.5) * 80;

  e.tx = Math.floor(
    gs.player.x + offsetX
  );

  e.ty = Math.floor(
    gs.player.y + offsetY
  );

  e.tx = Math.max(
    minX,
    Math.min(maxX, e.tx)
  );

  e.ty = Math.max(
    minY,
    Math.min(maxY, e.ty)
  );

  if (
    collides(
      e.tx,
      e.ty,
      e.size,
      gs
    )
  ) {
    chooseRandomTarget(
      e,
      minX,
      maxX,
      minY,
      maxY
    );
  }
  console.log("TARGET =", e.tx, e.ty);
}

function chooseFleeTarget(
  e,
  minX,
  maxX,
  minY,
  maxY
) {
  gs.happiness -= 1;

  let bestX = e.x;
  let bestY = e.y;
  let bestDist = -1;

  for (let i = 0; i < 20; i++) {

    const x = Math.floor(
      minX +
      Math.random() *
      (maxX - minX)
    );

    const y = Math.floor(
      minY +
      Math.random() *
      (maxY - minY)
    );

    if (
      collides(
        x,
        y,
        e.size,
        gs
      )
    ) {
      continue;
    }

    const dx =
      x - gs.player.x;

    const dy =
      y - gs.player.y;

    const dist =
      dx * dx + dy * dy;

    if (dist > bestDist) {
      bestDist = dist;
      bestX = x;
      bestY = y;
    }
  }

  e.tx = bestX;
  e.ty = bestY;
  console.log("TARGET =", e.tx, e.ty);
}

function chooseRandomTarget(
  e,
  minX,
  maxX,
  minY,
  maxY
) {
  let tries = 0;

  do {

    e.tx = Math.floor(
      minX +
      Math.random() *
      (maxX - minX)
    );

    e.ty = Math.floor(
      minY +
      Math.random() *
      (maxY - minY)
    );

    tries++;

  } while (
    collides(
      e.tx,
      e.ty,
      e.size,
      gs
    ) &&
    tries < 20
  );
  console.log("TARGET =", e.tx, e.ty);
}

/* =========================
   MOVEMENT
========================= */

function moveToTarget(
  e,
  dt,
  applySlowness = true
) {
  if (
    e.tx == null ||
    e.ty == null
  ) {
    return;
  }

  const dx = e.tx - e.x;
  const dy = e.ty - e.y;

  const dist = Math.hypot(
    dx,
    dy
  );

  if (dist < 1) {
    e.x = e.tx;
    e.y = e.ty;
    return;
  }

  let speed =
    e.speed ??
    CONFIG.B_SPEED;

  if (applySlowness) {
    speed /= gs.slowness;
  }

  const step = speed * dt;

  e.x +=
    (dx / dist) *
    Math.min(step, dist);

  e.y +=
    (dy / dist) *
    Math.min(step, dist);
}

function moveSafe(
  e,
  nx,
  ny,
  world = gs
) {
  e.x = nx;
  e.y = ny;

  

  for (const obj of world.objects) {

    if (!obj.collidable) {
      continue;
    }

    if (
      aabb(
        e.x,
        e.y,
        e.size,
        e.size,
        obj.x,
        obj.y,
        obj.width,
        obj.height
      )
    ) {

      const left =
        obj.x - e.size;

      const right =
        obj.x + obj.width;

      const top =
        obj.y - e.size;

      const bottom =
        obj.y + obj.height;

      const dxLeft =
        Math.abs(
          e.x - left
        );

      const dxRight =
        Math.abs(
          e.x - right
        );

      const dyTop =
        Math.abs(
          e.y - top
        );

      const dyBottom =
        Math.abs(
          e.y - bottom
        );

      const min = Math.min(
        dxLeft,
        dxRight,
        dyTop,
        dyBottom
      );

      if (min === dxLeft) {
        e.x = left;
      }
      else if (min === dxRight) {
        e.x = right;
      }
      else if (min === dyTop) {
        e.y = top;
      }
      else {
        e.y = bottom;
      }

      e.tx = null;
      e.ty = null;

      return;
    }
  }
}
import { GameObject, gs } from '../core/state.js';
import { CONFIG } from '../core/config.js';
import { eBtn, qBtn, openTrendweb, openPosta, openGardenMenu } from '../ui.js';
import { plantSeed, pickPlant } from './plants.js';
import { currentMusic, pauseMusic, resumeMusic } from '../utils/soundManager.js';
import { takeFurnaceFood, addItemToFurnace, putFoodIntoBowl, RECIPES } from './food.js';
import { getCollision } from '../utils/collision.js';
import { t } from '../core/localization.js';
import { addTimeout } from './timeout.js';

// =========================
// AKSİYON FONKSİYONLARI (AYNEN DURUYOR)
// =========================

// 1. PC aksiyonu
function handlePC() {
  setTimeout(() => openTrendweb(), CONFIG.INPUT_LOCK);
}

// 2. Tuvalet aksiyonu
function handlePoop(obj) {
  gs.nearCooldown = 1;
  obj.stage--;
  
  if (obj.stage <= 0) {
    if (obj.original) {
      gs.toiletFull = false;
      gs.poops--;
    }
    removeObject(obj)
  }
}

function removeObject(obj) {
  const index = gs.objects.indexOf(obj);

  if (index !== -1) {
    gs.objects.splice(index, 1);
  }
}

// 3. Para çantası aksiyonu
function handleMoneyBag(obj) {
  obj.visible = false;
  obj.active = false;
  gs.cash += gs.cashIncrease * 5n;
}

// 4. Bahçe kapısı aksiyonu
function handleBahceKapisi() {
  if (gs.currentRoom === 'house') {
    gs.currentRoom = 'garden';
    gs.player.x = gs.gardenEnterX;
    gs.player.y = gs.gardenEnterY;
  } else {
    gs.currentRoom = 'house';
    gs.player.x = gs.rooms[gs.currentRoom].width / 2 - gs.player.size / 2;
    gs.player.y = gs.rooms[gs.currentRoom].height / 2 - gs.player.size / 2;
  }
}

// 5. Posta aksiyonu
function handlePosta() {
  gs.showPostaMenu = true;
  openPosta();
}

// 6. Parsel aksiyonu
function handleParsel(obj) {
  gs.currentPlot = obj;

  if (!obj.plant) {
    setTimeout(() => openGardenMenu(obj), CONFIG.INPUT_LOCK);
    return;
  }

  if (obj.ready) {
    pickPlant(obj);
  }
}

function handleGarajKapisi() {
  if (gs.currentRoom === 'house') {
    gs.currentRoom = 'garage';
    gs.player.x = gs.garageEnterX;
    gs.player.y = gs.garageEnterY;
  } else {
    gs.currentRoom = 'house';
    gs.player.x = gs.rooms[gs.currentRoom].width / 2 - gs.player.size / 2;
    gs.player.y = gs.rooms[gs.currentRoom].height / 2 - gs.player.size / 2;
  }
}

function handleIncomeTable() {
  gs.cash += gs.companyCash;
  gs.companyCash = 0n;
  gs.lastRenderedTableIncome = 0n;
}

function handleHoparlor() {
  if (gs.speakerOn) {
    pauseMusic()
  } else if (!gs.speakerOn) {
    resumeMusic()
  }
  gs.speakerOn = !gs.speakerOn;
}

function handleToybox() {
  if (!gs.toyBuyable) return;
  if (gs.cash < BigInt(gs.toyMenu.bonePrice)) return;
  gs.currentToy = 'bone';
  gs.toyActive = true;
  gs.toyBuyable = false;
  gs.cash -= BigInt(gs.toyMenu.bonePrice);
  gs.toyMenu.bonePrice = gs.cashIncrease * 20n;
  addTimeout('toyTimer','buyBone', gs.toyCd)
}

function dropHandItem() {
  gs.objects.push(
    new GameObject({
      type: 'item', item: gs.handItem,

      x: gs.player.x - Math.floor(gs.player.size / 2), y: gs.player.y + Math.floor(gs.player.size / 3),
      width: gs.itemSize, height: gs.itemSize,

      room: gs.currentRoom
    })
  );

  gs.handItem = null;
}

function handleItem(obj) {
  if (gs.handItem) return;

  gs.handItem = obj.item;

  removeObject(obj);
}

function handleFurnace() {
  if (
    gs.furnaceFinish &&
    !gs.handItem
  ) {
    takeFurnaceFood()
  } else if (
    !gs.furnaceFinish &&
    gs.handItem
  ) {
    addItemToFurnace()
  }
}

function handleBowl() {
  if (!gs.handItem) return;
  if (gs.bowlFood === gs.handItem) return;
  
  const foodPlaceable =
    gs.handItem === 'blob_food' ||
    RECIPES.some(recipe => recipe.result === gs.handItem);
    
  if (!foodPlaceable) return;
  putFoodIntoBowl();
}

function handleTrashCan() {
  gs.handItem = null;
}

// =========================
// KONFİGÜRASYON
// =========================
const OBJECT_CONFIGS = {
  pc: {
    distance: 10,
    action: handlePC,
    translateName: 'computer',
    required: { visible: true, active: true }
  },
  bowl: {
    distance: 5,
    action: handleBowl,
    translateName: 'bowl',
    required: { visible: true, active: true }
  },
  moneyBag: {
    distance: 10,
    action: handleMoneyBag,
    translateName: 'moneyBag',
    required: { visible: true, active: true },
    specialCondition: () => gs.cashDropping
  },
  poop: {
    distance: 5,
    action: handlePoop,
    translateName: 'poop',
    required: { visible: true, active: true },
  },
  hoparlor: {
    distance: 5,
    action: handleHoparlor,
    translateName: 'hoparlor',
    required: { visible: true, active: true },
    specialCondition: () => gs.speakerOn !== null
  },
  bahceKapisi: {
    distance: 5,
    action: handleBahceKapisi,
    translateName: 'gardenDoor',
    required: { visible: true, active: true },
    specialCondition: () => gs.bahceAcik
  },
  posta: {
    distance: 10,
    action: handlePosta,
    translateName: 'mailBox',
    required: { visible: true, active: true },
    specialCondition: () => gs.postaKutusu
  },
  parsel: {
    distance: 0,
    action: handleParsel,
    translateName: 'plot',
    required: { visible: true, active: true },
    specialCondition: () => gs.farmsOpen
  },
  garajKapisi: {
    distance: 5,
    action: handleGarajKapisi,
    translateName: 'garageDoor',
    required: { visible: true, active: true },
    specialCondition: () => gs.garageOpen
  },
  incomeTable: {
    distance: 10,
    action: handleIncomeTable,
    translateName: 'incomeTable',
    required: { visible: true, active: true },
    specialCondition: () => gs.tableIncome
  },
  toybox: {
    distance: 0,
    action: handleToybox,
    translateName: 'toybox',
    required: { visible: true, active: true },
    specialCondition: () => gs.toybox
  },
  item: {
    distance: 0,
    action: handleItem,
    translateName: 'item',
    required: {
      visible: true,
      active: true
    }
  },
  furnace: {
    distance: 2,
    action: handleFurnace,
    translateName: 'furnace',
    required: { visible: true, active: true },
  },
  trashCan: {
    distance: 2,
    action: handleTrashCan,
    translateName: 'trashCan',
    required: { visible: true, active: true },
  },
};

// =========================
// YARDIMCI FONKSİYONLAR
// =========================

function isObjectNear(obj, player) {
  if (gs.currentRoom !== obj.room) return false;
  
  if (
    obj.type === 'item' &&
    gs.handItem
  ) {
    return false;
  }
  
  const config = OBJECT_CONFIGS[obj.type];
  if (!config) return false;
  
  // Tuvalet için visible/active kontrolleri yapılmıyor
  if (obj.type !== 'toilet') {
    if (obj.visible !== config.required.visible) return false;
    if (obj.active !== config.required.active) return false;
  }
  
  if (config.specialCondition && !config.specialCondition()) return false;
  
  return isNear(obj, player, config.distance);
}

function findNearObjects(player) {
  const nearby = [];

  for (const obj of gs.objects) {
    if (isObjectNear(obj, player)) {
      nearby.push(obj);
    }
  }

  return nearby;
}

// =========================
// ANA FONKSİYON
// =========================

export function checkNear(dt) {
  const p = gs.player;
  if (!eBtn) return;
  
  gs.interactionTargets = buildInteractionTargets();
  
  const oldTarget = gs.selectedTarget;

  let oldIndex = -1;
  
  gs.interactionTargets = buildInteractionTargets();

  if (
    gs.selectedTarget &&
    !gs.interactionTargets.some(t =>
      t.type === 'object' &&
      t.object === gs.selectedTarget.object
    )
  ) {
    gs.selectedTarget = null;
    gs.selectedTargetIndex = 0;
  }

  if (oldTarget) {
    oldIndex =
      gs.interactionTargets.findIndex(t => {
        if (
          t.type === 'drop' &&
          oldTarget.type === 'drop'
        ) {
          return true;
        }
        if (
          t.type === 'object' &&
          oldTarget.type === 'object'
        ) {
          return t.object === oldTarget.object;
        }
        return false;
      });
  }
  
  if (oldIndex !== -1) {
    gs.selectedTargetIndex = oldIndex;
  } else {
    gs.selectedTargetIndex = 0;
  }
  
  if (
    gs.selectedTargetIndex >=
    gs.interactionTargets.length
  ) {
    gs.selectedTargetIndex = 0;
  }

  gs.selectedTarget =
    gs.interactionTargets[
      gs.selectedTargetIndex
    ] || null;
    
  const hasObjectTarget =
    gs.interactionTargets.some(
      t => t.type === 'object'
    );

  if (
    gs.handItem &&
    hasObjectTarget &&
    !gs.autoInteractionTriggered
  ) {
    const objectIndex =
      gs.interactionTargets.findIndex(
        t => t.type === 'object'
      );

    if (objectIndex !== -1) {
      gs.selectedTargetIndex = objectIndex;

      gs.selectedTarget =
        gs.interactionTargets[
          objectIndex
        ];
    }

    gs.autoInteractionTriggered = true;
  }

  if (!hasObjectTarget) {
    gs.autoInteractionTriggered = false;
  }

  const near =
    gs.selectedTarget !== null;
    
  const canDrop =
    gs.handItem &&
    canDropItem();
    
  const placingItem =
    gs.selectedTarget?.type === 'drop';
  
  if (gs.nearCooldown > 0) {
    gs.nearCooldown -= dt;
    if (gs.nearCooldown < 0) gs.nearCooldown = 0;
  }

  eBtn.classList.toggle(
    'enabled',
    near || canDrop
  );

  eBtn.classList.toggle(
    'disabled',
    !(near || canDrop)
  );
  
  eBtn.classList.toggle(
    'cooldown',
    gs.nearCooldown > 0
  );
  
  eBtn.classList.toggle(
    'placing-item',
    placingItem
  );
  
  qBtn.classList.toggle(
    'enabled',
    gs.interactionTargets.length > 1
  );

  qBtn.classList.toggle(
    'disabled',
    gs.interactionTargets.length <= 1
  );
  
  updateInteractionGuide();
  
  // TOYBOX ÖZEL DURUMU: E tuşuna gerek yok, direkt çalıştır
  if (
    gs.selectedTarget?.type === 'object' &&
    gs.selectedTarget.object.type === 'toybox'
  ) gs.showToyMenu = true;
  else gs.showToyMenu = false;
  
  if (
    gs.selectedTarget?.type === 'object' &&
    gs.selectedTarget.object.type === 'trashCan'
  ) gs.trashCanOpen = true;
  else gs.trashCanOpen = false;
  
  if (
    gs.keys.qPressed &&
    gs.interactionTargets.length > 1
  ) {
    gs.keys.qPressed = false;

    gs.selectedTargetIndex++;

    if (
      gs.selectedTargetIndex >=
      gs.interactionTargets.length
    ) {
      gs.selectedTargetIndex = 0;
    }
      
    gs.selectedTarget =
      gs.interactionTargets[
        gs.selectedTargetIndex
      ] || null;
  }
  
  if (gs.keys.ePressed && gs.nearCooldown <= 0) {
    gs.keys.ePressed = false;

    if (!gs.selectedTarget) return;

    if (gs.selectedTarget.type === 'drop') {
      dropHandItem();
      return;
    }

    if (gs.selectedTarget.type === 'object') {
      const obj = gs.selectedTarget.object;

      const config =
        OBJECT_CONFIGS[obj.type];

      if (config?.action) {
        config.action(obj);
      }
    }
  }
}

function isNear(obj, player, range = 30) {
  const dx = Math.max(
    obj.x - (player.x + player.size),
    player.x - (obj.x + obj.width)
  );
  const dy = Math.max(
    obj.y - (player.y + player.size),
    player.y - (obj.y + obj.height)
  );
  return Math.max(dx, dy) <= range;
}

function canDropItem() {
  const dropX =
    gs.player.x - Math.floor(gs.player.size / 2);

  const dropY =
    gs.player.y + Math.floor(gs.player.size / 3);


  // Aynı yerde item varsa bırakamaz
  for (const obj of gs.objects) {
    if (obj.room !== gs.currentRoom) continue;
    if (obj.type !== 'item') continue;

    const dx = Math.abs(obj.x - dropX);
    const dy = Math.abs(obj.y - dropY);

    if (dx === 0 && dy === 0) {
      return false;
    }
  }


  // Collidable objenin içine item bırakamaz
  const collision = getCollision(
    dropX,
    dropY,
    gs.itemSize
  );

  if (collision) {
    return false;
  }


  return true;
}

function buildInteractionTargets() {
  const targets = [];

  for (const obj of findNearObjects(gs.player)) {
    targets.push({
      type: 'object',
      object: obj
    });
  }

  if (
    gs.handItem &&
    canDropItem()
  ) {
    targets.push({
      type: 'drop'
    });
  }

  return targets;
}

// ====================

function updateInteractionGuide() {
  gs.interactionGuide.e = null;
  gs.interactionGuide.q = null;

  const target = gs.selectedTarget;

  if (target?.type === 'object') {
    const config = OBJECT_CONFIGS[target.object.type];

    if (config?.translateName) {
      gs.interactionGuide.e =
        `[E] ${t('interactionObjects.' + config.translateName)} ${t('interaction.use')}`;
    }
  } else if (target?.type === 'drop') {
    gs.interactionGuide.e =
      `[E] ${t('interactionObjects.drop')} ${t('interaction.use')}`;
  }

  if (gs.interactionTargets.length > 1) {
    gs.interactionGuide.q =
      `[Q] ${t('interaction.next')}`;
  }
}


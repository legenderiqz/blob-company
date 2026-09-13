import { gs, GameObject } from '../core/state.js';
import { upgrades } from '../data/upgradeData.js';
import { playMusic } from '../utils/soundManager.js';

const SAVE_KEY = 'blob-company-save';

const IGNORE_KEYS = [
  // FPS / debug
  'ctx',
  'fps',
  'frames',
  'lastFpsUpdate',
  'dtMs',

  // Kamera ve giriş
  'camera',
  'keys',
  'inputLock',

  // Geçici UI
  'news',
  'activePost',
  'showPostaMenu',
  'menuOpen',
  'aiState',

  // Geçici oyun durumu
  'lastBlobClick',
  'lastRenderedCash',
  'lastRenderedCompanyCash',
  'activePlots',

  // Runtime
  'lastPostIndex'
];

function replacer(key, value) {
  if (typeof value === 'bigint') {
    return {
      __bigint: value.toString()
    };
  }

  return value;
}

function reviver(key, value) {
  if (
    value &&
    typeof value === 'object' &&
    value.__bigint !== undefined
  ) {
    return BigInt(value.__bigint);
  }

  return value;
}

function getSaveData() {
  const save = {};

  for (const key in gs) {
    if (IGNORE_KEYS.includes(key)) continue;

    save[key] = gs[key];
  }

  save.upgrades = upgrades.map(upg => ({
    id: upg.id,
    purchased: upg.purchased
  }));

  return save;
}

export function saveGame() {
  if (gs.resetting) return false;

  try {
    const data = getSaveData();

    localStorage.setItem(
      SAVE_KEY,
      JSON.stringify(data, replacer)
    );

    return true;
  } catch (err) {
    console.error('Save failed:', err);
    return false;
  }
}


export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);

    if (!raw) return false;

    const save = JSON.parse(raw, reviver);
    if (save.upgrades) {
      for (const savedUpgrade of save.upgrades) {
        const upgrade = upgrades.find(
          u => u.id === savedUpgrade.id
        );

        if (upgrade) {
          upgrade.purchased = savedUpgrade.purchased;
        }
      }
    }
    
    for (const key in save) {
      if (key === 'upgrades') continue;
      const value = save[key];
      
      if (key === 'objects') {
        gs.objects = save.objects.map(obj => {
          return new GameObject(obj);
        });
        continue;
      }

      if (
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        gs[key]
      ) {
        Object.assign(gs[key], value);
      } else {
        gs[key] = value;
      }
    }
    
    gs.activePlots = gs.objects.filter(
      o => o.type === 'parsel' &&
         o.plant &&
         !o.ready
    );
    
    return true;
  } catch (err) {
    console.error('Load failed:', err);
    return false;
  }
}


export function deleteSave() {
  localStorage.removeItem(SAVE_KEY);
}
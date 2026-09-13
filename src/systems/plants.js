import { gs } from '../core/state.js';
import { plantData } from '../data/plantData.js';

export function plantSeed(obj, plantId) {
  if (obj.plant || obj.cooldown > 0) return;
  
  const plant = plantData[plantId];
  if (!plant) return;
  
  obj.plant = plantId;
  obj.cooldown = plant.growTime;

  gs.activePlots.push(obj);
}

export function updatePlants(dt) {
  if (!gs.activePlots.length) return;
  for (let p of gs.activePlots) {
    p.cooldown -= dt;
    if (p.cooldown <= 0) {
      p.cooldown = 0;
      p.ready = true;
    }
  }
}

export function pickPlant(obj) {
  if (!obj.ready) return;

  gs.handItem = obj.plant;
  obj.plant = null;
  obj.cooldown = 0;
  obj.ready = false;

  const index = gs.activePlots.indexOf(obj);

  if (index !== -1) {
    gs.activePlots.splice(index, 1);
  }
}

function getPlantReward(obj) {
  const plant = plantData[obj.plant];

  if (!plant) return;

  const reward = plant.reward;

  switch (reward.type) {
    case 'cash':
      gs.cash += reward.amount * gs.cashIncrease;
      break;
  }
}
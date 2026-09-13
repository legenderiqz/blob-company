import { plants } from '../data/gardenData.js';
import { gs } from './state.js';
import { playSound } from '../utils/soundManager.js';
import { saveGame } from '../systems/save.js';
import { plantSeed } from '../systems/plants.js';

export function buyPlant(id) {
  const plant =
    plants.find(u => u.id === id);
  
  if (!plant) return;
  if (gs.cash < plant.price) return;
  
  gs.cash -=  plant.price;
  
  purchase(plant.plantId);
}

function purchase(plantId) {
  plantSeed(gs.currentPlot, plantId)
  saveGame();
  playSound('purchase');
}
import { actions, addTimeout } from './timeout.js';
import { gs } from '../core/state.js'

export const RECIPES = [
  {
    items: ['apple','orange','wheat'],
    result: 'cake',
    duration: 5
  },
  {
    items: ['apple','orange','corn'],
    result: 'juice',
    duration: 3
  }
];

export const EAT_EFFECTS = {
  blob_food: 100,
  cake: 120,
  juice: 120,
}

export function addItemToFurnace() {
  gs.furnaceItems.push(gs.handItem);
  gs.handItem = null;
  if (gs.furnaceItems.length === 3) {
    startCooking()
  }
}

export function takeFurnaceFood() {
  gs.handItem = gs.furnaceFood;
  gs.furnaceFood = null;
  gs.furnaceFinish = false;
}

export function putFoodIntoBowl() {
  gs.bowlFood = gs.handItem;
  gs.handItem = null;
  gs.eatEffect = EAT_EFFECTS[gs.bowlFood];
}

export function startCooking() {
  gs.furnaceCooking = true;
  
  actions.cookFood = () => {
    const recipe = getRecipe(gs.furnaceItems);
    if (recipe) gs.furnaceFood = recipe.result;
    else gs.furnaceFood = 'coal';
    gs.furnaceFinish = true;
    gs.furnaceItems = [];
    gs.furnaceCooking = false;
  };
  
  addTimeout('waitCook', 'cookFood', RECIPES[0].duration);    
}

function getRecipe(items) {
  if (!items || items.length !== 3) return;
  
  const sorted = [...items].sort();

  const result = RECIPES.find(recipe =>
    recipe.items.slice().sort().every(
      (item, i) => item === sorted[i]
    )
  );
  
  return result;
}
// TEHLİKELİ BÖLGE

import { gs, createInitialGS } from '../core/state.js';
import { stopAllSounds } from './soundManager.js';
import { deleteSave } from '../systems/save.js';

export function resetGame() {
  gs.resetting = true;
  
  stopAllSounds();
  deleteSave()
  location.reload();
}

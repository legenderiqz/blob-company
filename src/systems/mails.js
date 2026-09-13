import { gs } from '../core/state.js';
import { showNews } from './news.js';

let postaPool = [];

export function refillPool() {
  postaPool = [...gs.postalar.keys()];
  
  for (let i = postaPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [postaPool[i], postaPool[j]] = [postaPool[j], postaPool[i]];
  }
}

export function updatePosta() {
  if (!gs.postaKutusu) return;
  if (gs.postalar.length === 0) return;

  if (postaPool.length === 0) {
    refillPool();
  }

  const index = postaPool.pop();

  gs.lastPostIndex = index;
  gs.activePost = gs.postalar[index];

  showNews('mailCame');
}

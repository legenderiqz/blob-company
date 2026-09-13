import { gs } from '../core/state.js';
import { saveGame } from './save.js';

export const actions = {
  buyBone() {
    gs.toyBuyable = true;
  },
  
  autoSave() {
    saveGame();
  },
}

export function addTimeout(name, callback, duration) {
  gs.timeouts[name] = {
    remaining: duration,
    callback
  };
}

export function updateTimeouts(dt) {
  for (const name in gs.timeouts) {
    const timeout = gs.timeouts[name];

    timeout.remaining -= dt;
    
    if (timeout.remaining <= 0) {
      actions[timeout.callback]();
      delete gs.timeouts[name];
    }
  }
}

export function addInterval(name, callback, duration) {
  gs.intervals[name] = {
    remaining: duration,
    duration,
    callback
  };
}

export function updateIntervals(dt) {
  for (const name in gs.intervals) {
    const interval = gs.intervals[name];

    interval.remaining -= dt;

    if (interval.remaining <= 0) {
      actions[interval.callback]();

      interval.remaining += interval.duration;
    }
  }
}
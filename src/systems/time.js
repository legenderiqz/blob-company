import { gs } from '../core/state.js';
import { updatePosta } from './mails.js';
import { showNews } from './news.js';
import { t } from '../core/localization.js';

export function updateTime(dt) {
  gs.time += dt;
  
  if (gs.time >= gs.dayCD) {
    if (gs.currentDayStage === 'morning') {
      gs.currentDayStage = 'night';
      gs.time = 0;
    } else {
      gs.currentDayStage = 'morning';
      gs.time = 0;
      
      updateDay();
      updateRoommate();
      updatePosta();
      updateSeason();
      updateYear();
    }
  }
}

function updateDay() {
  gs.day++;
  
  const s = gs.season;
  const rand = Math.random();
  
  if (s === 'summer' && rand < 0.5) {
    gs.happinessEvent = 'big_up';
  } 
  if (s === 'spring' && rand < 0.2) {
    gs.happinessEvent = 'small_up'
  }
  if (s === 'winter' && rand < 0.5) {
    gs.happinessEvent = 'big_down'
  }
  if (s === 'autumn' && rand < 0.2) {
    gs.happinessEvent = 'small_down'
  }

}

function updateSeason() {
  const dayInYear = (gs.day - 1) % 36;
  
  if (dayInYear < 9) gs.season = 'spring';
  else if (dayInYear < 18) gs.season = 'summer';
  else if (dayInYear < 27) gs.season = 'autumn';
  else gs.season = 'winter';
}

function updateYear() {
  if ((gs.day - 1) % 36 === 0) {
    gs.year++;
    if (gs.year !== 1) birthday();
  }
}

function birthday() {
  gs.cash += gs.cashIncrease * 20n;
  showNews('birthday', gs.cashIncrease * 20n, 'mediumpurple');
}

function updateRoommate() {
  if (!gs.roommate) return;
  const incr = gs.cashIncrease * gs.roommateMulti;
  gs.cash += incr;    
  showNews('rentReceived', incr);
}
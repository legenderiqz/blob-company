import { gs } from '../core/state.js';
import { CONFIG } from '../core/config.js';
import { t } from '../core/localization.js';

export function showNews(text, vars = '', color = 'white') {
  const newsText = t(text);
  gs.news.push({
    text: newsText + String(vars),
    y: -80,
    timer: 0,
    phase: 'in',
    active: true,
    color: color
  });
}

export function updateNews(dt) {
  const targetY = gs.newsTargetY - 80; // biraz daha yukarı

  for (let i = gs.news.length - 1; i >= 0; i--) {
    const n = gs.news[i];

    // hedef konumu sıra numarasına göre belirle
    const slotY = targetY + i * 25;

    if (n.phase === 'in') {
      n.y += 600 * dt;

      if (n.y >= slotY) {
        n.y = slotY;
        n.phase = 'hold';
        n.timer = CONFIG.NEWS_TIME;
      }
    }

    else if (n.phase === 'hold') {
      n.y += (slotY - n.y) * 10 * dt;

      n.timer -= dt;
      if (n.timer <= 0) {
        n.phase = 'out';
      }
    }

    else if (n.phase === 'out') {
      n.y -= 600 * dt;

      if (n.y < -100) {
        gs.news.splice(i, 1);
      }
    }
  }
}

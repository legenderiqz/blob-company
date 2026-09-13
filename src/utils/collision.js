import { gs } from '../core/state.js';

export function getCollision(x, y, size, world = gs) {
  for (const obj of world.objects) {
    if (!obj.collidable) continue;
    if (obj.active === false) continue;
    if (obj.room !== world.currentRoom) continue;
    
    if (
      aabb(
        x, y, size, size,
        obj.x, obj.y, obj.width, obj.height
      )
    ) {
      return obj;
    }
  }
  return null;
}

export function collides(x, y, size, world = gs) {
  return getCollision(x, y, size, world) !== null;
}

export function resolvePushOut(e, obj) {
  const overlapLeft = (e.x + e.size) - obj.x;
  const overlapRight = (obj.x + obj.width) - e.x;
  const overlapTop = (e.y + e.size) - obj.y;
  const overlapBottom = (obj.y + obj.height) - e.y;
  
  const min = Math.min(
    overlapLeft,
    overlapRight,
    overlapTop,
    overlapBottom
  );
  
  if (min === overlapLeft) {
    e.x -= overlapLeft + 0.1;
  }
  else if (min === overlapRight) {
    e.x += overlapRight + 0.1;
  }
  else if (min === overlapTop) {
    e.y -= overlapTop + 0.1;
  }
  else {
    e.y += overlapBottom + 0.1;
  }
  
  e._resolved = true;
}

export function aabb(ex, ey, ew, eh, ox, oy, ow, oh) {
  return (
    ex < ox + ow &&
    ex + ew > ox &&
    ey < oy + oh &&
    ey + eh > oy
  )
}
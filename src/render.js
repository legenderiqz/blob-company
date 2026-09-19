
import { getGameDiv, getCanvas } from './core/dom.js';
import { gs, createInitialGS } from './core/state.js';
import { CONFIG } from './core/config.js';
import { getImage } from './utils/imageManager.js';
import { t } from './core/localization.js';
import { formatCash } from './utils/formatCash.js';

let canvas;

export function initRendering(ctx) {
  canvas = getCanvas();

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
 
  resize();
  window.addEventListener('resize', resize);

  ctx.imageSmoothingEnabled = false;
}

export function render(ctx) {
  clear(ctx);
  
  drawWorld(ctx);
  
  drawTable(ctx);
  
  drawNightOverlay(ctx);
  
  drawSelectedObject(ctx);
  
  drawEntities(ctx);
  
  drawDebug(ctx);
  
  drawUI(ctx);
}

function drawEntities(ctx) {
  drawDoze(ctx);
  drawStain(ctx);
  drawPlayer(ctx);
  drawBlob(ctx);
}

function clear(ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawWorld(ctx) {
  const room = gs.rooms[gs.currentRoom];
  const floor = getImage(room.image);

  ctx.drawImage(
    floor,
    -gs.camera.x,
    -gs.camera.y,
    room.width,
    room.height
  );
  
  // OBJECTS
  const drawStrategies = {
    bowl: drawBowl,
    toilet: drawToilet,
    poop: drawPoop,
    carpet: drawCarpet,
    bed: drawBed,
    chair: drawChair,
    toybox: drawToybox,
    item: drawItem,
    furnace: drawFurnace,
    trashCan: drawTrashCan,
    clock: (ctx, obj) => {
      if (gs.clockActive) drawClock(ctx, obj);
      else {
        const img = getImage(obj.sprite);
        if (img?.complete) {
          ctx.drawImage(img, obj.x - gs.camera.x, obj.y - gs.camera.y, obj.width, obj.height);
        }
      }
    },
    parsel: drawPlots,
  };

  for (const obj of gs.objects) {
    if (gs.currentRoom !== obj.room) continue;
    if (!obj.visible && obj.visible !== undefined) continue;

    const strategy = drawStrategies[obj.type];
    if (strategy) {
      strategy(ctx, obj);
      continue;
    }

    // Default draw
    const img = getImage(obj.sprite);
    if (img?.complete) {
      ctx.drawImage(img, obj.x - gs.camera.x, obj.y - gs.camera.y, obj.width, obj.height);
    }
  }
}

function drawItem(ctx, obj) {
  const img = getImage(obj.item);

  if (img?.complete) {
    ctx.drawImage(
      img,
      obj.x - gs.camera.x,
      obj.y - gs.camera.y,
      obj.width,
      obj.height
    );
  }
}

function drawBowl(ctx, obj) {
  let img;
  
  if (gs.otoYemek) {
    img = getImage('bowl2');
  } else {
    !gs.bowlFood ? img = getImage('bowl0') : img = getImage('bowl1');
  }
  
  ctx.drawImage(
    img,
    obj.x - gs.camera.x,
    obj.y - gs.camera.y,
    obj.width,
    obj.height
  );
  
  if (!gs.bowlFood || gs.bowlFood === 'blob_food') return;
  let sprite = getImage(gs.bowlFood)
  ctx.drawImage(
    sprite,
    obj.x + gs.itemSize / 8 - gs.camera.x,
    obj.y - 6 - gs.camera.y,
    gs.itemSize,
    gs.itemSize
  );
}

function drawToilet(ctx, obj) {
  let img;
  if (gs.otoGubre) {
    img = getImage('toilet2');
  } else {
    img = getImage('toilet');
  }
  
  
  ctx.drawImage(
    img,
    obj.x - gs.camera.x,
    obj.y - gs.camera.y,
    obj.width,
    obj.height
  );
}

function drawPoop(ctx, obj) {
  let img = getImage(`poop_${obj.stage}`);
  
  ctx.drawImage(
    img,
    obj.x - gs.camera.x,
    obj.y - gs.camera.y,
    obj.width,
    obj.height
  );
}

function drawCarpet(ctx, obj) {
  let img;
  if (!gs.newCarpet) {
    img = getImage('carpet1');
  } else {
    img = getImage('carpet2');
  }
  ctx.drawImage(
    img,
    obj.x - gs.camera.x,
    obj.y - gs.camera.y,
    obj.width,
    obj.height
  );
}

function drawBed(ctx, obj) {
  let img;
  if (!gs.newBed) {
    img = getImage('bed1');
  } else {
    img = getImage('bed2');
  }
  ctx.drawImage(
    img,
    obj.x - gs.camera.x,
    obj.y - gs.camera.y,
    obj.width,
    obj.height
  );
}

function drawChair(ctx, obj) {
  let img;
  if (!gs.roommate) {
    img = getImage('chair');
  } else {
    img = getImage('chairRoommate');
  }
  ctx.drawImage(
    img,
    obj.x - gs.camera.x,
    obj.y - gs.camera.y,
    obj.width,
    obj.height
  );
}

function drawFurnace(ctx, obj) {
  // 1. Fırını çiz
  let img;
  if (!gs.furnaceCooking) {
    img = getImage('furnace');
  } else {
    img = getImage('furnaceCooking');
  }
  ctx.drawImage(
    img,
    obj.x - gs.camera.x,
    obj.y - gs.camera.y,
    obj.width,
    obj.height
  );
  
  // 2. Fırındaki item'ları çiz (yukarıdan aşağıya)
  if (gs.furnaceItems.length > 0 && !gs.furnaceCooking) {
    const itemCount = gs.furnaceItems.length;
    const spacing = obj.height / (itemCount + 1); // Eşit aralık
    
    gs.furnaceItems.forEach((item, index) => {
      const itemImg = getImage(item);
      const size = gs.itemSize * 0.8;
      
      // Y pozisyonu yukarıdan aşağıya doğru sıralı
      const yPos = obj.y - gs.camera.y + (spacing * (index + 1)) - size/2;
      const xPos = obj.x - gs.camera.x + (obj.width/2) - size/2;
      
      ctx.drawImage(
        itemImg,
        xPos,
        yPos,
        size,
        size
      );
    });
  }
  
  // 3. Pişen yemeği çiz
  if (gs.furnaceFood && gs.furnaceFinish) {
    const foodImg = getImage(gs.furnaceFood);
    const size = gs.itemSize * 1.5;
    
    const xPos = obj.x - gs.camera.x + (obj.width/2) - size/2;
    const yPos = obj.y - gs.camera.y + (obj.height/2) - size/2;
    
    ctx.drawImage(
      foodImg,
      xPos,
      yPos,
      size,
      size
    );
  }
  // 4. Fırın pişerken efekt çiz
  if (gs.furnaceCooking) {
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.arc(
      obj.x - gs.camera.x + obj.width/2,
      obj.y - gs.camera.y + obj.height/2,
      gs.itemSize,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = 'gold';
    ctx.fill();
    ctx.restore();
  }
}

function drawTrashCan(ctx, obj) {
  let img;
  if (gs.trashCanOpen) {
    img = getImage('trashCan_open');
  } else {
    img = getImage('trashCan_closed');
  }
  ctx.drawImage(
    img,
    obj.x - gs.camera.x,
    obj.y - gs.camera.y,
    obj.width,
    obj.height
  );
}

function drawClock(ctx, obj) {
  ctx.save();

  const x = obj.x - gs.camera.x;
  const y = obj.y - gs.camera.y;
  const w = obj.width;
  const h = obj.height;

  // dış çerçeve
  ctx.fillStyle = '#222';
  ctx.fillRect(x, y, w, h);

  // iç ekran
  ctx.fillStyle =
    gs.currentDayStage === 'morning'
      ? '#9de7ff'
      : '#16304d';

  ctx.fillRect(x + 3, y + 3, w - 6, h - 6);

  // küçük durum ışığı
  ctx.fillStyle =
    gs.currentDayStage === 'morning'
      ? '#ffdd44'
      : '#ddddff';

  ctx.beginPath();
  ctx.arc(x + 21, y + h / 2, 14, 0, Math.PI * 2);
  ctx.fill();

  const digits = String(gs.day).length;
  const fontSize = Math.max(
    10,
    17 - (digits - 1)
  );

  ctx.font = `bold ${fontSize}px sans-serif, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle =
    gs.currentDayStage === 'morning'
      ? '#000'
      : '#fff';
  
  let seasonEmoji;
  switch (gs.season) {
    case 'spring':
      seasonEmoji = '🌺'
      break;
    case 'summer':
      seasonEmoji = '🌊'
      break;
    case 'autumn':
      seasonEmoji = '🍁'
      break;
    case 'winter':
      seasonEmoji = '☃️'
      break;
  }
  
  ctx.fillText(
    seasonEmoji,
    x + w / 2 - 24,
    y + h / 2
  );
  
  ctx.fillText(
    t('day'),
    x + w / 2 + 18,
    y + h / 2 - 8
  );
  ctx.fillText(
    `${gs.day}`,
    x + w / 2 + 18,
    y + h / 2 + 8
  );

  ctx.restore();
}

function drawToybox(ctx, obj) {
  if (!gs.toybox) return;
  let img;
  
  img = getImage('toybox');
  ctx.drawImage(
    img,
    obj.x - gs.camera.x,
    obj.y - gs.camera.y,
    obj.width,
    obj.height
  );
  
  let sprite;
  if (gs.currentToy === null) return;
  else if (gs.currentToy === 'ball') {
    sprite = 'ball'
  } else if (gs.currentToy === 'bone') {
    sprite = 'bone'
  }
  
  img = getImage(sprite);
  ctx.drawImage(
    img,
    obj.x - gs.camera.x,
    obj.y - gs.camera.y,
    obj.width,
    obj.height
  );
}

function drawToyMenu(ctx) {
  if (!gs.showToyMenu) return;
  let x = gs.toyMenu.x - gs.camera.x;
  let y = gs.toyMenu.y - gs.camera.y;
  let w = gs.toyMenu.width;
  let h = gs.toyMenu.height;
  let fontSize = 16;
  
  ctx.save();
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(
    x,
    y,
    w,
    h
  )
  
  ctx.fillStyle = 'green';
  ctx.font = `bold ${fontSize}px sans-serif, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  ctx.fillText(
    `${t('purchaseBone')}: $${gs.toyMenu.bonePrice}`,
    x + w/2,
    y + fontSize / 1.2,
  )
  
  ctx.font = `bold ${Math.floor(fontSize / 1.4)}px sans-serif, monospace`;
  let timeLeft = Math.floor(gs.timeouts['toyTimer']?.remaining || 0);
  
  ctx.fillText(
    `${gs.toyBuyable ? t('toyAvailable') : timeLeft + t('toyUnavailable')} - ${t('toyDescription')}`,
    x + w/2,
    y + fontSize * 1.8,
  )
  
  ctx.restore();
}

function drawPlayer(ctx) {
  const p = gs.player;
  const img = getImage(p.sprite);

  if (!(img instanceof HTMLImageElement)) return;
  if (!img.complete) return;

  const offsetX = (p.size - img.width) / 2;
  const offsetY = (p.size - img.height) / 2;

  ctx.drawImage(
    img,
    Math.floor(p.x - gs.camera.x + offsetX),
    Math.floor(p.y - gs.camera.y + offsetY),
    p.size,
    p.size
  );
  drawHandItem(ctx)
}

function drawHandItem(ctx) {
  if (gs.handItem === null) return;
  const p = gs.player;
  let img = getImage(gs.handItem);
  ctx.drawImage(
    img,
    p.x - Math.floor(p.size / 2) - gs.camera.x,
    p.y + Math.floor(p.size / 3) - gs.camera.y,
    gs.itemSize,
    gs.itemSize
  );
}

function drawStain(ctx) {
  // Stain unlock edilmemiş veya aktif değilse çizme
  if (!gs.stainUnlocked || !gs.stain.active) return;
  
  const s = gs.stain;
  const img = getImage(s.sprite);

  if (!(img instanceof HTMLImageElement)) return;
  if (!img.complete) return;
  if (gs.currentRoom !== s.room) return;

  const scaleX = s.size / img.width;
  const scaleY = s.size / img.height;

  const drawWidth = img.width * scaleX;
  const drawHeight = img.height * scaleY;

  const offsetX = (s.size - drawWidth) / 2;
  const offsetY = (s.size - drawHeight) / 2;

  ctx.drawImage(
    img,
    s.x - gs.camera.x + offsetX,
    s.y - gs.camera.y + offsetY,
    drawWidth,
    drawHeight
  );
}

function drawDoze(ctx) {
  // Stain unlock edilmemiş veya aktif değilse çizme
  if (!gs.dozeUnlocked || !gs.doze.active) return;
  
  const d = gs.doze;
  const img = getImage(d.sprite);

  if (!(img instanceof HTMLImageElement)) return;
  if (!img.complete) return;
  if (gs.currentRoom !== d.room) return;

  const scaleX = d.size / img.width;
  const scaleY = d.size / img.height;

  const drawWidth = img.width * scaleX;
  const drawHeight = img.height * scaleY;

  const offsetX = (d.size - drawWidth) / 2;
  const offsetY = (d.size - drawHeight) / 2;

  ctx.drawImage(
    img,
    d.x - gs.camera.x + offsetX,
    d.y - gs.camera.y + offsetY,
    drawWidth,
    drawHeight
  );
}

function drawBlob(ctx) {
  const b = gs.blob;
  selectBlobImage();
  const img = getImage(gs.blob.sprite);
  
  if (!(img instanceof HTMLImageElement)) return;
  if (!img.complete) return;
  if (gs.currentRoom !== b.room) return;

  const scaleX = b.size / img.width;
  const scaleY = b.size / img.height;

  const drawWidth = img.width * scaleX;
  const drawHeight = img.height * scaleY;

  const offsetX = (b.size - drawWidth) / 2;
  const offsetY = (b.size - drawHeight) / 2;
  
  let xPos = b.x - gs.camera.x + offsetX;
  let yPos = b.y - gs.camera.y + offsetY;
  
  ctx.drawImage(
    img,
    xPos,
    yPos,
    drawWidth,
    drawHeight
  );
  
  drawBlobText(ctx, b, xPos, yPos);
}

function selectBlobImage() {
  const h = gs.happiness;

  if (h > 90) {
    gs.blob.sprite = 'blob_playful';
  } else if (h > 60) {
    gs.blob.sprite = 'blob_happy';
  } else if (h >= 40) {
    gs.blob.sprite = 'blob';
  } else if (h >= 15) {
    gs.blob.sprite = 'blob_sad';
  } else {
    gs.blob.sprite = 'blob_angry';
  }
}

export function drawBlobText(ctx, b, x, y) {
  let fontSize = b.size * 0.5;
  let textX = x + b.size / 2;
  let textY = y - (b.size / 2) + 16;
  let text = `🍖${Math.floor(b.hunger)}`;
  
  ctx.save();
  
  ctx.font = `bold ${fontSize}px sans-serif, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.lineWidth = 3;
  
  ctx.strokeStyle = 'black';
  ctx.strokeText(
    text,
    textX,
    textY
  )
  
  ctx.fillStyle = getHungerColor(b.hunger);
  ctx.fillText(
    text,
    textX,
    textY
  );
  
  ctx.restore();
}

// Hunger değerine göre renk döndüren fonksiyon
function getHungerColor(hunger) {
  // Renkleri canvas için hex kodlarıyla tanımlayalım
  let HC = CONFIG.HUNGER_COLORS;

  if (hunger >= 100) return HC.HIGH;
  if (hunger < 25) return HC.CRITICAL;
  if (hunger < 50) return HC.LOW;
  return HC.NORMAL;
}

function drawDebug(ctx) {
  if (!gs.debug) return;

  ctx.strokeStyle = 'red';

  for (const obj of gs.objects) {
    if (!obj.visible && obj.visible !== undefined) continue;
    if (obj.room !== gs.currentRoom) continue;
    
    ctx.strokeRect(
      obj.x - gs.camera.x,
      obj.y - gs.camera.y,
      obj.width,
      obj.height
    );
  }

  const p = gs.player;
  ctx.strokeRect(
    p.x - gs.camera.x,
    p.y - gs.camera.y,
    p.size,
    p.size
  );

  const b = gs.blob;
  if (b.room === gs.currentRoom) {
    ctx.strokeRect(
      b.x - gs.camera.x,
      b.y - gs.camera.y,
      b.size,
      b.size
    );
  }
  
  // Stain debug çizimi
  if (gs.stainUnlocked &&
    gs.stain.active &&
    gs.stain.room === gs.currentRoom
  ) {
    const s = gs.stain;
    ctx.strokeStyle = 'red';  // Farklı renk olsun
    
    ctx.strokeRect(
      s.x - gs.camera.x,
      s.y - gs.camera.y,
      s.size,
      s.size
    );
  }

  // Doze debug çizimi
  if (gs.dozeUnlocked &&
    gs.doze.active &&
    gs.doze.room === gs.currentRoom
  ) {
    const d = gs.doze;
    ctx.strokeStyle = 'red';  // Farklı renk olsun
    
    ctx.strokeRect(
      d.x - gs.camera.x,
      d.y - gs.camera.y,
      d.size,
      d.size
    );
  }
}

function drawSelectedObject(ctx) {
  let selected = null;

  if (
    gs.selectedTarget &&
    gs.selectedTarget.type === 'object'
  ) {
    selected = gs.selectedTarget.object;
  }

  if (!selected) return;

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;

  ctx.strokeRect(
    Math.floor(selected.x - gs.camera.x) + 0.5,
    Math.floor(selected.y - gs.camera.y) + 0.5,
    selected.width,
    selected.height
  );
}

function drawUI(ctx) {
  if (gs.debug) {
    ctx.fillStyle = 'white';
    ctx.font = '16px monospace';
    ctx.fillText(`FPS: ${gs.fps}`, 10, 20);
    ctx.fillText(`BLOB: ${gs.blob.aiState}`, 10, 40);
    ctx.fillText(`HAPPY: ${Math.floor(gs.happiness)}`, 10, 60);
  }
  drawToyMenu(ctx);
  drawNews(ctx);
  drawInteractionGuide(ctx);
}

export function drawInteractionGuide(ctx) {
  const guide = gs.interactionGuide;

  const lines = [];

  if (guide.e) {
    lines.push(guide.e);
  }

  if (guide.q) {
    lines.push(guide.q);
  }

  if (lines.length === 0) return;
  ctx.save()
  ctx.fillStyle = 'white';
  ctx.font = '12px monospace';
  ctx.textAlign = 'right';

  const x = canvas.width - 10;
  let y = canvas.height - 32;

  for (const line of lines) {
    ctx.fillText(line, x, y);
    y += 16;
  }
  ctx.restore();
}

export function drawNews(ctx) {
  ctx.save();

  ctx.font = `bold ${gs.newsFontSize}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (const n of gs.news) {
    const x = canvas.width / 2;

    ctx.lineWidth = 4;
    ctx.strokeStyle = 'black';
    ctx.strokeText(n.text, x, n.y);

    ctx.fillStyle = n.color;
    ctx.fillText(n.text, x, n.y);
  }

  ctx.restore();
}

function drawPlots(ctx, obj) {
    let sprite;

    if (!obj.plant) {
      sprite = 'bosParsel';
    } else {
      sprite = `${obj.plant}_${obj.ready}`;
    }

    const img = getImage(sprite);

    if (!img?.complete) return;

    ctx.drawImage(
      img,
      obj.x - gs.camera.x,
      obj.y - gs.camera.y,
      obj.width,
      obj.height
    );
}

function drawTable(ctx) {
  if (gs.incomeCd <= 0 ||
    gs.currentRoom !== 'garage' ||
    !gs.tableIncome
  ) return;
  
  const fontSize = 23;
  let textX = 150 - gs.camera.x;
  let textY = 60 - gs.camera.y;
  gs.lastRenderedCompanyCash = gs.companyCash;
  
  let text = `${formatCash(gs.lastRenderedCompanyCash)}`;
  
  ctx.save();
  
  ctx.font = `bold ${fontSize}px sans-serif, monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.lineWidth = 3;
  
  ctx.strokeStyle = 'black';
  ctx.strokeText(
    text,
    textX,
    textY
  )
  
  ctx.fillStyle = '#36D348';
  ctx.fillText(
    text,
    textX,
    textY
  );
  
  ctx.restore();
}

function drawNightOverlay(ctx) {
  if (gs.currentDayStage !== 'night') return;

  ctx.save();

  ctx.fillStyle = `rgba(0, 0, 40, ${gs.nightDarkness})`;
  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.restore();
}
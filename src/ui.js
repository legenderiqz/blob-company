import { gs } from './core/state.js';
import { buttonInteractions, keyInteractions } from './input.js';
import { formatCash } from './utils/formatCash.js';
import { upgrades } from './data/upgradeData.js';
import { buyUpgrade } from './core/upgradeEngine.js';
import { plants } from './data/gardenData.js';
import { t } from './core/localization.js';
import { getGameDiv, getUiRoot} from './core/dom.js';
import { resetGame } from './utils/resetGame.js';
import { buyPlant } from './core/gardenEngine.js';
import { CONFIG } from './core/config.js';

// DİKKAT: UPDATE.JSDEN VERİ ÇEKME!
// butonlarda data-sound="click" şeklinde ses ver

let uiRoot;
let gameDiv;
let trendwebOverlay;
let postaOverlay
let postaMainDiv;
let gardenOverlay;
let gardenMainDiv;
let cashSpan;
export let eBtn;
export let qBtn;
let controlsDiv;
let hideBtn;
let controlsHidden = false;

export function initUI() {
  gameDiv = getGameDiv();
  uiRoot = document.createElement('div');
  
  uiRoot.id = 'ui';
  
  uiRoot.innerHTML = getUiRoot();
    
  gameDiv.appendChild(uiRoot);
  
  const upBtn = document.getElementById('up');
  const downBtn = document.getElementById('down');
  const leftBtn = document.getElementById('left');
  const rightBtn = document.getElementById('right');
  eBtn = document.getElementById('e');
  qBtn = document.getElementById('q');
  
  buttonInteractions(upBtn,downBtn,leftBtn,rightBtn,eBtn,qBtn);
  keyInteractions();
  
  trendwebOverlay = setupOverlay(
    'trendweb-overlay',
    'trendweb-close',
    closeTrendweb
  );

  postaOverlay = setupOverlay(
    'posta-overlay',
    'posta-close',
    closePosta
  );
  
  gardenOverlay = setupOverlay(
    'garden-overlay',
    'garden-close',
    closeGardenMenu
  );
  
  cashSpan = document.getElementById('cashSpan');
  
  controlsDiv = document.getElementById('controls');
  hideBtn = document.getElementById('hide');

  hideBtn.onclick = toggleControls;
  
  const postaContent = document.getElementById('posta-content')
  postaMainDiv = postaContent;
  renderPosta(postaMainDiv);
  
  const gardenContent = document.getElementById('garden-content')
  gardenMainDiv = gardenContent;
  renderGarden(gardenMainDiv);
}

export function initTrendweb() {
  const trendwebContent = document.getElementById('trendweb-content')
  renderTrendweb(trendwebContent);
}

function toggleControls() {
  controlsHidden = !controlsHidden;

  if (controlsHidden) {
    controlsDiv.classList.add('hidden');
  } else {
    controlsDiv.classList.remove('hidden');
  }
}

// openTrendweb fonksiyonunu düzenle:
export function openTrendweb() {
  if (gs.menuOpen) return;

  gs.menuOpen = true;
  trendwebOverlay.classList.add('active');
  setEButtonEnabled(false)
}

// closeTrendweb fonksiyonunu düzenle:
export function closeTrendweb() {
  gs.menuOpen = false;
  trendwebOverlay.classList.remove('active');
  
  setEButtonEnabled(true)
}

export function renderTrendweb(mainDiv) {
  mainDiv.innerHTML = '';

  for (const upgrade of upgrades) {
    
    let disabled = gs.purchasedUpgrades.includes(upgrade.id);
    
    const card = document.createElement('div');
    card.className = 'upgrade-card';
    
    const buttonHTML = disabled
      ? `<button class='upgrade-buy' disabled>${t('upgOwned')}</button>`
      : `<button class='upgrade-buy'>$${formatCash(upgrade.price)}</button>`;

    card.innerHTML = `
      <img class='upgrade-image' src='${upgrade.image}'>
      <div class="upgrade-info">
        <span class="upgrade-requirement">${upgrade.require ?? ''}</span>
      </div>
      <h3>${upgrade.title}</h3>
      <p>${upgrade.description}</p>
      ${buttonHTML}
    `;
    
    const btn = card.querySelector('.upgrade-buy');
    
    if (!disabled) {
      btn.onclick = () => {
        if (
          upgrade.id === 'yemek' &&
          !gs.handItem
        ) closeTrendweb();
        
        buyUpgrade(upgrade.id, btn);
      }
    }
    
    mainDiv.appendChild(card);
  }
}

export function updateCashUI() {
  if (gs.cash === gs.lastRenderedCash) return;

  gs.lastRenderedCash = gs.cash;

  cashSpan.textContent = formatCash(gs.cash);
}

export function endGame(reason) {
  if (!CONFIG.GOD_MODE) {
    resetGame();
    alert(t(reason));
  }
}

export function renderPosta(mainDiv) {
  mainDiv.innerHTML = '';
  
  if (!gs.activePost) {
    mainDiv.innerHTML = `<p>${t('noMails')}</p>`;
    return;
  }

  const card = document.createElement('div');
  card.className = 'posta-card';
  
    
  card.innerHTML = `
  <p>${t(gs.activePost.text)}</p>
  ${gs.activePost.hasImage ? `<img src="${gs.activePost.image}" alt="Post Image">` : ""}
  `;
    
    
  mainDiv.appendChild(card);
}


export function openPosta() {
  if (!gs.showPostaMenu) return;

  postaOverlay.classList.add('active');
  // E butonunu geçici olarak devre dışı bırak
  setEButtonEnabled(false)
  renderPosta(postaMainDiv);
}

export function closePosta() {
  gs.showPostaMenu = false;
  postaOverlay.classList.remove('active');
  
  setEButtonEnabled(true)
}

function setEButtonEnabled(enabled) {
  if (!eBtn) return;

  eBtn.disabled = !enabled;
  eBtn.style.pointerEvents = enabled
    ? 'auto'
    : 'none';
}

function setQButtonEnabled(enabled) {
  if (!qBtn) return;

  qBtn.disabled = !enabled;
  qBtn.style.pointerEvents = enabled
    ? 'auto'
    : 'none';
}

export function openGardenMenu() {
  if (gs.gardenMenuOpen) return;
  
  gs.gardenMenuOpen = true;
  gardenOverlay.classList.add('active');
  setEButtonEnabled(false)
}

// closeTrendweb fonksiyonunu düzenle:
export function closeGardenMenu() {
  gs.gardenMenuOpen = false;
  gardenOverlay.classList.remove('active');
  
  setEButtonEnabled(true)
}

export function renderGarden(mainDiv) {
  mainDiv.innerHTML = '';
  
  for (const plant of plants) {
    
    const card = document.createElement('div');
    card.className = 'plant-card';
    
    const buttonHTML =
      `<button class='plant-buy'>$${formatCash(plant.price)}</button>`;
    
    card.innerHTML = `
      <img class='plant-image' src='${plant.image}'>
      <div class="plant-info">
        <span class="plant-requirement">${plant.require ?? ''}</span>
      </div>
      <h3>${plant.title}</h3>
      <p>${plant.description}</p>
      ${buttonHTML}
    `;
    
    const btn = card.querySelector('.plant-buy');
    
    btn.onclick = () => {
      buyPlant(plant.id);
      closeGardenMenu()
    }
    
    mainDiv.appendChild(card);
  }
}

function setupOverlay(overlayId, closeId, closeFn) {
  const overlay = document.getElementById(overlayId);

  document.getElementById(closeId).onclick =
    closeFn;

  return overlay;
}

export function applyEPosChange() {
  const eBtn = document.getElementById('e');
  eBtn.classList.toggle('e-right', gs.ePosRight);
  eBtn.classList.toggle('e-left', !gs.ePosRight);
}

export function applyQPosChange() {
  const qBtn = document.getElementById('q');
  qBtn.classList.toggle('q-right', gs.qPosRight);
  qBtn.classList.toggle('q-left', !gs.qPosRight);
}
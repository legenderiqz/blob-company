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
import { saveGame } from './systems/save.js';
import { notifyTutorialAction } from './systems/tutorial.js';

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
let tutorialOverlay;
let tutorialHud;
let tutorialTitle;
let tutorialBody;
let tutorialNext;
let tutorialHudProgress;
let tutorialHudTitle;
let tutorialHudBody;
let tutorialHudSkip;
let tutorialHudDone;
let tutorialStep = 0;
let tutorialGuided = false;
let tutorialAdvancing = false;
let tutorialAdvanceTimeout;
const TUTORIAL_VERSION = 2;

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

  tutorialOverlay = document.getElementById('tutorial-overlay');
  tutorialTitle = document.getElementById('tutorial-title');
  tutorialBody = document.getElementById('tutorial-body');
  tutorialNext = document.getElementById('tutorial-next');
  tutorialHud = document.getElementById('tutorial-hud');
  tutorialHudProgress = document.getElementById('tutorial-hud-progress');
  tutorialHudTitle = document.getElementById('tutorial-hud-title');
  tutorialHudBody = document.getElementById('tutorial-hud-body');
  tutorialHudSkip = document.getElementById('tutorial-guided-skip');
  tutorialHudDone = document.getElementById('tutorial-guided-done');
  const tutorialSkip = document.getElementById('tutorial-skip');
  tutorialTitle.textContent = t('tutorial.intro.title');
  tutorialBody.textContent = t('tutorial.intro.body');
  tutorialNext.textContent = t('tutorial.next');
  tutorialNext.onclick = continueTutorial;
  tutorialSkip.textContent = t('tutorial.skip');
  tutorialSkip.onclick = finishTutorial;
  tutorialHudSkip.textContent = t('tutorial.skip');
  tutorialHudSkip.onclick = finishTutorial;
  tutorialHudDone.textContent = t('tutorial.finish');
  tutorialHudDone.onclick = finishTutorial;
  window.addEventListener('game-tutorial-action', (event) => {
    completeTutorialAction(event.detail);
  });
  document.addEventListener('pointermove', handleTutorialPointerMove);
  document.addEventListener('pointerdown', handleTutorialPointerDown);
  
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

export function startTutorial() {
  if (!tutorialOverlay) return;

  gs.tutorialActive = true;
  gs.menuOpen = true;
  tutorialOverlay.classList.add('active');
  tutorialNext.focus();
}

function continueTutorial() {
  gs.tutorialActive = false;
  gs.menuOpen = false;
  tutorialOverlay.classList.remove('active');
  tutorialGuided = true;
  tutorialStep = 0;
  renderTutorialHint();
  tutorialHud.classList.add('active');
}

export function completeTutorialAction(action) {
  if (!tutorialGuided || tutorialAdvancing) return;

  const steps = t('tutorial.steps');
  if (steps[tutorialStep]?.action !== action) return;

  tutorialAdvancing = true;
  tutorialHud.classList.add('completed');
  tutorialHudProgress.textContent = t('tutorial.taskCompleted');
  tutorialHudTitle.textContent = t('tutorial.completedTitle');
  tutorialHudBody.textContent = t('tutorial.completedBody');
  tutorialAdvanceTimeout = setTimeout(advanceTutorial, 1400);
}

function advanceTutorial() {
  tutorialAdvanceTimeout = null;
  tutorialAdvancing = false;
  tutorialHud.classList.remove('completed');
  tutorialStep++;

  if (tutorialStep >= t('tutorial.steps').length) {
    gs.tutorialCompleted = true;
    gs.tutorialVersion = TUTORIAL_VERSION;
    gs.firstTry = false;
    saveGame();
  }

  renderTutorialHint();
}

function renderTutorialHint() {
  const steps = t('tutorial.steps');
  const complete = tutorialStep >= steps.length;
  const content = complete
    ? t('tutorial.complete')
    : steps[tutorialStep];

  tutorialHudProgress.textContent = complete
    ? t('tutorial.completeLabel')
    : `${t('tutorial.step')} ${tutorialStep + 1} ${t('tutorial.of')} ${steps.length}`;
  tutorialHudTitle.textContent = content.title;
  tutorialHudBody.textContent = content.body;
  tutorialHudSkip.hidden = complete;
  tutorialHudDone.hidden = !complete;
}

function finishTutorial() {
  if (tutorialAdvanceTimeout) {
    clearTimeout(tutorialAdvanceTimeout);
    tutorialAdvanceTimeout = null;
  }

  tutorialAdvancing = false;
  tutorialHud?.classList.remove('completed', 'faded');
  tutorialGuided = false;
  gs.tutorialActive = false;
  gs.menuOpen = false;
  gs.firstTry = false;
  gs.tutorialCompleted = true;
  gs.tutorialVersion = TUTORIAL_VERSION;
  tutorialOverlay.classList.remove('active');
  tutorialHud.classList.remove('active');
  saveGame();
}

function isInsideTutorialHud(x, y) {
  const rect = tutorialHud.getBoundingClientRect();
  return x >= rect.left && x <= rect.right &&
    y >= rect.top && y <= rect.bottom;
}

function handleTutorialPointerMove(event) {
  if (!tutorialGuided || event.pointerType === 'touch') return;

  const overButton = event.target instanceof Element &&
    event.target.closest('#tutorial-hud button');
  tutorialHud.classList.toggle(
    'faded',
    isInsideTutorialHud(event.clientX, event.clientY) && !overButton
  );
}

function handleTutorialPointerDown(event) {
  if (!tutorialGuided || event.pointerType !== 'touch') return;

  const overButton = event.target instanceof Element &&
    event.target.closest('#tutorial-hud button');

  if (overButton) return;

  tutorialHud.classList.toggle(
    'faded',
    isInsideTutorialHud(event.clientX, event.clientY)
  );
}

function toggleControls() {
  controlsHidden = !controlsHidden;

  if (controlsHidden) {
    controlsDiv.classList.add('hidden');
  } else {
    controlsDiv.classList.remove('hidden');
  }
}

export function openTrendweb() {
  if (gs.menuOpen) return;

  gs.menuOpen = true;
  trendwebOverlay.classList.add('active');
  notifyTutorialAction('openShop');
  setEButtonEnabled(false)
}

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
  gs.menuOpen = true;
  gardenOverlay.classList.add('active');
  setEButtonEnabled(false)
}

export function closeGardenMenu() {
  gs.gardenMenuOpen = false;
  gs.menuOpen = false;
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
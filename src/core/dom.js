import { t } from './localization.js';

let canvas = null;
let gameDiv = null;

export function initDOM() {
  gameDiv = document.getElementById('gameDiv');
  canvas = document.getElementById('canvas');
}

export function getCanvas() {
  return canvas;
}

export function getGameDiv() {
  return gameDiv;
}

export function getUiRoot() {
  return createTopBarHTML() +
  createControlsHTML() +
  createTrendwebHTML() +
  createPostaHTML() +
  createGardenHTML() +
  createSettingsHTML();
}

function createTopBarHTML() {
  return `
    <div id="topBar">
      <div style="display:flex; align-items:center;">
        <i class="fa-solid fa-dollar-sign"></i><span id="cashSpan">0</span>
      </div>
    </div>
  `;
}

function createControlsHTML() {    
  return `    
    <div id="controls">    
    
      <button id="hide">    
        <i class="fa-solid fa-eye"></i>    
      </button>    
    
      <button id="settings-btn">    
        <i class="fa-solid fa-gear"></i>    
      </button>    
    
      <div class="pad">    
    
        <button id="up" data-sound="null">    
          <i class="fa-solid fa-arrow-up"></i>    
        </button>    
    
        <div class="row">    
          <button id="left" data-sound="null">    
            <i class="fa-solid fa-arrow-left"></i>    
          </button>
          
    
          <button id="e">E</button>    
    
          <button id="right" data-sound="null">    
            <i class="fa-solid fa-arrow-right"></i>    
          </button>    
        </div> 
    
          <button id="down" data-sound="null">    
            <i class="fa-solid fa-arrow-down"></i>    
          </button>    
      </div> 
      
      <button id="q">Q</button> 
    
    </div>    
  `;    
}

// <i class="fa-solid fa-circle-chevron-right"></i>    
// <i class="fa-solid fa-hand-pointer"></i>    

function createTrendwebHTML() {
  return `
    <div id="trendweb-overlay">

      <div id="trendweb-menu">

        <div id="trendweb-header">
          <span>TrendWeb</span>

          <button id="trendweb-close">
            ✕
          </button>
        </div>

        <div id="trendweb-content"></div>

      </div>

    </div>
  `;
}

function createPostaHTML() {
  return `
    <div id="posta-overlay">

      <div id="posta-menu">

        <div id="posta-header">

          <span id="posta-title">
            ${t('postaTitle')}
          </span>

          <button id="posta-close">
            ✕
          </button>

        </div>

        <div id="posta-content"></div>

      </div>

    </div>
  `;
}

function createSettingsHTML() {
  return `
    <div id="settings-overlay">

      <div class="set-menu">

        <div id="set-topbar">

          <p id="set-title"></p>

          <button id="set-close">
            <i class="far fa-times-circle fa-lg" style="color:red;"></i>
          </button>

        </div>

        <div class="set-btns">

          <button id="sfx-toggle"></button>

          <button id="auto-save"></button>

          <button id="lang-btn"></button>

          <button id="debug-toggle"></button>

          <button id="e-pos-toggle"></button>
          
          <button id="q-pos-toggle"></button>

          <button id="fullScreen-toggle"></button>
          
          <hr>

          <button id="set-reset"></button>

        </div>

      </div>

    </div>
  `;
}

function createGardenHTML() {
  return `
    <div id="garden-overlay">

      <div id="garden-menu">

        <div id="garden-header">
          <span>${t('gardenTitle')}</span>

          <button id="garden-close">
            ✕
          </button>
        </div>

        <div id="garden-content"></div>

      </div>

    </div>
  `;
}
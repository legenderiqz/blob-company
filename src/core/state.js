import { CONFIG } from './config.js';
import { postalar } from '../data/mailData.js';
import { getInitialLanguage } from './localization.js';

export class GameObject {
  constructor(options) {
    this.type = options.type;
    this.sprite = options.sprite;
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    
    // Varsayılan değerler (Tanımlanmazsa otomatik atanır)
    this.collidable = options.collidable ?? false;
    this.room = options.room ?? 'house';
    this.visible = options.visible ?? true;
    this.active = options.active ?? true;
    

    // Dinamik veya isteğe bağlı özel alanlar (Renk, ID, Ağaç durumu vb.)
    if (options.color) this.color = options.color;
    if (options.id) this.id = options.id;
    if (options.plant !== undefined) this.plant = options.plant;
    if (options.cooldown !== undefined) this.cooldown = options.cooldown;
    if (options.ready !== undefined) this.ready = options.ready;
    if (options.stage !== undefined) this.stage = options.stage;
    if (options.original !== undefined) this.original = options.original;
    if (options.item !== undefined) this.item = options.item;
  }
}

// --- 1. ALT SİSTEM BAŞLANGIÇ DEĞERLERİ ---
const initialMainAndFps = () => ({
  ctx: null,  
  debug: false,  
  fps: 0,   
  lastFpsUpdate: 0,  
  frames: 0, 
  dtMs: 0,
  paused: false,
  resetting: false,
});

const initialEconomy = () => ({
// FIXME: PROD alırken değiştir
  cash: 0n, 
  cashIncrease: 1n,  
  cashBoost: 0n,
  lastRenderedCash: -1n,  
  poopIncome: 100n,
  companyIncome: 0n,
  companyCash: 0n,
  lastRenderedCompanyCash: 0n,
  maxCompanyCash: 500n,
  roommateMulti: 15n,
});

const initialTimeSystem = () => ({
// FIXME: PROD alırken değiştir
  dayCD: 90, 
  time: 0,
  day: 1,
  currentDayStage: 'morning',
  season: 'spring',
  year: 1,
  firstTry: true,
  nightDarkness: 0.4
});

const initialMechanics = () => ({
  currentLang: getInitialLanguage(),
  
  ePosRight: true,
  qPosRight: true,
  
  purchasedUpgrades: [],
  
  hungerEffect: 2,  // Açlık düşüşü
  idleTimer: 0,  
  
  lastPostIndex: -1,
  showPostaMenu: false,
  
  bowlFood: 'blob_food',
  toiletFull: false,
  handItem: null,
  
  furnaceItems: [],
  furnaceFood: null,
  furnaceFinish: false,
  furnaceCooking: false,
  
  timeouts: {},
  intervals: {},
  
  currentToy: null,
  toyActive: false,
  showToyMenu: false,
  toyBuyable: true,
  toyCd: 30,
  toyMenu: {
    x: 190,
    y: 5,
    width: 180,
    height: 40,
    bonePrice: 600,
    boneHappiness: 12,
  },
  
  gardenEnterX: 922,
  gardenEnterY: 426,
  garageEnterX: 522,
  garageEnterY: 276,
  
  appleIncrease: 10n,
  orangeIncrease: 12n,
  
  newsTargetY: 120,
  newsFontSize: 13,
  
  moneyBagCd: 15, // Maks para bag spawn cd
  cashDropCooldown: 15, // Aktif para cd
  
  maxPoopCd: 20, // Ölene dek dolu tuvalette kalma süresi
  poopCooldown: 20, // Aktif tuvalette kalma süresi
  
  maxEntityHunger: 100, // Yemeğin açlık doyurma miktarı 
  hungerLimit: 50, // Açlık alt limiti
  
  maxIncomeCd: 1,
  incomeCd: 1,
  
  maxAutoTime: 0,
  autoTime: 0,
  
  nearCooldown: 0,
  autoInteractionTriggered: false,
  /*
  nearObjects: [],
  selectedNearIndex: 0,
  selectedNearObject: null,
  */
  
  interactionTargets: [],
  selectedTargetIndex: 0,
  selectedTarget: null,
  
  interactionGuide: {
    e: null,
    q: null
  },
  
  lastClicker: 0,
  
  menuOpen: false,
  gardenMenuOpen: false,
  settingsOpen: false,
  autoSave: true,
  soundEnabled: true,
  
  bedIncome: 10000n,
  
  targetPlayerChance: 0.10,
  fleeChance: 0.12,
  
  happiness: 50,
  happinessEvent: 'neutral',
  happinessGain: 0.5,
  happinessEqualize: 0.02,
  happinessTarget: 50,
  
  itemSize: 24,
  
  trashCanOpen: false,
});

const initialUpgrades = () => ({
  otoGubre: false,
  otoYemek: false,
  clockActive: false,
  bahceAcik: false,
  postaKutusu: false,
  farmsOpen: false,
  newCarpet: false, 
  stainUnlocked: false,
  cashDropping: false,
  garageOpen: false,
  tableIncome: false,
  autoClicker: false,
  speakerOn: null,
  serversOpen: false,
  newBed: false,
  roommate: false,
  toybox: false,
});

export let gs = createInitialGS()

// --- 2. ANA EXPORT FONKSİYONU ---
export function createInitialGS() {  
  return {  
    // Dağıtılmış basit alt sistemleri nesneye yediriyoruz (Spread Operator `...`)
    ...initialMainAndFps(),
    ...initialEconomy(),
    ...initialTimeSystem(),
    ...initialMechanics(),
    ...initialUpgrades(),

    news: [
      {
        text: '',
        fontSize: 14,
        active: false,
        timer: 0,
        y: -100,
        phase: 'idle' 
      }
    ],

    aiRegistry: {  
      wander: true,  
      eat: true,  
      clean: true,  
      idle: true,  
      poop: true,
      sleep: true,
      play: true,
    },  
    
    poops: 0,
    
    safeMargin: 100,
    inputLock: 0, 
    
    // Dünya
    rooms: createRooms(),
    currentRoom: 'house',
    camera: createCamera(),

    // Oyuncu
    player: createPlayer(),
    keys: createKeys(),

    // Canlılar
    blob: createBlob(),
    stain: createStain(),

    // Entity ayarları
    blobWaitingTime: 3,
    blobSleepingTime: 5,
    blobPlayingTime: 5,
    lastBlobClick: 0,

    // Objeler
    objects: createObjects(),
    activePlots: [],
    currentPlot: null,

    // Posta sistemi
    postalar: postalar,
    activePost: null,
  };
}


export function createCamera() {
  return {
    x: null,
    y: null,
    zoom: 1
  }
}

export function createBlob() {
  return {
    // KONUM
    x: null,
    y: null,
    
    // INFO
    speed: CONFIG.B_SPEED,
    speedMulti: 1,
    size: CONFIG.B_SIZE,
    
    // RENDER
    type: 'blob',
    sprite: 'blob',
    room: 'house',
    
    // MOVE
    tx: null,
    ty: null,
    
    //AI
    timer: 0,
    ai: ['wander', 'eat', 'poop', 'sleep', 'play'],
    aiState: 'wander',
    slept: false,
    poopWaiting: false,
    stateTimer: 0,
    
    // STATE
    active: true,
    hunger: 100,
    targetBowl: null,
  }
}

export function createStain() {
  return {
    x: null,
    y: null,
    
    speed: CONFIG.B_SPEED + 60,
    size: CONFIG.B_SIZE,
    
    type: 'stain',
    sprite: 'stain',
    room: 'house',
    
    tx: null,
    ty: null,
    
    timer: 0,
    ai: ['wander'],
    aiState: 'wander',
    
    active: false
  }
}

function createPlayer() {
  return {
    x: null,
    y: null,
    
    speed: CONFIG.P_SPEED,
// FIXME: PROD alırken değiştir
    speedMulti: 1,
    size: CONFIG.P_SIZE,
    
    sprite: 'player'
  }
}

function createKeys() {
  return {
    up: false,
    down: false,
    left: false,
    right: false,
    
    ePressed: false,
    qPressed: false,

    keyboard: {
      w: false,
      s: false,
      a: false,
      d: false,
      e: false,
      q: false
    },

    touch: {
      up: false,
      down: false,
      left: false,
      right: false,
      e: false,
      q: false
    }
  }
}

function createRooms() {
  return {
    house: {
      width: 600,
      height: 600,
      image: 'houseFloor'
    },

    garden: {
      width: 1000,
      height: 900,
      image: 'gardenFloor'
    },

    garage: {
      width: 600,
      height: 600,
      image: 'garageFloor'
    }
  };
}

function createObjects() {
  return [
    new GameObject({ type: 'tv', sprite: 'tv', x: 5, y: 5, width: 180, height: 90, collidable: true,}),
    new GameObject({ type: 'chair', sprite: 'chair', x: 70, y: 95, width: 50, height: 50, collidable: true }),
    new GameObject({ type: 'evCicek', sprite: 'garajCicek', x: 190, y: 5, width: 50, height: 50, collidable: false, visible: false, active: false,}),
    new GameObject({ type: 'pc', sprite: 'pc', x: 495, y: 5, width: 100, height: 100, collidable: true }),
    new GameObject({ type: 'bowl', sprite: 'bowl', x: 550, y: 250, width: 30, height: 30 }),
    new GameObject({ type: 'toilet', sprite: 'toilet', x: 550, y: 320, width: 30, height: 60 }),
    new GameObject({ type: 'bahceKapisi', sprite: 'bahceKapisi', x: 5, y: 570, width: 90, height: 30 }),
    new GameObject({ type: 'garajKapisi', sprite: 'garajKapisi', x: 160, y: 570, width: 90, height: 30 }),
    new GameObject({ type: 'furnace', sprite: 'furnace', x: 5, y: 220, width: 60, height: 80, collidable: true }),
    new GameObject({ type: 'trashCan', sprite: 'trashCan_closed', x: 125, y: 95, width: 50, height: 50, collidable: true }),
    new GameObject({ type: 'newspaper', sprite: 'newspaper', x: 125, y: 420, width: 20, height: 20 }),
    
    new GameObject({ type: 'yarnball', sprite: 'yarnball', x: 540, y: 160, width: 30, height: 30, visible: false, active: false }),
    new GameObject({ type: 'rug', sprite: 'rug', x: 210, y: 350, width: 180, height: 180, visible: false, active: false }),
    new GameObject({ type: 'hoparlor', sprite: 'hoparlor', x: 5, y: 100, width: 60, height: 60, collidable: false, visible: false, active: false }),
    new GameObject({ type: 'toybox', sprite: 'toybox_empty', x: 250, y: 5, width: 50, height: 50, collidable: false, visible: false, active: false }),
    new GameObject({ type: 'carpet', sprite: 'carpet1', x: 170, y: 160, width: 260, height: 180 }),
    new GameObject({ type: 'clock', sprite: 'clock', x: 395, y: 5, width: 90, height: 40, collidable: true }),
    new GameObject({ type: 'bed', sprite: 'bed1', x: 435, y: 495, width: 160, height: 100, collidable: false,}),
    new GameObject({ type: 'moneyBag', sprite: 'moneyBag', x: 0, y: 0, width: 40, height: 40, visible: false, active: false }),
    
    // Garden Odası Objeleri
    new GameObject({ type: 'bahceYol', sprite: 'bahceYol', x: 0, y: 405, width: 970, height: 90, collidable: false, room: 'garden', visible: true, active: true }),
    new GameObject({ type: 'bahceKapisi', sprite: 'evKapisi', x: 970, y: 405, width: 30, height: 90, room: 'garden' }),
    new GameObject({ type: 'tarla1', sprite: 'tarla', x: 320, y: 180, width: 240, height: 180, room: 'garden' }),
    new GameObject({ type: 'tarla2', sprite: 'tarla', x: 320, y: 540, width: 240, height: 180, room: 'garden' }),
    new GameObject({ type: 'tarla3', sprite: 'tarla', x: 620, y: 180, width: 240, height: 180, room: 'garden' }),
    new GameObject({ type: 'tarla4', sprite: 'tarla', x: 620, y: 540, width: 240, height: 180, room: 'garden' }),
    
    new GameObject({ type: 'posta', sprite: 'posta', x: 930, y: 360, width: 30, height: 40, collidable: true, room: 'garden', visible: false, active: false }),
    // Parseller
    new GameObject({ type: 'parsel', id: '1', sprite: 'bosParsel', x: 320, y: 180, width: 240, height: 180, room: 'garden', plant: null, cooldown: 0, ready: false, }),
    new GameObject({ type: 'parsel', id: '2', sprite: 'bosParsel', x: 320, y: 540, width: 240, height: 180, room: 'garden', plant: null, cooldown: 0, ready: false, }),
    new GameObject({ type: 'parsel', id: '3', sprite: 'bosParsel', x: 620, y: 180, width: 240, height: 180, room: 'garden', plant: null, cooldown: 0, ready: false, }),
    new GameObject({ type: 'parsel', id: '4', sprite: 'bosParsel', x: 620, y: 540, width: 240, height: 180, room: 'garden', plant: null, cooldown: 0, ready: false, }),
  
    // Garage odası objeleri
    new GameObject({ type: 'garajYol', sprite: 'garajYol', x: 0, y: 255, width: 570, height: 90, room: 'garage', collidable: false, visible: true, active: true,}),
    new GameObject({ type: 'garajKapisi', sprite: 'evKapisi', x: 570, y: 255, width: 30, height: 90, room: 'garage' }),
    new GameObject({ type: 'incomeTable', sprite: 'incomeTable', x: 50, y: 0, width: 200, height: 100, room: 'garage', collidable: false, visible: false, active: false,}),
    new GameObject({ type: 'garajCicek', sprite: 'garajCicek', x: 530, y: 530, width: 70, height: 70, room: 'garage', collidable: false, visible: false, active: false,}),
    new GameObject({ type: 'cupShelf', sprite: 'cupShelf', x: 10, y: 540, width: 160, height: 60, room: 'garage', collidable: false, visible: false, active: false,}),
    new GameObject({ type: 'tshirtShelf', sprite: 'tshirtShelf', x: 185, y: 540, width: 160, height: 60, room: 'garage', collidable: false, visible: false, active: false,}),
    new GameObject({ type: 'hatShelf', sprite: 'hatShelf', x: 360, y: 540, width: 160, height: 60, room: 'garage', collidable: false, visible: false, active: false,}),
    new GameObject({ type: 'phoneShelf', sprite: 'phoneShelf', x: 10, y: 480, width: 160, height: 60, room: 'garage', collidable: false, visible: false, active: false,}),
    new GameObject({ type: 'car', sprite: 'car', x: 100, y: 240, width: 160, height: 100, room: 'garage', collidable: false, visible: false, active: false,}),
    new GameObject({ type: 'danisman', sprite: 'danisman', x: 530, y: 360, width: 70, height: 160, room: 'garage', collidable: false, visible: false, active: false,}),
    new GameObject({ type: 'server16', sprite: 'server16', x: 540, y: 0, width: 60, height: 60, room: 'garage', collidable: false, visible: false, active: false,}),
    new GameObject({ type: 'server32', sprite: 'server32', x: 480, y: 0, width: 60, height: 60, room: 'garage', collidable: false, visible: false, active: false,}),
    new GameObject({ type: 'server64', sprite: 'server64', x: 420, y: 0, width: 60, height: 60, room: 'garage', collidable: false, visible: false, active: false,}),
  ];
}

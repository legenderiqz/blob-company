const images = {};

export function loadImage(name, src) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      images[name] = img;
      resolve(img);
    };

    img.onerror = () => {
      console.error('LOAD FAIL:', name, src);
      reject();
    };

    img.src = src;
  });
}

export function getImage(name) {
  return images[name];
}

const ASSETS = {
  player: 'player.png',
  blob: 'blob.png',
  blob_happy: 'blob_happy.png',
  blob_sad: 'blob_sad.png',
  blob_angry: 'blob_angry.png',
  blob_playful: 'blob_playful.png',
  tv: 'tv.png',
  chair: 'chair.png',
  chairRoommate: 'chairRoommate.png',
  pc: 'pc.png',
  bowl0: 'bowl_empty.png',
  bowl1: 'bowl_full.png',
  yemek: 'yemek.png',
  yumak: 'yumak.png',
  carpet1: 'carpet1.png',
  carpet2: 'carpet2.png',
  stain: 'stain.png',
  toybox: 'toybox.png',
  ball: 'ball.png',
  bone: 'bone.png',
  hoparlor: 'hoparlor.png',
  toilet: 'toilet_empty.png',
  toilet2: 'toilet_auto.png',
  poop_1: 'poop_1.png',
  poop_2: 'poop_2.png',
  poop_3: 'poop_3.png',
  poop_4: 'poop_4.png',
  poop_5: 'poop_5.png',
  moneyBag: 'moneyBag.png',
  clock: 'clock.png',
  bowl2: 'bowl2.png',
  posta: 'posta.png',
  tarla: 'tarla.png',
  evKapisi: 'evKapisi.png',
  bahceKapisi: 'bahceKapisi.png',
  garajKapisi: 'garajKapisi.png',
  apple: 'apple.png',
  orange: 'orange.png',
  bosParsel: 'tarla.png',
  apple_false: 'apple_false.png',
  apple_true: 'apple_true.png',
  orange_false: 'orange_false.png',
  orange_true: 'orange_true.png',
  wheat_false: 'wheat_false.png',
  wheat_true: 'wheat_true.png',
  corn_false: 'corn_false.png',
  corn_true: 'corn_true.png',
  incomeTable: 'incomeTable.png',
  cupShelf: 'cupShelf.png',
  tshirtShelf: 'tshirtShelf.png',
  phoneShelf: 'phoneShelf.png',
  car: 'car.png',
  hatShelf: 'hatShelf.png',
  bed1: 'bed1.png',
  bed2: 'bed2.png',
  danisman: 'danisman.png',
  bahceYol: 'bahceYol.png',
  garajYol: 'garajYol.png',
  garajCicek: 'garajCicek.png',
  server16: 'server16.png',
  server32: 'server32.png',
  server64: 'server64.png',
  furnace: 'furnace.png',
  wheat: 'wheat.png',
  corn: 'corn.png',
  cake: 'cake.png',
  juice: 'juice.png',
  blob_food: 'blob_food.png',
  coal: 'coal.png',
  furnaceCooking: 'furnaceCooking.png',
  trashCan_open: 'trashCan_open.png',
  trashCan_closed: 'trashCan_closed.png',
  houseFloor: 'houseFloor.png',
  gardenFloor: 'gardenFloor.png',
  garageFloor: 'garageFloor.png',
  newspaper: 'newspaper.png',
  rug: 'rug.png',
  yarnball: 'yarnball.png',
};

export async function loadAssets() {
  await Promise.all(
    Object.entries(ASSETS).map(([key, fileName]) => 
      loadImage(key, `./assets/images/${fileName}`)
    )
  );
}
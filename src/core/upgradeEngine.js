import { upgrades } from '../data/upgradeData.js';
import { gs } from './state.js';
import { CONFIG } from './config.js';
import { playMusic, playSound } from '../utils/soundManager.js';
import { t } from './localization.js';
import { saveGame } from '../systems/save.js';

export function buyUpgrade(id, btn) {
  const upg =
    upgrades.find(u => u.id === id);
  
  if (!upg) return;
  if (gs.purchasedUpgrades.includes(id)) return;
  if (gs.cash < upg.price) return;
  
  gs.cash -=  upg.price;
  
  switch (id) {
    case 'yemek':
      if (gs.handItem) {
        gs.cash += upg.price;
      } else if (!gs.handItem) {
        gs.handItem = 'blob_food';
        playSound('purchase');
      }
      break;
      
    case 'takvim':
      gs.clockActive = true;
      purchase(upg, btn, 1n);
      break;

    case 'yumak':
      const yumak = gs.objects.find(
        o => o.type === 'yarnball'
      );
      yumak.active = true;
      yumak.visible = true;
      purchase(upg, btn, 2n);
      break;
      
    case 'evCicek':
      const evcicek = gs.objects.find(
        o => o.type === 'evCicek'
      );
      evcicek.active = true;
      evcicek.visible = true;
      evcicek.collidable = true;
      
      purchase(upg, btn, 4n);
      break;
      
    case 'hali':
      gs.newCarpet = true;
      gs.critChance = 5;
      purchase(upg, btn, 8n);
      break;
    
    case 'boyIksiri1':
      gs.blob.size += gs.blob.size / 4;
      purchase(upg, btn);
      break;
      
    case 'hoparlor':
      playMusic('speakerMusic');
      const speaker = gs.objects.find(
        o => o.type === 'hoparlor'
      );
      gs.speakerOn = true;
      speaker.collidable = true;
      speaker.visible = true;
      speaker.active = true;
      gs.hungerEffect -= 0.5;
      purchase(upg, btn);
      break;
      
    case 'hamburger':
      gs.blob.speedMulti -= 0.25;
      purchase(upg, btn, 5n);
      break;
      
    case 'stain':
      gs.stainUnlocked = true;
      gs.stain.active = true;
      purchase(upg, btn, 10n);
      break;
      
    case 'toybox':
      const toybox = gs.objects.find(
        o => o.type === 'toybox'
      );
      gs.toybox = true;
      toybox.visible = true;
      toybox.active = true;
      gs.toyMenu.bonePrice = gs.cashIncrease * 20n;
      purchase(upg, btn);
      break;
      
    case 'paraKesesi':
      gs.cashDropping = true;
      purchase(upg, btn);
      break;
      
    case 'gubreleyici':
      gs.otoGubre = true;
      purchase(upg, btn);
      break;
      
    case 'boyIksiri2':
      gs.blob.size += gs.blob.size / 4;
      purchase(upg, btn, 15n);
      break;
      
    case 'patatesKizartmasi':
      purchase(upg, btn, 25n);
      break;
      
    case 'altinKase':
      gs.otoYemek = true;
      purchase(upg, btn);
      break;
    
    case 'bahceAnahtar':
      if (!gs.otoYemek) {
        gs.cash += upg.price;
        break;
      }
      gs.bahceAcik = true;
      purchase(upg, btn, 10n);
      break;
      
    case 'postaKutusu':
      if (!gs.bahceAcik) {
        gs.cash += upg.price;
        break;
      }
      gs.postaKutusu = true;
      const posta = gs.objects.find(
        o => o.type === 'posta'
      );
  
      if (posta) {
        posta.visible = true;
        posta.active = true;
      }
      purchase(upg, btn);
      break;
      
    case 'tarlalar':
      if (!gs.bahceAcik) {
        gs.cash += upg.price;
        break;
      }
      gs.farmsOpen = true;
      purchase(upg, btn);
      break;
      
    case 'clicker1':
      gs.autoClicker = true;
      gs.maxAutoTime = 3;
      gs.autoTime = gs.maxAutoTime;
      gs.lastClicker = 1;
      purchase(upg, btn);
      break;
      
    case 'cikolata':
      gs.critChance = 10;
      purchase(upg, btn, 30n);
      break;
      
    case 'boyIksiri3':
      gs.blob.size += Math.floor(gs.blob.size / 8);
      purchase(upg, btn, 20n);
      break;
      
    case 'chips':
      purchase(upg, btn, 75n);
      break;
      
    case 'clicker2':
      if (gs.lastClicker !== 1) {
        gs.cash += upg.price;
        break;
      }
      gs.lastClicker = 2;
      gs.maxAutoTime = 2.5;
      gs.autoTime = gs.maxAutoTime;
      purchase(upg, btn);
      break;
      
    case 'garajAnahtar':
      gs.garageOpen = true;
      purchase(upg, btn);
      break;
      
    case 'kazancTablo':
      if (!gs.garageOpen) {
        gs.cash += upg.price;
        break;
      }
      gs.tableIncome = true;
      gs.companyIncome = 10n;
      
      const table = gs.objects.find(
        o => o.type === 'incomeTable'
      );
      table.active = true;
      table.visible = true;
      table.collidable = true;
      
      purchase(upg, btn);
      break;
      
    case 'garajCicek':
      if (!gs.tableIncome) {
        gs.cash += upg.price;
        break;
      }
      const cicek = gs.objects.find(
        o => o.type === 'garajCicek'
      );
      cicek.active = true;
      cicek.visible = true;
      cicek.collidable = true;
      
      gs.companyIncome += 20n;
      purchase(upg, btn);
      break;
      
    case 'sunucu16':
      if (!gs.tableIncome) {
        gs.cash += upg.price;
        break;
      }
      const sw16 = gs.objects.find(
        o => o.type === 'server16'
      );
      sw16.active = true;
      sw16.visible = true;
      sw16.collidable = true;
      gs.maxCompanyCash = 25_000n;
      
      purchase(upg, btn);
      break;
    
    case 'bardaklar':
      if (!gs.tableIncome) {
        gs.cash += upg.price;
        break;
      }
      const cups = gs.objects.find(
        o => o.type === 'cupShelf'
      );
      cups.active = true;
      cups.visible = true;
      cups.collidable = true;
      
      gs.companyIncome += 35n;
      purchase(upg, btn);
      break;
      
    case 'tshirtler':
      if (!gs.tableIncome) {
        gs.cash += upg.price;
        break;
      }
      const shirts = gs.objects.find(
        o => o.type === 'tshirtShelf'
      );
      shirts.active = true;
      shirts.visible = true;
      shirts.collidable = true;
      
      gs.companyIncome += 40n;
      purchase(upg, btn);
      break;
      
      
    case 'sapkalar':
      if (!gs.tableIncome) {
        gs.cash += upg.price;
        break;
      }
      const hats = gs.objects.find(
        o => o.type === 'hatShelf'
      );
      hats.active = true;
      hats.visible = true;
      hats.collidable = true;
      
      gs.companyIncome += 50n;
      purchase(upg, btn);
      break;
      
    case 'clicker3':
      if (gs.lastClicker !== 2) {
        gs.cash += upg.price;
        break;
      }
      gs.lastClicker = 3;
      gs.maxAutoTime = 2;
      gs.autoTime = gs.maxAutoTime;
      purchase(upg, btn);
      break;
      
    case 'danisman':
      if (!gs.tableIncome) {
        gs.cash += upg.price;
        break;
      }
      const danisman = gs.objects.find(
        o => o.type === 'danisman'
      );
      danisman.active = true;
      danisman.visible = true;
      danisman.collidable = true;
      
      gs.companyIncome += 75n;
      purchase(upg, btn);
      break;
      
    case 'sunucu32':
      if (!gs.tableIncome) {
        gs.cash += upg.price;
        break;
      }
      const sw32 = gs.objects.find(
        o => o.type === 'server32'
      );
      sw32.active = true;
      sw32.visible = true;
      sw32.collidable = true;
      gs.serversOpen = true;
      gs.maxCompanyCash = 1_000_000n;
      
      gs.companyIncome += 100n;
      purchase(upg, btn);
      break;
      
    case 'isiklar':
      if (!gs.serversOpen) {
        gs.cash += upg.price;
        break;
      }
      gs.nightDarkness = 0.05;
      
      purchase(upg, btn, 100n);
      break;
      
    case 'clicker4':
      if (gs.lastClicker !== 3) {
        gs.cash += upg.price;
        break;
      }
      gs.lastClicker = 4;
      gs.maxAutoTime = 1.5;
      gs.autoTime = gs.maxAutoTime;
      purchase(upg, btn);
      break;
      
    case 'yatak':
      gs.newBed = true;
      purchase(upg, btn);
      break;
      
    case 'hizIksiri':
      gs.player.speedMulti = 2;
      purchase(upg, btn, 150n);
      break;
      
    case 'odaArkadasi':
      gs.roommate = true;
      purchase(upg, btn);
      break;
      
    case 'telefon':
      if (!gs.tableIncome) {
        gs.cash += upg.price;
        break;
      }
      const phone = gs.objects.find(
        o => o.type === 'phoneShelf'
      );
      phone.active = true;
      phone.visible = true;
      phone.collidable = true;
      
      gs.companyIncome += 250n;
      purchase(upg, btn);
      break;
      
    case 'dondurma':
      gs.blob.speedMulti -= 0.15;
      purchase(upg, btn, 220n);
      break;
      
    case 'araba':
      if (!gs.tableIncome) {
        gs.cash += upg.price;
        break;
      }
      const car = gs.objects.find(
        o => o.type === 'car'
      );
      car.active = true;
      car.visible = true;
      car.collidable = true;
      
      gs.companyIncome += 500n;
      purchase(upg, btn);
      break;
      
    case 'kilim':
      const kilim = gs.objects.find(
        o => o.type === 'rug'
      );
      kilim.active = true;
      kilim.visible = true;
      purchase(upg, btn, 250n);
      break;

    case 'doze':
      gs.dozeUnlocked = true;
      gs.doze.active = true;
      purchase(upg, btn, 270n);
      break;
  }
}

function purchase(upg, btn, incr = 0n) {
  gs.purchasedUpgrades.push(upg.id)
  btn.disabled = true;
  btn.innerText = t('purchased');
  
  if (gs.happiness < gs.happinessTarget) gs.happiness += 3;
  gs.cashIncrease += BigInt(incr);
  saveGame();
  playSound('purchase');
}
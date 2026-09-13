import { t } from '../core/localization.js';

export let upgrades = []

export function initUpgrades() {
  upgrades = createUpgrades()
}

function createUpgrades() {
  return [
    {
      id: 'yemek',
      title: t('upgrades.yemek.title'),
      description: t('upgrades.yemek.description'),
      price: 10n,
      image: '/assets/images/yemek.png'
    },
    {
      id: 'takvim',
      title: t('upgrades.takvim.title'),
      description: t('upgrades.takvim.description'),
      price: 15n,
      image: '/assets/images/clockUpg.png'
    },
    {
      id: 'yumak',
      title: t('upgrades.yumak.title'),
      description: t('upgrades.yumak.description'),
      price: 50n,
      image: '/assets/images/yumak.png'
    },
    {
      id: 'evCicek',
      title: t('upgrades.evCicek.title'),
      description: t('upgrades.evCicek.description'),
      price: 100n,
      image: '/assets/images/garajCicekUpg.png'
    },
    { 
      id: 'hali',
      title: t('upgrades.hali.title'),
      description: t('upgrades.hali.description'),
      price: 250n,
      image: '/assets/images/carpet2.png'
    },
    {
      id: 'boyIksiri1',
      title: t('upgrades.boyIksiri1.title'),
      description: t('upgrades.boyIksiri1.description'),
      price: 450n,
      image: '/assets/images/boyIksiri1.png'
    },
    { 
      id: 'hoparlor',
      title: t('upgrades.hoparlor.title'),
      description: t('upgrades.hoparlor.description'),
      price: 700n,
      image: '/assets/images/hoparlorUpg.png'
    },
    {
      id: 'hamburger',
      title: t('upgrades.hamburger.title'),
      description: t('upgrades.hamburger.description'),
      price: 1000n,
      image: '/assets/images/hamburger.png'
    },
    {
      id: 'stain',
      title: t('upgrades.stain.title'),
      description: t('upgrades.stain.description'),
      price: 1350n,
      image: '/assets/images/stainUpg.png'
    },
    {
      id: 'toybox',
      title: t('upgrades.toybox.title'),
      description: t('upgrades.toybox.description'),
      price: 1500n,
      image: '/assets/images/toyboxUpg.png'
    },
    { 
      id: 'paraKesesi',
      title: t('upgrades.paraKesesi.title'),
      description: t('upgrades.paraKesesi.description'),
      price: 2200n,
      image: '/assets/images/moneyBagUpg.png'
    },
    {
      id: 'gubreleyici',
      title: t('upgrades.gubreleyici.title'),
      description: t('upgrades.gubreleyici.description'),
      price: 2700n,
      image: '/assets/images/gubreUpg.png'
    },
    {
      id: 'boyIksiri2',
      title: t('upgrades.boyIksiri2.title'),
      description: t('upgrades.boyIksiri2.description'),
      price: 3000n,
      image: '/assets/images/boyIksiri1.png'
    },
    {
      id: 'patatesKizartmasi',
      title: t('upgrades.patatesKizartmasi.title'),
      description: t('upgrades.patatesKizartmasi.description'),
      price: 4000n,
      image: '/assets/images/patatesKizartmasi.png'
    },  
    {
      id: 'altinKase',
      title: t('upgrades.altinKase.title'),
      description: t('upgrades.altinKase.description'),
      price: 5000n,
      image: '/assets/images/altinKase.png'
    },
    {
      id: 'bahceAnahtar',
      title: t('upgrades.bahceAnahtar.title'),
      description: t('upgrades.bahceAnahtar.description'),
      price: 4000n,
      image: '/assets/images/bahceAnahtar.png',
      require: t('req.goldB')
    },
    {
      id: 'postaKutusu',
      title: t('upgrades.postaKutusu.title'),
      description: t('upgrades.postaKutusu.description'),
      price: 500n,
      image: '/assets/images/postaKutusu.png',
      require: t('req.garden')
    },
    {
      id: 'tarlalar',
      title: t('upgrades.tarlalar.title'),
      description: t('upgrades.tarlalar.description'),
      price: 5000n,
      image: '/assets/images/tarlaUpg.png',
      require: t('req.garden')
    },
    {
      id: 'clicker1',
      title: t('upgrades.clicker1.title'),
      description: t('upgrades.clicker1.description'),
      price: 7500n,
      image: '/assets/images/clicker1.png'
    },
    {
      id: 'cikolata',
      title: t('upgrades.chocolate.title'),
      description: t('upgrades.chocolate.description'),
      price: 10000n,
      image: '/assets/images/chocolate.png'
    },
    {
      id: 'boyIksiri3',
      title: t('upgrades.boyIksiri3.title'),
      description: t('upgrades.boyIksiri3.description'),
      price: 14000n,
      image: '/assets/images/boyIksiri1.png'
    },
    {
      id: 'chips',
      title: t('upgrades.chips.title'),
      description: t('upgrades.chips.description'),
      price: 17000n,
      image: '/assets/images/chips.png'
    },
    {
      id: 'clicker2',
      title: t('upgrades.clicker2.title'),
      description: t('upgrades.clicker2.description'),
      price: 20000n,
      image: '/assets/images/clicker2.png',
      require: t('req.woodC')
    },
    { 
      id: 'garajAnahtar',
      title: t('upgrades.garajAnahtar.title'),
      description: t('upgrades.garajAnahtar.description'),
      price: 25000n,
      image: '/assets/images/garageUpg.png'
    },
    {
      id: 'kazancTablo',
      title: t('upgrades.kazancTablo.title'),
      description: t('upgrades.kazancTablo.description'),
      price: 5000n,
      image: '/assets/images/incomeTableUpg.png',
      require: t('req.garage')
    },
    {
      id: 'garajCicek',
      title: t('upgrades.garajCicek.title'),
      description: t('upgrades.garajCicek.description'),
      price: 10000n,
      image: '/assets/images/garajCicekUpg.png',
      require: t('req.industry')
    },  
    {
      id: 'sunucu16',
      title: t('upgrades.sunucu16.title'),
      description: t('upgrades.sunucu16.description'),
      price: 11000n,
      image: '/assets/images/server16upg.png',
      require: t('req.industry')
    },
    {
      id: 'bardaklar',
      title: t('upgrades.bardaklar.title'),
      description: t('upgrades.bardaklar.description'),
      price: 16000n,
      image: '/assets/images/bardaklar.png',
      require: t('req.industry')
    },
    {
      id: 'tshirtler',
      title: t('upgrades.tshirtler.title'),
      description: t('upgrades.tshirtler.description'),
      price: 22000n,
      image: '/assets/images/tshirtler.png',
      require: t('req.industry')
    },
    {
      id: 'sapkalar',
      title: t('upgrades.sapkalar.title'),
      description: t('upgrades.sapkalar.description'),
      price: 35000n,
      image: '/assets/images/sapkalar.png',
      require: t('req.industry')
    },
    {
      id: 'clicker3',
      title: t('upgrades.clicker3.title'),
      description: t('upgrades.clicker3.description'),
      price: 44000n,
      image: '/assets/images/clicker3.png',
      require: t('req.bronzeC')
    },
    {
      id: 'danisman',
      title: t('upgrades.danisman.title'),
      description: t('upgrades.danisman.description'),
      price: 54000n,
      image: '/assets/images/danismanUpg.png',
      require: t('req.industry')
    },
    {
      id: 'sunucu32',
      title: t('upgrades.sunucu32.title'),
      description: t('upgrades.sunucu32.description'),
      price: 65000n,
      image: '/assets/images/server32upg.png',
      require: t('req.industry')
    },
    {
      id: 'isiklar',
      title: t('upgrades.isiklar.title'),
      description: t('upgrades.isiklar.description'),
      price: 75000n,
      image: '/assets/images/isiklar.png',
      require: t('req.server32')
    },
    {
      id: 'clicker4',
      title: t('upgrades.clicker4.title'),
      description: t('upgrades.clicker4.description'),
      price: 100_000n,
      image: '/assets/images/clicker4.png',
      require: t('req.silverC')
    },
    {
      id: 'yatak',
      title: t('upgrades.yatak.title'),
      description: t('upgrades.yatak.description'),
      price: 120_000n,
      image: '/assets/images/bed2.png'
    },
    {
      id: 'hizIksiri',
      title: t('upgrades.hizIksiri.title'),
      description: t('upgrades.hizIksiri.description'),
      price: 150_000n,
      image: '/assets/images/hizIksiri.png'
    },
    {
      id: 'odaArkadasi',
      title: t('upgrades.odaArkadasi.title'),
      description: t('upgrades.odaArkadasi.description'),
      price: 160_000n,
      image: '/assets/images/odaArkadasi.png'
    },
    {
      id: 'telefon',
      title: t('upgrades.telefon.title'),
      description: t('upgrades.telefon.description'),
      price: 200_000n,
      image: '/assets/images/telefon.png',
      require: t('req.industry')
    },
    {
      id: 'dondurma',
      title: t('upgrades.dondurma.title'),
      description: t('upgrades.dondurma.description'),
      price: 250_000n,
      image: '/assets/images/dondurma.png',
    },
    {
      id: 'araba',
      title: t('upgrades.araba.title'),
      description: t('upgrades.araba.description'),
      price: 320_000n,
      image: '/assets/images/car.png',
      require: t('req.industry')
    },
    {
      id: 'kilim',
      title: t('upgrades.kilim.title'),
      description: t('upgrades.kilim.description'),
      price: 400_000n,
      image: '/assets/images/rug.png',
    }
  ];
}
import { t } from '../core/localization.js';

export let plants = []

export function initPlants() {
  plants = createPlants();
}

export function createPlants() {
  return [
  {
    id: 'plant1',
    plantId: 'apple',
    title: t('garden.apple.title'),
    description: t('garden.apple.description'),
    price: 50n,
    image: '/assets/images/appleSeeds.png'
  },
  {
    id: 'plant2',
    plantId: 'orange',
    title: t('garden.orange.title'),
    description: t('garden.orange.description'),
    price: 100n,
    image: '/assets/images/orangeSeeds.png'
  },
  {
    id: 'plant3',
    plantId: 'wheat',
    title: t('garden.wheat.title'),
    description: t('garden.wheat.description'),
    price: 1000n,
    image: '/assets/images/wheatSeeds.png'
  },
  {
    id: 'plant4',
    plantId: 'corn',
    title: t('garden.corn.title'),
    description: t('garden.corn.description'),
    price: 1000n,
    image: '/assets/images/cornSeeds.png'
  }
  ]
}
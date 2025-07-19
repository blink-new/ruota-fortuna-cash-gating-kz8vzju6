import { Prize } from '../types/game';

export const SPIN_PRICE = 2;

export const prizes: Prize[] = [
  { id: 0, name: 'Birra', emoji: '🍺', salePrice: 3, unitCost: 1, baseWeight: 0.14000 },
  { id: 1, name: 'Spritz', emoji: '🍹', salePrice: 5, unitCost: 2.50, baseWeight: 0.05600 },
  { id: 2, name: 'Shot', emoji: '🥃', salePrice: 3, unitCost: 0.60, baseWeight: 0.23300 },
  { id: 3, name: 'Drink', emoji: '🍸', salePrice: 8, unitCost: 8, baseWeight: 0.01750 },
  { id: 4, name: '2 Drink Promo', emoji: '🍻', salePrice: 15, unitCost: 4, baseWeight: 0.03500 },
  { id: 5, name: 'Gin Mare', emoji: '🍋', salePrice: 100, unitCost: 30, baseWeight: 0.00467 },
  { id: 6, name: 'Belvedere Vodka', emoji: '🍾', salePrice: 100, unitCost: 30, baseWeight: 0.00467 },
  { id: 7, name: 'Grey Goose Vodka', emoji: '🥂', salePrice: 100, unitCost: 30, baseWeight: 0.00467 },
  { id: 8, name: 'Veuve Clicquot', emoji: '🥂', salePrice: 130, unitCost: 50, baseWeight: 0.00280 },
  { id: 9, name: 'Moët & Chandon', emoji: '🍾', salePrice: 150, unitCost: 50, baseWeight: 0.00280 },
];

// Calculate miss weight
const totalBaseWeight = prizes.reduce((sum, prize) => sum + prize.baseWeight, 0);
export const MISS_WEIGHT = 1 - totalBaseWeight;
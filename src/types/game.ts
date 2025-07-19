export interface Prize {
  id: number;
  name: string;
  emoji: string;
  salePrice: number;
  unitCost: number;
  baseWeight: number;
}

export interface SpinResult {
  outcome: string;
  cashBefore: number;
  cashAfter: number;
  timestamp: number;
  seed: string;
  profit: number;
  cost: number;
}

export interface GameState {
  cash: number;
  totalSpins: number;
  totalProfit: number;
  spinHistory: SpinResult[];
  isSpinning: boolean;
  lastResult: SpinResult | null;
}
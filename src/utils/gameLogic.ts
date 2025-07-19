import { prizes, SPIN_PRICE, MISS_WEIGHT } from '../data/prizes';
import { Prize, SpinResult } from '../types/game';

// Seeded random number generator for reproducible results
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    this.seed = this.hashCode(seed);
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

export function generateSeed(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function performSpin(currentCash: number): SpinResult {
  const seed = generateSeed();
  const rng = new SeededRandom(seed);
  const timestamp = Date.now();
  
  // Step 1: Add spin price to cash
  const cashAfterPayment = currentCash + SPIN_PRICE;
  
  // Step 2: Determine eligible prizes
  const eligiblePrizes = prizes.filter(prize => cashAfterPayment >= prize.salePrice);
  
  // Step 3: Build weights array
  const weights: number[] = [];
  for (const prize of prizes) {
    if (eligiblePrizes.includes(prize)) {
      weights.push(prize.baseWeight);
    } else {
      weights.push(0);
    }
  }
  weights.push(MISS_WEIGHT); // Miss is always eligible
  
  // Step 4: Check if any prizes are eligible
  const totalPrizeWeight = weights.slice(0, prizes.length).reduce((sum, w) => sum + w, 0);
  
  let outcome: string;
  let finalCash: number;
  let cost = 0;
  
  if (totalPrizeWeight === 0) {
    // No prizes eligible, automatic miss
    outcome = 'Miss ❌';
    finalCash = cashAfterPayment;
  } else {
    // Normalize weights and select outcome
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const normalizedWeights = weights.map(w => w / totalWeight);
    
    // Select outcome using weighted random
    const random = rng.next();
    let cumulative = 0;
    let selectedIndex = -1;
    
    for (let i = 0; i < normalizedWeights.length; i++) {
      cumulative += normalizedWeights[i];
      if (random <= cumulative) {
        selectedIndex = i;
        break;
      }
    }
    
    if (selectedIndex === prizes.length) {
      // Miss selected
      outcome = 'Miss ❌';
      finalCash = cashAfterPayment;
    } else {
      // Prize selected
      const selectedPrize = prizes[selectedIndex];
      outcome = `${selectedPrize.name} ${selectedPrize.emoji}`;
      cost = selectedPrize.unitCost;
      finalCash = cashAfterPayment - cost;
    }
  }
  
  const profit = SPIN_PRICE - cost;
  
  return {
    outcome,
    cashBefore: currentCash,
    cashAfter: finalCash,
    timestamp,
    seed,
    profit,
    cost
  };
}

export function getEligiblePrizes(cash: number): Prize[] {
  return prizes.filter(prize => cash >= prize.salePrice);
}

export function calculateProbabilities(cash: number): { prize: Prize; probability: number }[] {
  const eligiblePrizes = getEligiblePrizes(cash);
  
  const weights: number[] = [];
  for (const prize of prizes) {
    if (eligiblePrizes.includes(prize)) {
      weights.push(prize.baseWeight);
    } else {
      weights.push(0);
    }
  }
  weights.push(MISS_WEIGHT);
  
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  
  return prizes.map((prize, index) => ({
    prize,
    probability: weights[index] / totalWeight
  }));
}
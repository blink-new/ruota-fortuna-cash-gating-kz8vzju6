import React, { useState, useRef, useEffect, useMemo } from 'react';
import { prizes, MISS_WEIGHT } from '../data/prizes';
import { getEligiblePrizes } from '../utils/gameLogic';

interface SlotMachineProps {
  cash: number;
  onSpinComplete: (result: string) => void;
  isSpinning: boolean;
  onSpin?: () => void;
}

export function SlotMachine({ cash, onSpinComplete, isSpinning, onSpin }: SlotMachineProps) {
  const [reelPositions, setReelPositions] = useState([0, 0, 0]);
  const [finalResult, setFinalResult] = useState<string | null>(null);
  const reelRefs = useRef<(HTMLDivElement | null)[]>([]);

  const eligiblePrizes = getEligiblePrizes(cash);
  
  // Create the symbols array (eligible prizes + miss) with useMemo
  const allSymbols = useMemo(() => [...eligiblePrizes, { 
    id: -1, 
    name: 'Miss', 
    emoji: '❌', 
    salePrice: 0, 
    unitCost: 0, 
    baseWeight: MISS_WEIGHT 
  }], [eligiblePrizes]);

  // Create a reel with symbols repeated for smooth spinning
  const reelSymbols = useMemo(() => {
    const reel = [];
    for (let i = 0; i < 5; i++) { // Repeat symbols 5 times
      allSymbols.forEach(symbol => reel.push(symbol));
    }
    return reel;
  }, [allSymbols]);
  const symbolHeight = 80; // Height of each symbol in pixels

  useEffect(() => {
    if (isSpinning) {
      // Start spinning animation
      setFinalResult(null);
      
      // Spin each reel with different durations
      const spinDurations = [2000, 2500, 3000]; // Different timing for each reel
      
      reelRefs.current.forEach((reel, index) => {
        if (reel) {
          const spins = 5 + Math.random() * 3; // 5-8 full rotations
          const finalPosition = Math.random() * reelSymbols.length;
          const totalRotation = spins * reelSymbols.length * symbolHeight + finalPosition * symbolHeight;
          
          reel.style.transition = `transform ${spinDurations[index]}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
          reel.style.transform = `translateY(-${totalRotation}px)`;
          
          setTimeout(() => {
            const finalIndex = Math.floor(finalPosition) % allSymbols.length;
            const finalSymbol = allSymbols[finalIndex];
            
            if (index === 2) { // Last reel
              setFinalResult(finalSymbol.name === 'Miss' ? 'Miss ❌' : `${finalSymbol.name} ${finalSymbol.emoji}`);
              onSpinComplete(finalSymbol.name === 'Miss' ? 'Miss ❌' : `${finalSymbol.name} ${finalSymbol.emoji}`);
            }
          }, spinDurations[index]);
        }
      });
    }
  }, [isSpinning, allSymbols, onSpinComplete, reelSymbols.length]);

  const handleSlotClick = () => {
    if (onSpin && !isSpinning) {
      onSpin();
    }
  };

  return (
    <div className="relative">
      {/* Slot Machine Frame */}
      <div 
        className={`relative bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-600 p-6 rounded-2xl shadow-2xl cursor-pointer transition-all duration-200 ${
          !isSpinning ? 'hover:scale-105 hover:shadow-3xl' : ''
        }`}
        onClick={handleSlotClick}
      >
        {/* Top decorative lights */}
        <div className="flex justify-center space-x-2 mb-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                isSpinning 
                  ? 'bg-red-500 animate-pulse' 
                  : 'bg-yellow-200'
              }`}
              style={{
                animationDelay: `${i * 200}ms`
              }}
            />
          ))}
        </div>

        {/* Slot Title */}
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-slate-900 mb-1">🎰 SLOT MACHINE</h3>
          <p className="text-sm text-slate-700">
            {isSpinning ? 'GIRANDO...' : 'Clicca per girare!'}
          </p>
        </div>

        {/* Slot Reels Window */}
        <div className="bg-slate-900 rounded-xl p-4 mb-4 relative overflow-hidden">
          {/* Viewing window overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent border-4 border-slate-700 rounded-xl pointer-events-none z-10">
            {/* Top shadow */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-slate-900 to-transparent"></div>
            {/* Bottom shadow */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-900 to-transparent"></div>
          </div>

          {/* Three Reels */}
          <div className="flex justify-center space-x-4">
            {[0, 1, 2].map((reelIndex) => (
              <div key={reelIndex} className="relative">
                {/* Reel container */}
                <div className="w-20 h-20 overflow-hidden bg-white rounded-lg border-2 border-slate-300 relative">
                  {/* Reel strip */}
                  <div
                    ref={(el) => (reelRefs.current[reelIndex] = el)}
                    className="absolute w-full"
                    style={{
                      transform: `translateY(-${reelPositions[reelIndex] * symbolHeight}px)`,
                      transition: isSpinning ? 'none' : 'transform 0.3s ease'
                    }}
                  >
                    {reelSymbols.map((symbol, symbolIndex) => (
                      <div
                        key={`${symbol.id}-${symbolIndex}`}
                        className="flex flex-col items-center justify-center bg-white border-b border-slate-200"
                        style={{ height: `${symbolHeight}px` }}
                      >
                        <div className="text-2xl mb-1">{symbol.emoji}</div>
                        <div className="text-xs font-semibold text-slate-700 text-center leading-tight">
                          {symbol.name.split(' ')[0]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reel label */}
                <div className="text-center mt-2">
                  <span className="text-xs font-bold text-slate-900">
                    {reelIndex === 0 ? 'PRIMO' : reelIndex === 1 ? 'SECONDO' : 'TERZO'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Result Display */}
        <div className="text-center mb-4">
          {finalResult && !isSpinning && (
            <div className="bg-slate-900 rounded-lg p-3 border-2 border-yellow-300">
              <div className="text-yellow-400 font-bold text-lg">
                {finalResult}
              </div>
              {finalResult !== 'Miss ❌' && (
                <div className="text-green-400 text-sm font-semibold mt-1">
                  🎉 HAI VINTO!
                </div>
              )}
            </div>
          )}
          
          {isSpinning && (
            <div className="bg-slate-900 rounded-lg p-3 border-2 border-red-500">
              <div className="text-red-400 font-bold text-lg animate-pulse">
                🎰 GIRANDO...
              </div>
              <div className="text-slate-400 text-sm">
                Incrociamo le dita!
              </div>
            </div>
          )}

          {!isSpinning && !finalResult && (
            <div className="bg-slate-900 rounded-lg p-3 border-2 border-blue-500">
              <div className="text-blue-400 font-bold text-lg">
                👆 PRONTO A GIOCARE!
              </div>
              <div className="text-slate-400 text-sm">
                Clicca per girare - €2
              </div>
            </div>
          )}
        </div>

        {/* Bottom decorative elements */}
        <div className="flex justify-center space-x-1">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-yellow-200 rounded-full"
            />
          ))}
        </div>
      </div>

      {/* Glow effect when spinning */}
      {isSpinning && (
        <div className="absolute inset-0 rounded-2xl bg-yellow-400 opacity-50 animate-pulse -z-10 blur-xl"></div>
      )}

      {/* Info Panel */}
      <div className="mt-6 text-center">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <h4 className="text-yellow-400 font-semibold mb-2">📊 Premi Disponibili</h4>
          <div className="text-sm text-slate-300 space-y-1">
            <div>🎯 Sbloccati: <span className="text-green-400 font-semibold">{eligiblePrizes.length}/{prizes.length}</span></div>
            <div>💰 Cassa: <span className="text-yellow-400 font-semibold">€{cash.toFixed(2)}</span></div>
          </div>
          
          {eligiblePrizes.length < prizes.length && (
            <div className="mt-3 text-xs text-slate-400">
              💡 Continua a giocare per sbloccare più premi!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
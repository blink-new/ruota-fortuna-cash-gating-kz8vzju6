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
  const [finalResult, setFinalResult] = useState<string | null>(null);
  const [reelStates, setReelStates] = useState([false, false, false]);
  const reelRefs = useRef<(HTMLDivElement | null)[]>([]);

  const eligiblePrizes = getEligiblePrizes(cash);
  
  // Create symbols array
  const allSymbols = useMemo(() => [...eligiblePrizes, { 
    id: -1, 
    name: 'Miss', 
    emoji: '❌', 
    salePrice: 0, 
    unitCost: 0, 
    baseWeight: MISS_WEIGHT 
  }], [eligiblePrizes]);

  // Create reel with repeated symbols for smooth animation
  const reelSymbols = useMemo(() => {
    const reel = [];
    for (let i = 0; i < 6; i++) {
      allSymbols.forEach(symbol => reel.push(symbol));
    }
    return reel;
  }, [allSymbols]);
  
  const symbolHeight = 80;

  useEffect(() => {
    if (isSpinning) {
      setFinalResult(null);
      setReelStates([true, true, true]);
      
      const spinDurations = [1500, 2000, 2500];
      
      reelRefs.current.forEach((reel, index) => {
        if (reel) {
          // Reset position
          reel.style.transition = 'none';
          reel.style.transform = 'translateY(0px)';
          
          // Force reflow
          reel.offsetHeight;
          
          // Start animation
          setTimeout(() => {
            const spins = 4 + Math.random() * 2;
            const finalIndex = Math.floor(Math.random() * allSymbols.length);
            const totalDistance = spins * allSymbols.length * symbolHeight + finalIndex * symbolHeight;
            
            reel.style.transition = `transform ${spinDurations[index]}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
            reel.style.transform = `translateY(-${totalDistance}px)`;
            
            // Stop reel
            setTimeout(() => {
              setReelStates(prev => {
                const newStates = [...prev];
                newStates[index] = false;
                return newStates;
              });
              
              // Complete on last reel
              if (index === 2) {
                const finalSymbol = allSymbols[finalIndex];
                const result = finalSymbol.name === 'Miss' ? 'Miss ❌' : `${finalSymbol.name} ${finalSymbol.emoji}`;
                setFinalResult(result);
                onSpinComplete(result);
              }
            }, spinDurations[index]);
          }, 100 + index * 200);
        }
      });
    }
  }, [isSpinning, allSymbols, onSpinComplete]);

  const handleSlotClick = () => {
    if (onSpin && !isSpinning) {
      onSpin();
    }
  };

  return (
    <div className="relative">
      {/* Slot Machine Frame */}
      <div 
        className={`relative bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-600 p-8 rounded-3xl shadow-2xl cursor-pointer transition-all duration-300 ${
          !isSpinning 
            ? 'hover:scale-105 hover:shadow-yellow-500/20' 
            : 'scale-105 shadow-yellow-500/30'
        }`}
        onClick={handleSlotClick}
      >
        {/* Top lights */}
        <div className="flex justify-center space-x-3 mb-6">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                isSpinning 
                  ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse' 
                  : 'bg-yellow-200'
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">
            🎰 SLOT MACHINE DELUXE
          </h3>
          <p className={`text-base text-slate-700 font-semibold ${
            isSpinning ? 'text-red-800 animate-pulse' : ''
          }`}>
            {isSpinning ? '⚡ GIRANDO... ⚡' : '👆 Clicca per girare!'}
          </p>
        </div>

        {/* Slot Reels */}
        <div className={`bg-slate-900 rounded-2xl p-6 mb-6 relative overflow-hidden border-4 ${
          isSpinning ? 'border-red-500 shadow-lg shadow-red-500/30' : 'border-slate-700'
        }`}>
          {/* Window overlay */}
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-slate-900 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-900 to-transparent"></div>
          </div>

          {/* Three Reels */}
          <div className="flex justify-center space-x-6">
            {[0, 1, 2].map((reelIndex) => (
              <div key={reelIndex} className="relative">
                <div className={`w-24 h-24 overflow-hidden bg-white rounded-xl border-4 relative ${
                  reelStates[reelIndex] 
                    ? 'border-red-500 shadow-lg shadow-red-500/30' 
                    : 'border-slate-300'
                }`}>
                  {/* Reel strip */}
                  <div
                    ref={(el) => (reelRefs.current[reelIndex] = el)}
                    className={`absolute w-full ${
                      reelStates[reelIndex] ? 'blur-[1px]' : 'blur-0'
                    }`}
                    style={{ transition: 'blur 0.3s ease' }}
                  >
                    {reelSymbols.map((symbol, symbolIndex) => (
                      <div
                        key={`${symbol.id}-${symbolIndex}`}
                        className="flex flex-col items-center justify-center bg-white border-b border-slate-200"
                        style={{ height: `${symbolHeight}px` }}
                      >
                        <div className="text-3xl mb-1">{symbol.emoji}</div>
                        <div className="text-xs font-bold text-slate-700 text-center">
                          {symbol.name.split(' ')[0]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reel label */}
                <div className="text-center mt-3">
                  <span className={`text-sm font-bold ${
                    reelStates[reelIndex] ? 'text-red-400' : 'text-slate-900'
                  }`}>
                    {reelIndex === 0 ? 'PRIMO' : reelIndex === 1 ? 'SECONDO' : 'TERZO'}
                  </span>
                  {reelStates[reelIndex] && (
                    <div className="text-xs text-red-600 font-semibold animate-pulse">GIRANDO</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Result Display */}
        <div className="text-center mb-6">
          {finalResult && !isSpinning && (
            <div className={`bg-slate-900 rounded-xl p-4 border-4 transition-all duration-500 ${
              finalResult === 'Miss ❌' 
                ? 'border-red-500 shadow-lg shadow-red-500/30' 
                : 'border-green-500 shadow-lg shadow-green-500/30'
            }`}>
              <div className={`font-bold text-2xl ${
                finalResult === 'Miss ❌' ? 'text-red-400' : 'text-green-400'
              }`}>
                {finalResult}
              </div>
              {finalResult !== 'Miss ❌' && (
                <div className="text-green-400 text-lg font-bold mt-2">
                  🎉 HAI VINTO! 🎉
                </div>
              )}
              {finalResult === 'Miss ❌' && (
                <div className="text-red-400 text-sm font-semibold mt-2">
                  😔 Riprova, la fortuna ti sorriderà!
                </div>
              )}
            </div>
          )}
          
          {isSpinning && (
            <div className="bg-slate-900 rounded-xl p-4 border-4 border-yellow-500 shadow-lg shadow-yellow-500/30">
              <div className="text-yellow-400 font-bold text-2xl animate-pulse">
                🎰 GIRANDO... 🎰
              </div>
              <div className="text-slate-400 text-base mt-2">
                🤞 Incrociamo le dita! 🤞
              </div>
              
              {/* Progress indicator */}
              <div className="flex justify-center space-x-3 mt-4">
                {reelStates.map((spinning, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      spinning 
                        ? 'bg-yellow-400 animate-pulse' 
                        : 'bg-green-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {!isSpinning && !finalResult && (
            <div className="bg-slate-900 rounded-xl p-4 border-4 border-blue-500 shadow-lg shadow-blue-500/20">
              <div className="text-blue-400 font-bold text-2xl">
                👆 PRONTO A GIOCARE! 👆
              </div>
              <div className="text-slate-400 text-base mt-2">
                💰 Clicca per girare - Solo €2 💰
              </div>
            </div>
          )}
        </div>

        {/* Bottom lights */}
        <div className="flex justify-center space-x-1">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                isSpinning 
                  ? 'bg-red-400 animate-pulse' 
                  : 'bg-yellow-200'
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Glow effect */}
      {isSpinning && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 opacity-30 animate-pulse -z-10 blur-xl"></div>
      )}

      {/* Info Panel */}
      <div className="mt-8 text-center">
        <div className={`backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 ${
          isSpinning 
            ? 'bg-slate-800/70 border-yellow-500/50' 
            : 'bg-slate-800/50 border-slate-700'
        }`}>
          <h4 className="text-yellow-400 font-bold text-lg mb-4">
            📊 STATISTICHE LIVE
          </h4>
          <div className="grid grid-cols-2 gap-4 text-base">
            <div className="bg-slate-700/50 rounded-xl p-3">
              <div className="text-green-400 font-bold text-xl">{eligiblePrizes.length}</div>
              <div className="text-slate-300 text-sm">Premi Sbloccati</div>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-3">
              <div className="text-yellow-400 font-bold text-xl">€{cash.toFixed(2)}</div>
              <div className="text-slate-300 text-sm">Cassa Attuale</div>
            </div>
          </div>
          
          {eligiblePrizes.length < prizes.length && (
            <div className="mt-4 text-sm p-3 rounded-xl text-slate-400 bg-slate-700/30">
              💡 Continua a giocare per sbloccare tutti i {prizes.length} premi!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
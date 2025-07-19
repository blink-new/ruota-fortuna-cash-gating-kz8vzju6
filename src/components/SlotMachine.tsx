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
  const [reelStates, setReelStates] = useState([false, false, false]); // spinning states
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
    for (let i = 0; i < 8; i++) { // Increased repetitions for smoother animation
      allSymbols.forEach(symbol => reel.push(symbol));
    }
    return reel;
  }, [allSymbols]);
  
  const symbolHeight = 80; // Height of each symbol in pixels

  useEffect(() => {
    if (isSpinning) {
      // Start spinning animation
      setFinalResult(null);
      setReelStates([true, true, true]);
      
      // Spin each reel with different durations and effects
      const spinDurations = [2200, 2800, 3400]; // Different timing for each reel
      const accelerationPhase = 300; // Time for acceleration
      
      reelRefs.current.forEach((reel, index) => {
        if (reel) {
          // Reset transform
          reel.style.transition = 'none';
          reel.style.transform = 'translateY(0px)';
          
          // Start spinning animation
          setTimeout(() => {
            const spins = 6 + Math.random() * 4; // 6-10 full rotations
            const finalPosition = Math.random() * allSymbols.length;
            const totalRotation = spins * allSymbols.length * symbolHeight + finalPosition * symbolHeight;
            
            // Smooth easing curve for realistic spinning
            reel.style.transition = `transform ${spinDurations[index]}ms cubic-bezier(0.15, 0.2, 0.1, 1.0)`;
            reel.style.transform = `translateY(-${totalRotation}px)`;
            
            // Stop reel animation
            setTimeout(() => {
              const finalIndex = Math.floor(finalPosition) % allSymbols.length;
              const finalSymbol = allSymbols[finalIndex];
              
              // Update reel state
              setReelStates(prev => {
                const newStates = [...prev];
                newStates[index] = false;
                return newStates;
              });
              
              // Only trigger completion on last reel
              if (index === 2) { // Last reel
                setFinalResult(finalSymbol.name === 'Miss' ? 'Miss ❌' : `${finalSymbol.name} ${finalSymbol.emoji}`);
                onSpinComplete(finalSymbol.name === 'Miss' ? 'Miss ❌' : `${finalSymbol.name} ${finalSymbol.emoji}`);
              }
            }, spinDurations[index]);
          }, 50 + index * 100); // Staggered start for reels
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
        className={`relative bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-600 p-8 rounded-3xl shadow-2xl cursor-pointer transition-all duration-300 transform ${
          !isSpinning 
            ? 'hover:scale-105 hover:shadow-3xl hover:shadow-yellow-500/20' 
            : 'scale-110 shadow-3xl shadow-yellow-500/30 animate-pulse'
        }`}
        onClick={handleSlotClick}
      >
        {/* Top decorative lights with enhanced animation */}
        <div className="flex justify-center space-x-3 mb-6">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                isSpinning 
                  ? 'bg-red-500 shadow-lg shadow-red-500/50' 
                  : 'bg-yellow-200 shadow-sm'
              } ${
                isSpinning ? 'animate-pulse' : ''
              }`}
              style={{
                animationDelay: `${i * 150}ms`,
                transform: isSpinning ? 'scale(1.2)' : 'scale(1)'
              }}
            />
          ))}
        </div>

        {/* Enhanced Slot Title */}
        <div className="text-center mb-6">
          <h3 className={`text-2xl font-bold text-slate-900 mb-2 transition-all duration-300 ${
            isSpinning ? 'animate-bounce' : ''
          }`}>
            🎰 SLOT MACHINE DELUXE
          </h3>
          <p className={`text-base text-slate-700 font-semibold transition-all duration-300 ${
            isSpinning ? 'text-red-800 animate-pulse' : ''
          }`}>
            {isSpinning ? '⚡ GIRANDO... ⚡' : '👆 Clicca per girare!'}
          </p>
        </div>

        {/* Enhanced Slot Reels Window */}
        <div className={`bg-slate-900 rounded-2xl p-6 mb-6 relative overflow-hidden border-4 transition-all duration-300 ${
          isSpinning ? 'border-red-500 shadow-lg shadow-red-500/30' : 'border-slate-700'
        }`}>
          {/* Enhanced viewing window overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent border-4 border-slate-700 rounded-2xl pointer-events-none z-10">
            {/* Dramatic top shadow */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-slate-900 via-slate-900/80 to-transparent"></div>
            {/* Dramatic bottom shadow */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
            
            {/* Side lighting effects */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-200 ${
              isSpinning ? 'bg-gradient-to-b from-yellow-400 to-red-500 animate-pulse' : 'bg-slate-600'
            }`}></div>
            <div className={`absolute right-0 top-0 bottom-0 w-1 transition-all duration-200 ${
              isSpinning ? 'bg-gradient-to-b from-yellow-400 to-red-500 animate-pulse' : 'bg-slate-600'
            }`}></div>
          </div>

          {/* Three Enhanced Reels */}
          <div className="flex justify-center space-x-6">
            {[0, 1, 2].map((reelIndex) => (
              <div key={reelIndex} className="relative">
                {/* Enhanced Reel container */}
                <div className={`w-24 h-24 overflow-hidden bg-white rounded-xl border-4 relative transition-all duration-300 ${
                  reelStates[reelIndex] 
                    ? 'border-red-500 shadow-lg shadow-red-500/30 scale-110' 
                    : 'border-slate-300 shadow-md'
                }`}>
                  {/* Spinning overlay effect */}
                  {reelStates[reelIndex] && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse z-20"></div>
                  )}
                  
                  {/* Enhanced Reel strip */}
                  <div
                    ref={(el) => (reelRefs.current[reelIndex] = el)}
                    className={`absolute w-full transition-transform ${
                      reelStates[reelIndex] ? 'blur-sm' : 'blur-0'
                    }`}
                    style={{
                      transform: `translateY(-${reelPositions[reelIndex] * symbolHeight}px)`,
                      transition: isSpinning ? 'none' : 'transform 0.5s ease-out, blur 0.3s ease'
                    }}
                  >
                    {reelSymbols.map((symbol, symbolIndex) => (
                      <div
                        key={`${symbol.id}-${symbolIndex}`}
                        className="flex flex-col items-center justify-center bg-white border-b border-slate-200 transition-all duration-200 hover:bg-slate-50"
                        style={{ height: `${symbolHeight}px` }}
                      >
                        <div className="text-3xl mb-1 transition-transform duration-200 hover:scale-110">
                          {symbol.emoji}
                        </div>
                        <div className="text-xs font-bold text-slate-700 text-center leading-tight">
                          {symbol.name.split(' ')[0]}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enhanced Reel label with status */}
                <div className="text-center mt-3">
                  <span className={`text-sm font-bold transition-all duration-300 ${
                    reelStates[reelIndex] ? 'text-red-400 animate-pulse' : 'text-slate-900'
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

        {/* Enhanced Result Display */}
        <div className="text-center mb-6">
          {finalResult && !isSpinning && (
            <div className={`bg-slate-900 rounded-xl p-4 border-4 transition-all duration-500 transform scale-105 ${
              finalResult === 'Miss ❌' 
                ? 'border-red-500 shadow-lg shadow-red-500/30' 
                : 'border-green-500 shadow-lg shadow-green-500/30 animate-pulse'
            }`}>
              <div className={`font-bold text-2xl ${
                finalResult === 'Miss ❌' ? 'text-red-400' : 'text-green-400'
              }`}>
                {finalResult}
              </div>
              {finalResult !== 'Miss ❌' && (
                <div className="text-green-400 text-lg font-bold mt-2 animate-bounce">
                  🎉🎉 HAI VINTO! 🎉🎉
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
                🎰✨ GIRANDO... ✨🎰
              </div>
              <div className="text-slate-400 text-base mt-2 animate-bounce">
                🤞 Incrociamo le dita! 🤞
              </div>
              
              {/* Progress indicator for reels */}
              <div className="flex justify-center space-x-3 mt-4">
                {reelStates.map((spinning, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      spinning 
                        ? 'bg-yellow-400 animate-spin' 
                        : 'bg-green-500 animate-pulse'
                    }`}
                    style={{
                      animationDelay: `${index * 200}ms`
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {!isSpinning && !finalResult && (
            <div className="bg-slate-900 rounded-xl p-4 border-4 border-blue-500 shadow-lg shadow-blue-500/20 hover:border-yellow-500 transition-all duration-300">
              <div className="text-blue-400 font-bold text-2xl animate-pulse">
                👆 PRONTO A GIOCARE! 👆
              </div>
              <div className="text-slate-400 text-base mt-2">
                💰 Clicca per girare - Solo €2 💰
              </div>
              <div className="text-yellow-400 text-sm mt-2 font-semibold">
                ⚡ Senti la fortuna nell'aria! ⚡
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Bottom decorative elements */}
        <div className="flex justify-center space-x-1">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                isSpinning 
                  ? 'bg-red-400 animate-pulse' 
                  : 'bg-yellow-200'
              }`}
              style={{
                animationDelay: `${i * 100}ms`
              }}
            />
          ))}
        </div>
      </div>

      {/* Enhanced Glow effect when spinning */}
      {isSpinning && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 opacity-60 animate-pulse -z-10 blur-2xl scale-110"></div>
      )}

      {/* Enhanced Info Panel */}
      <div className="mt-8 text-center">
        <div className={`backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 ${
          isSpinning 
            ? 'bg-slate-800/70 border-yellow-500/50 shadow-lg shadow-yellow-500/20' 
            : 'bg-slate-800/50 border-slate-700'
        }`}>
          <h4 className="text-yellow-400 font-bold text-lg mb-4 flex items-center justify-center gap-2">
            📊 STATISTICHE LIVE
            {isSpinning && <span className="animate-spin">⚡</span>}
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
            <div className={`mt-4 text-sm p-3 rounded-xl transition-all duration-300 ${
              isSpinning 
                ? 'text-yellow-300 bg-yellow-500/10 animate-pulse' 
                : 'text-slate-400 bg-slate-700/30'
            }`}>
              💡 Continua a giocare per sbloccare tutti i {prizes.length} premi disponibili!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
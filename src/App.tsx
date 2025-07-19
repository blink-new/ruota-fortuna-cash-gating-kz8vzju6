import React, { useState, useCallback } from 'react';
import { FortuneWheel } from './components/FortuneWheel';
import { CashRegister } from './components/CashRegister';
import { PrizeList } from './components/PrizeList';
import { SpinHistory } from './components/SpinHistory';
import { GameControls } from './components/GameControls';
import { performSpin } from './utils/gameLogic';
import { GameState } from './types/game';
import { Toaster } from './components/ui/toaster';
import { useToast } from './hooks/use-toast';

function App() {
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<GameState>({
    cash: 0,
    totalSpins: 0,
    totalProfit: 0,
    spinHistory: [],
    isSpinning: false,
    lastResult: null
  });

  const [wheelRotation, setWheelRotation] = useState(0);

  const handleSpin = useCallback(() => {
    if (gameState.isSpinning) return;

    setGameState(prev => ({ ...prev, isSpinning: true }));

    // Perform the spin calculation
    const result = performSpin(gameState.cash);
    
    // Calculate wheel rotation for animation
    const baseRotation = 1440; // 4 full rotations
    const randomExtra = Math.random() * 360;
    const finalRotation = wheelRotation + baseRotation + randomExtra;
    
    setWheelRotation(finalRotation);

    // Show result after animation completes
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        cash: result.cashAfter,
        totalSpins: prev.totalSpins + 1,
        totalProfit: prev.totalProfit + result.profit,
        spinHistory: [...prev.spinHistory, result],
        isSpinning: false,
        lastResult: result
      }));

      // Show toast notification
      if (result.outcome === 'Miss ❌') {
        toast({
          title: "Miss! ❌",
          description: `Nessun premio. Profitto: €${result.profit.toFixed(2)}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: `Hai vinto! ${result.outcome}`,
          description: `Profitto: €${result.profit.toFixed(2)}`,
          variant: "default"
        });
      }
    }, 3000);
  }, [gameState.cash, gameState.isSpinning, wheelRotation, toast]);

  const handleReset = useCallback(() => {
    if (gameState.isSpinning) return;
    
    setGameState({
      cash: 0,
      totalSpins: 0,
      totalProfit: 0,
      spinHistory: [],
      isSpinning: false,
      lastResult: null
    });
    setWheelRotation(0);
    
    toast({
      title: "Gioco resettato",
      description: "Tutti i dati sono stati azzerati",
      variant: "default"
    });
  }, [gameState.isSpinning, toast]);

  const handleWheelSpinComplete = useCallback((rotation: number) => {
    setWheelRotation(rotation);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-2">
              🎰 Ruota della Fortuna
            </h1>
            <p className="text-muted-foreground">
              Algoritmo Cash-Gating • Profitto Garantito
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Wheel and Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border">
              <FortuneWheel
                cash={gameState.cash}
                onSpinComplete={handleWheelSpinComplete}
                isSpinning={gameState.isSpinning}
              />
            </div>
            
            <GameControls
              onSpin={handleSpin}
              onReset={handleReset}
              isSpinning={gameState.isSpinning}
              cash={gameState.cash}
              lastResult={gameState.lastResult?.outcome || null}
            />
          </div>

          {/* Middle Column - Cash Register and Prize List */}
          <div className="lg:col-span-1 space-y-6">
            <CashRegister
              cash={gameState.cash}
              totalSpins={gameState.totalSpins}
              totalProfit={gameState.totalProfit}
              lastProfit={gameState.lastResult?.profit}
            />
            
            <PrizeList cash={gameState.cash} />
          </div>

          {/* Right Column - History and Stats */}
          <div className="lg:col-span-1 space-y-6">
            <SpinHistory history={gameState.spinHistory} />
            
            {/* Algorithm Info */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-primary mb-3">
                Come Funziona
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Ogni spin costa €2 e viene aggiunto alla cassa</p>
                <p>• I premi si sbloccano solo quando la cassa raggiunge il loro prezzo di vendita</p>
                <p>• Se vinci, paghi solo il costo vivo del premio</p>
                <p>• Il margine deriva dall'accumulo in cassa e dal markup sui premi</p>
                <p>• La cassa non può mai andare sotto €0</p>
              </div>
              
              {gameState.spinHistory.length > 0 && (
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    <div>Seed ultimo spin: {gameState.lastResult?.seed.slice(-8)}</div>
                    <div>Timestamp: {gameState.lastResult ? new Date(gameState.lastResult.timestamp).toLocaleString('it-IT') : 'N/A'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Toaster />
    </div>
  );
}

export default App;
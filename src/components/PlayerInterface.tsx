import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Volume2, VolumeX, TrendingUp, Coins, Target, Zap } from 'lucide-react'
import { GameState, SpinResult } from '../types/game'
import { performSpin } from '../utils/gameLogic'
import { FortuneWheel } from './FortuneWheel'
import { prizes } from '../data/prizes'

interface PlayerInterfaceProps {
  gameState: GameState
  onGameStateChange: (newState: GameState) => void
}

export function PlayerInterface({ gameState, onGameStateChange }: PlayerInterfaceProps) {
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [lastResult, setLastResult] = useState<SpinResult | null>(null)

  // Audio effects
  const playSound = (type: 'spin' | 'win' | 'miss') => {
    if (!soundEnabled) return
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    if (type === 'spin') {
      // Spinning sound - ascending frequency
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 2.5)
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2.5)
      
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 2.5)
    } else if (type === 'win') {
      // Win sound - celebratory chimes
      [523, 659, 784, 1047].forEach((freq, i) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = freq
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + i * 0.1)
        gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + i * 0.1 + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.3)
        
        oscillator.start(audioContext.currentTime + i * 0.1)
        oscillator.stop(audioContext.currentTime + i * 0.1 + 0.3)
      })
    } else if (type === 'miss') {
      // Miss sound - descending tone
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5)
      oscillator.type = 'sawtooth'
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.5)
    }
  }

  const handleSpin = async () => {
    if (isSpinning) return

    setIsSpinning(true)
    playSound('spin')

    // Spin animation
    const newRotation = rotation + 1800 + Math.random() * 720 // 5-7 full rotations
    setRotation(newRotation)

    // Wait for animation to complete
    setTimeout(async () => {
      const result = performSpin(gameState.cashRegister)
      setLastResult(result)
      
      // Update game state
      const newGameState = {
        ...gameState,
        cashRegister: result.cashAfter,
        totalSpins: gameState.totalSpins + 1,
        spinHistory: [...gameState.spinHistory, {
          id: `spin-${Date.now()}`,
          outcome: result.outcome,
          timestamp: result.timestamp,
          seed: result.seed,
          cashBefore: result.cashBefore,
          cashAfter: result.cashAfter,
          revenue: 2, // SPIN_PRICE
          cost: result.cost
        }]
      }
      onGameStateChange(newGameState)
      
      // Play result sound
      if (result.outcome === 'Miss ❌') {
        playSound('miss')
      } else {
        playSound('win')
      }
      
      setIsSpinning(false)
    }, 3000)
  }

  // Recent wins (last 5 non-miss results)
  const recentWins = gameState.spinHistory
    .filter(spin => spin.outcome !== 'Miss ❌')
    .slice(-5)
    .reverse()

  // Calculate stats
  const totalRevenue = gameState.totalSpins * 2
  const winRate = gameState.totalSpins > 0 
    ? ((gameState.spinHistory.filter(s => s.outcome !== 'Miss ❌').length / gameState.totalSpins) * 100)
    : 0

  // Get eligible prizes count
  const eligiblePrizes = prizes.filter(prize => gameState.cashRegister >= prize.salePrice)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">
              🎰 Ruota della Fortuna
            </h1>
            <p className="text-slate-300 text-lg">Gira la ruota e vinci fantastici premi!</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Sound Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="border-yellow-500/20 hover:border-yellow-500 hover:bg-yellow-500/10"
            >
              {soundEnabled ? 
                <Volume2 className="h-4 w-4 text-yellow-500" /> : 
                <VolumeX className="h-4 w-4 text-yellow-500" />
              }
            </Button>

            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-green-400" />
                <span className="text-slate-300">Cassa: </span>
                <span className="text-green-400 font-semibold">€{gameState.cashRegister.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-400" />
                <span className="text-slate-300">Giri: </span>
                <span className="text-blue-400 font-semibold">{gameState.totalSpins}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Game Area */}
          <div className="xl:col-span-2 space-y-8">
            {/* Wheel Section */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex flex-col items-center space-y-8">
                  {/* Modern Wheel */}
                  <div className="relative">
                    <FortuneWheel
                      cash={gameState.cashRegister}
                      onSpinComplete={setRotation}
                      isSpinning={isSpinning}
                      onSpin={handleSpin}
                    />
                    
                    {/* Pulse effect when not spinning */}
                    {!isSpinning && (
                      <div className="absolute inset-0 rounded-full border-2 border-yellow-500/30 animate-pulse"></div>
                    )}
                  </div>

                  {/* Clickable instruction */}
                  {!isSpinning && (
                    <p className="text-yellow-400 text-sm font-medium animate-bounce">
                      👆 Clicca sulla ruota per girare!
                    </p>
                  )}

                  {/* Alternative Spin Button */}
                  <Button
                    onClick={handleSpin}
                    disabled={isSpinning}
                    size="lg"
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900 font-bold text-xl px-12 py-6 rounded-2xl shadow-2xl transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:scale-100"
                  >
                    {isSpinning ? (
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-3 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                        Girando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Zap className="h-6 w-6" />
                        GIRA LA RUOTA - €2
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Result Card */}
            {lastResult && (
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-yellow-400 mb-3">🎉 Ultimo Risultato</h3>
                    <div className="text-3xl font-bold text-white mb-4">
                      {lastResult.outcome}
                    </div>
                    {lastResult.outcome !== 'Miss ❌' ? (
                      <Badge className="bg-green-600 hover:bg-green-700 text-white">
                        🏆 Hai vinto!
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-slate-600 text-slate-200">
                        😔 Riprova!
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 xl:grid-cols-1 gap-4">
              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Cassa</CardTitle>
                  <Coins className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">€{gameState.cashRegister.toFixed(2)}</div>
                  <p className="text-xs text-slate-400">
                    Ricavi: €{totalRevenue.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">Tasso Vincita</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-400">{winRate.toFixed(1)}%</div>
                  <p className="text-xs text-slate-400">
                    {gameState.spinHistory.filter(s => s.outcome !== 'Miss ❌').length} vincite
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Eligible Prizes */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Premi Disponibili
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-300">Sbloccati:</span>
                    <Badge className="bg-yellow-600">
                      {eligiblePrizes.length}/{prizes.length}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {eligiblePrizes.slice(0, 5).map((prize) => (
                      <div key={prize.id} className="flex justify-between items-center text-xs p-2 bg-slate-700/50 rounded">
                        <span className="text-slate-200">{prize.emoji} {prize.name}</span>
                        <span className="text-green-400">€{prize.salePrice}</span>
                      </div>
                    ))}
                    {eligiblePrizes.length > 5 && (
                      <p className="text-xs text-slate-400 text-center">+{eligiblePrizes.length - 5} altri...</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Wins */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-yellow-400">🏆 Ultime Vincite</CardTitle>
              </CardHeader>
              <CardContent>
                {recentWins.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400 mb-2">Nessuna vincita ancora...</p>
                    <p className="text-slate-500 text-sm">Gira la ruota per iniziare!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentWins.map((spin, index) => (
                      <div
                        key={spin.id}
                        className={`p-3 rounded-lg border transition-all duration-200 ${
                          index === 0 
                            ? 'bg-yellow-500/10 border-yellow-500/30' 
                            : 'bg-slate-700/50 border-slate-600/50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-white text-sm">{spin.outcome}</span>
                          <Badge 
                            variant={index === 0 ? 'default' : 'secondary'}
                            className={index === 0 ? 'bg-yellow-600 text-slate-900' : ''}
                          >
                            {index === 0 ? '✨ Nuovo!' : new Date(spin.timestamp).toLocaleTimeString()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
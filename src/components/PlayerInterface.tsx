import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Volume2, VolumeX } from 'lucide-react'
import { GameState, SpinResult } from '../types/game'
import { performSpin } from '../utils/gameLogic'

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gold mb-2">🎰 Ruota della Fortuna</h1>
          <p className="text-slate-300">Gira la ruota e vinci fantastici premi!</p>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="border-gold text-gold hover:bg-gold hover:text-slate-900"
          style={{ borderColor: '#D4AF37', color: '#D4AF37' }}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Fortune Wheel */}
        <div className="lg:col-span-2 flex flex-col items-center">
          <div className="relative mb-8">
            {/* Wheel Container */}
            <div className="relative w-96 h-96 mx-auto">
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-gold"></div>
              </div>
              
              {/* Wheel SVG */}
              <svg
                width="384"
                height="384"
                viewBox="0 0 384 384"
                className="drop-shadow-2xl"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? 'transform 3s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
                }}
              >
                {/* Wheel segments */}
                {[
                  { name: 'Birra 🍺', color: '#8B5CF6', angle: 0, weight: 0.14 },
                  { name: 'Spritz 🍹', color: '#06B6D4', angle: 50.4, weight: 0.056 },
                  { name: 'Shot 🥃', color: '#F59E0B', angle: 70.56, weight: 0.233 },
                  { name: 'Drink 🍸', color: '#EF4444', angle: 154.44, weight: 0.0175 },
                  { name: '2 Drink Promo 🍻', color: '#10B981', angle: 160.74, weight: 0.035 },
                  { name: 'Gin Mare 🍋', color: '#F97316', angle: 173.34, weight: 0.00467 },
                  { name: 'Belvedere Vodka 🍾', color: '#3B82F6', angle: 175.02, weight: 0.00467 },
                  { name: 'Grey Goose Vodka 🥂', color: '#8B5CF6', angle: 176.7, weight: 0.00467 },
                  { name: 'Veuve Clicquot 🥂', color: '#EC4899', angle: 178.38, weight: 0.0028 },
                  { name: 'Moët & Chandon 🍾', color: '#14B8A6', angle: 179.39, weight: 0.0028 },
                  { name: 'Miss ❌', color: '#64748B', angle: 180.4, weight: 0.49809 }
                ].map((segment, index) => {
                  const startAngle = index === 0 ? 0 : 
                    [0, 50.4, 70.56, 154.44, 160.74, 173.34, 175.02, 176.7, 178.38, 179.39, 180.4][index]
                  const endAngle = index === 10 ? 360 : 
                    [50.4, 70.56, 154.44, 160.74, 173.34, 175.02, 176.7, 178.38, 179.39, 180.4, 360][index]
                  
                  const startAngleRad = (startAngle * Math.PI) / 180
                  const endAngleRad = (endAngle * Math.PI) / 180
                  
                  const x1 = 192 + 180 * Math.cos(startAngleRad)
                  const y1 = 192 + 180 * Math.sin(startAngleRad)
                  const x2 = 192 + 180 * Math.cos(endAngleRad)
                  const y2 = 192 + 180 * Math.sin(endAngleRad)
                  
                  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
                  
                  const pathData = [
                    `M 192 192`,
                    `L ${x1} ${y1}`,
                    `A 180 180 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    'Z'
                  ].join(' ')
                  
                  const textAngle = (startAngle + endAngle) / 2
                  const textRadius = 120
                  const textX = 192 + textRadius * Math.cos((textAngle * Math.PI) / 180)
                  const textY = 192 + textRadius * Math.sin((textAngle * Math.PI) / 180)
                  
                  return (
                    <g key={index}>
                      <path
                        d={pathData}
                        fill={segment.color}
                        stroke="#1E293B"
                        strokeWidth="2"
                      />
                      <text
                        x={textX}
                        y={textY}
                        fill="white"
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                      >
                        {segment.name.length > 15 ? segment.name.substring(0, 12) + '...' : segment.name}
                      </text>
                    </g>
                  )
                })}
                
                {/* Center circle */}
                <circle cx="192" cy="192" r="30" fill="#D4AF37" stroke="#1E293B" strokeWidth="3" />
                <text x="192" y="192" fill="#1E293B" fontSize="16" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
                  SPIN
                </text>
              </svg>
            </div>
          </div>

          {/* Spin Button */}
          <Button
            onClick={handleSpin}
            disabled={isSpinning}
            size="lg"
            className="bg-gold hover:bg-gold/90 text-slate-900 font-bold text-xl px-12 py-6 rounded-full shadow-2xl transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:scale-100"
          >
            {isSpinning ? (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-3 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                Girando...
              </div>
            ) : (
              `GIRA LA RUOTA - €2`
            )}
          </Button>

          {/* Last Result */}
          {lastResult && (
            <Card 
              className="mt-6 p-6 bg-slate-800/50 backdrop-blur-sm"
              style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gold mb-2">Ultimo Risultato</h3>
                <div className="text-2xl font-bold text-white mb-2">
                  {lastResult.outcome}
                </div>
                {lastResult.outcome !== 'Miss ❌' && (
                  <Badge variant="secondary" className="bg-green-600 text-white">
                    Hai vinto!
                  </Badge>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Recent Wins Sidebar */}
        <div className="space-y-6">
          <Card 
            className="p-6 bg-slate-800/50 backdrop-blur-sm"
            style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}
          >
            <h3 className="text-xl font-bold text-gold mb-4 text-center">🏆 Ultime Vincite</h3>
            
            {recentWins.length === 0 ? (
              <p className="text-slate-400 text-center">Nessuna vincita ancora...</p>
            ) : (
              <div className="space-y-3">
                {recentWins.map((spin, index) => (
                  <div
                    key={spin.id}
                    className={`p-3 rounded-lg border ${
                      index === 0 ? 'border-slate-600' : 'bg-slate-700/50 border-slate-600'
                    }`}
                  style={index === 0 ? { 
                    backgroundColor: 'rgba(212, 175, 55, 0.1)', 
                    borderColor: 'rgba(212, 175, 55, 0.3)' 
                  } : {}}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-white">{spin.outcome}</span>
                      <Badge 
                        variant={index === 0 ? 'default' : 'secondary'} 
                        className={index === 0 ? 'text-slate-900' : ''}
                        style={index === 0 ? { backgroundColor: '#D4AF37' } : {}}
                      >
                        {index === 0 ? 'Nuovo!' : new Date(spin.timestamp).toLocaleTimeString()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Simple Stats */}
          <Card 
            className="p-6 bg-slate-800/50 backdrop-blur-sm"
            style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}
          >
            <h3 className="text-lg font-bold text-gold mb-4 text-center">📊 Le Tue Statistiche</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300">Giri totali:</span>
                <span className="text-white font-semibold">{gameState.totalSpins}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Vincite:</span>
                <span className="text-green-400 font-semibold">
                  {gameState.spinHistory.filter(s => s.outcome !== 'Miss ❌').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Tasso vincita:</span>
                <span className="text-blue-400 font-semibold">
                  {gameState.totalSpins > 0 
                    ? `${((gameState.spinHistory.filter(s => s.outcome !== 'Miss ❌').length / gameState.totalSpins) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
import React, { useState, useEffect } from 'react'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Settings, User, LogOut } from 'lucide-react'
import { PlayerInterface } from './components/PlayerInterface'
import { AdminInterface } from './components/AdminInterface'
import { GameState } from './types/game'
import { Toaster } from './components/ui/toaster'

function App() {
  const [gameState, setGameState] = useState<GameState>({
    cashRegister: 0,
    totalSpins: 0,
    spinHistory: [],
    currentSeed: Math.floor(Math.random() * 1000000)
  })

  const [isAdminMode, setIsAdminMode] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [showLogin, setShowLogin] = useState(false)

  // Load game state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('fortuneWheelGameState')
    if (savedState) {
      try {
        setGameState(JSON.parse(savedState))
      } catch (error) {
        console.error('Error loading saved game state:', error)
      }
    }
  }, [])

  // Save game state to localStorage
  useEffect(() => {
    localStorage.setItem('fortuneWheelGameState', JSON.stringify(gameState))
  }, [gameState])

  const handleAdminLogin = () => {
    // Simple password check - in production, use proper authentication
    if (adminPassword === 'admin123') {
      setIsAuthenticated(true)
      setIsAdminMode(true)
      setShowLogin(false)
      setAdminPassword('')
    } else {
      alert('Password errata!')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setIsAdminMode(false)
    setShowLogin(false)
  }

  // Login Modal
  if (showLogin && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 bg-slate-800 border-gold/20">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gold mb-2">🔐 Accesso Amministratore</h2>
            <p className="text-slate-300">Inserisci la password per accedere al pannello admin</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Password amministratore"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-gold focus:outline-none"
            />
            
            <div className="flex gap-3">
              <Button 
                onClick={handleAdminLogin}
                className="flex-1 bg-gold hover:bg-gold/90 text-slate-900"
              >
                Accedi
              </Button>
              <Button 
                onClick={() => setShowLogin(false)}
                variant="outline"
                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Annulla
              </Button>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
            <p className="text-xs text-slate-400 text-center">
              💡 Password demo: <span className="font-mono text-gold">admin123</span>
            </p>
          </div>
        </Card>
      </div>
    )
  }

  // Admin Interface
  if (isAdminMode && isAuthenticated) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <Button
            onClick={() => setIsAdminMode(false)}
            variant="outline"
            size="sm"
            className="bg-white/90 backdrop-blur-sm"
          >
            <User className="h-4 w-4 mr-2" />
            Vista Giocatore
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="bg-white/90 backdrop-blur-sm"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
        
        <AdminInterface 
          gameState={gameState} 
          onGameStateChange={setGameState} 
        />
        <Toaster />
      </>
    )
  }

  // Player Interface (default)
  return (
    <>
      {/* Admin Access Button */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setShowLogin(true)}
          variant="outline"
          size="sm"
          className="bg-slate-800/90 backdrop-blur-sm border-gold/20 text-gold hover:bg-gold hover:text-slate-900"
        >
          <Settings className="h-4 w-4 mr-2" />
          Admin
        </Button>
      </div>

      <PlayerInterface 
        gameState={gameState} 
        onGameStateChange={setGameState} 
      />
      <Toaster />
    </>
  )
}

export default App
import React, { useState, useEffect } from 'react'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Settings, User, LogOut, Shield } from 'lucide-react'
import { PlayerInterface } from './components/PlayerInterface'
import { AdminInterface } from './components/AdminInterface'
import { AdminAuth } from './components/AdminAuth'
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
  const [showAdminAuth, setShowAdminAuth] = useState(false)

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

  const handleAdminAuthenticated = () => {
    setIsAuthenticated(true)
    setIsAdminMode(true)
    setShowAdminAuth(false)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setIsAdminMode(false)
    setShowAdminAuth(false)
    
    // Clear admin session
    localStorage.removeItem('admin_session_token')
  }

  // Admin Authentication Modal
  if (showAdminAuth) {
    return (
      <AdminAuth 
        onAuthenticated={handleAdminAuthenticated}
        onCancel={() => setShowAdminAuth(false)}
      />
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
          onClick={() => setShowAdminAuth(true)}
          variant="outline"
          size="sm"
          className="bg-slate-800/90 backdrop-blur-sm border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white transition-all duration-200"
        >
          <Shield className="h-4 w-4 mr-2" />
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
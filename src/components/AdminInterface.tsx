import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Settings, 
  TrendingUp, 
  DollarSign, 
  Users, 
  BarChart3,
  Download,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import { GameState } from '../types/game'
import { prizes } from '../data/prizes'

interface AdminInterfaceProps {
  gameState: GameState
  onGameStateChange: (newState: GameState) => void
}

export function AdminInterface({ gameState, onGameStateChange }: AdminInterfaceProps) {
  const [selectedTab, setSelectedTab] = useState('overview')

  // Calculate statistics
  const totalRevenue = gameState.totalSpins * 2 // €2 per spin
  const totalCosts = gameState.spinHistory
    .filter(spin => spin.outcome !== 'Miss ❌')
    .reduce((sum, spin) => {
      const prize = prizes.find(p => spin.outcome.includes(p.name.split(' ')[0]))
      return sum + (prize?.unitCost || 0)
    }, 0)
  
  const profit = totalRevenue - totalCosts
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0

  // Prize statistics
  const prizeStats = prizes.map(prize => {
    const wins = gameState.spinHistory.filter(spin => 
      spin.outcome.includes(prize.name.split(' ')[0])
    ).length
    const revenue = wins * prize.salePrice
    const costs = wins * prize.unitCost
    const prizeProfit = revenue - costs
    
    return {
      ...prize,
      wins,
      revenue,
      costs,
      profit: prizeProfit,
      isEligible: gameState.cashRegister >= prize.salePrice
    }
  })

  // Recent activity (last 10 spins)
  const recentActivity = gameState.spinHistory.slice(-10).reverse()

  const handleReset = () => {
    const resetState: GameState = {
      cashRegister: 0,
      totalSpins: 0,
      spinHistory: [],
      currentSeed: Math.floor(Math.random() * 1000000)
    }
    onGameStateChange(resetState)
  }

  const exportData = () => {
    const data = {
      gameState,
      statistics: {
        totalRevenue,
        totalCosts,
        profit,
        profitMargin
      },
      prizeStats,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fortune-wheel-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">🎰 Pannello Amministratore</h1>
            <p className="text-slate-600 mt-1">Gestione e monitoraggio della Ruota della Fortuna</p>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Esporta Dati
            </Button>
            <Button onClick={handleReset} variant="destructive" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset Sistema
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cassa Attuale</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">€{gameState.cashRegister.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {gameState.cashRegister >= 0 ? 'In positivo' : 'In negativo'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profitto Totale</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{profit.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Margine: {profitMargin.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Giri Totali</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gameState.totalSpins}</div>
              <p className="text-xs text-muted-foreground">
                Ricavi: €{totalRevenue.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasso Vincita</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {gameState.totalSpins > 0 
                  ? `${((gameState.spinHistory.filter(s => s.outcome !== 'Miss ❌').length / gameState.totalSpins) * 100).toFixed(1)}%`
                  : '0%'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Vincite: {gameState.spinHistory.filter(s => s.outcome !== 'Miss ❌').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Panoramica</TabsTrigger>
            <TabsTrigger value="prizes">Premi</TabsTrigger>
            <TabsTrigger value="history">Cronologia</TabsTrigger>
            <TabsTrigger value="settings">Impostazioni</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cash Flow Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Flusso di Cassa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Ricavi Totali</span>
                      <span className="font-bold text-green-600">€{totalRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-medium">Costi Totali</span>
                      <span className="font-bold text-red-600">€{totalCosts.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Profitto Netto</span>
                      <span className={`font-bold ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        €{profit.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Algorithm Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Stato Algoritmo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Cash-Gating Attivo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${gameState.cashRegister >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span>Protezione Overdraft</span>
                    </div>
                    <div className="mt-4 p-3 bg-slate-100 rounded-lg">
                      <div className="text-sm text-slate-600">Seed Corrente</div>
                      <div className="font-mono text-lg">{gameState.currentSeed}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Attività Recente</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">Nessuna attività registrata</p>
                ) : (
                  <div className="space-y-2">
                    {recentActivity.map((spin) => (
                      <div key={spin.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant={spin.outcome === 'Miss ❌' ? 'secondary' : 'default'}>
                            {spin.outcome}
                          </Badge>
                          <span className="text-sm text-slate-600">
                            {new Date(spin.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">Cassa: €{spin.cashAfter.toFixed(2)}</div>
                          <div className="text-xs text-slate-500">Seed: {spin.seed}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prizes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analisi Premi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Premio</th>
                        <th className="text-right p-2">Prezzo</th>
                        <th className="text-right p-2">Costo</th>
                        <th className="text-right p-2">Vincite</th>
                        <th className="text-right p-2">Ricavi</th>
                        <th className="text-right p-2">Profitto</th>
                        <th className="text-center p-2">Stato</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prizeStats.map((prize) => (
                        <tr key={prize.id} className="border-b">
                          <td className="p-2 font-medium">{prize.name}</td>
                          <td className="p-2 text-right">€{prize.salePrice}</td>
                          <td className="p-2 text-right">€{prize.unitCost}</td>
                          <td className="p-2 text-right">{prize.wins}</td>
                          <td className="p-2 text-right">€{prize.revenue.toFixed(2)}</td>
                          <td className={`p-2 text-right font-medium ${prize.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            €{prize.profit.toFixed(2)}
                          </td>
                          <td className="p-2 text-center">
                            <Badge variant={prize.isEligible ? 'default' : 'secondary'}>
                              {prize.isEligible ? 'Disponibile' : 'Bloccato'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cronologia Completa</CardTitle>
              </CardHeader>
              <CardContent>
                {gameState.spinHistory.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">Nessuna cronologia disponibile</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {gameState.spinHistory.slice().reverse().map((spin, index) => (
                      <div key={spin.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-500">#{gameState.spinHistory.length - index}</span>
                          <Badge variant={spin.outcome === 'Miss ❌' ? 'secondary' : 'default'}>
                            {spin.outcome}
                          </Badge>
                          <span className="text-sm text-slate-600">
                            {new Date(spin.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            €{spin.cashBefore.toFixed(2)} → €{spin.cashAfter.toFixed(2)}
                          </div>
                          <div className="text-xs text-slate-500">
                            Incasso: €{spin.revenue.toFixed(2)} | Costo: €{spin.cost.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurazione Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Avviso</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Le modifiche ai parametri del gioco possono influenzare la redditività. 
                      Assicurati di testare accuratamente prima di applicare in produzione.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Parametri Gioco</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Prezzo per giro:</span>
                          <span className="font-medium">€2.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Peso Miss:</span>
                          <span className="font-medium">49.809%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Protezione overdraft:</span>
                          <span className="font-medium text-green-600">Attiva</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Statistiche Algoritmo</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm">Premi sbloccati:</span>
                          <span className="font-medium">
                            {prizeStats.filter(p => p.isEligible).length}/{prizes.length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Probabilità vincita:</span>
                          <span className="font-medium">
                            {(prizeStats.filter(p => p.isEligible).reduce((sum, p) => sum + p.baseWeight, 0) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Margine teorico:</span>
                          <span className="font-medium text-green-600">Positivo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
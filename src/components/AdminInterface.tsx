import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Separator } from './ui/separator'
import { ScrollArea } from './ui/scroll-area'
import { 
  Settings, 
  TrendingUp, 
  DollarSign, 
  Users, 
  BarChart3,
  Download,
  RefreshCw,
  AlertTriangle,
  Activity,
  Shield,
  Target,
  Zap,
  ChevronUp,
  ChevronDown
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              🎰 Pannello Amministratore
            </h1>
            <p className="text-slate-600 mt-2 text-lg">Gestione e monitoraggio avanzato della Ruota della Fortuna</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={exportData} variant="outline" className="flex items-center gap-2 hover:bg-blue-50">
              <Download className="h-4 w-4" />
              Esporta Dati
            </Button>
            <Button onClick={handleReset} variant="destructive" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset Sistema
            </Button>
          </div>
        </div>

        {/* Modern Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Cassa Attuale</CardTitle>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">€{gameState.cashRegister.toFixed(2)}</div>
              <div className="flex items-center gap-1 mt-1">
                {gameState.cashRegister >= 0 ? (
                  <ChevronUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-red-500" />
                )}
                <p className="text-xs text-green-600">
                  {gameState.cashRegister >= 0 ? 'In positivo' : 'In negativo'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={`border-0 shadow-lg ${profit >= 0 ? 'bg-gradient-to-br from-blue-50 to-cyan-50' : 'bg-gradient-to-br from-red-50 to-pink-50'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Profitto Totale</CardTitle>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${profit >= 0 ? 'bg-blue-500' : 'bg-red-500'}`}>
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                €{profit.toFixed(2)}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Margine: {profitMargin.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Giri Totali</CardTitle>
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{gameState.totalSpins}</div>
              <p className="text-xs text-purple-600 mt-1">
                Ricavi: €{totalRevenue.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">Tasso Vincita</CardTitle>
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">
                {gameState.totalSpins > 0 
                  ? `${((gameState.spinHistory.filter(s => s.outcome !== 'Miss ❌').length / gameState.totalSpins) * 100).toFixed(1)}%`
                  : '0%'
                }
              </div>
              <p className="text-xs text-amber-600 mt-1">
                Vincite: {gameState.spinHistory.filter(s => s.outcome !== 'Miss ❌').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Modern Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-12 bg-white shadow-sm rounded-xl">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Panoramica</span>
            </TabsTrigger>
            <TabsTrigger value="prizes" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Premi</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Cronologia</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Impostazioni</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Enhanced Cash Flow Chart */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Flusso di Cassa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
                      <div>
                        <span className="font-medium text-green-800">Ricavi Totali</span>
                        <p className="text-sm text-green-600">{gameState.totalSpins} giri × €2</p>
                      </div>
                      <span className="font-bold text-green-600 text-xl">€{totalRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl border-l-4 border-red-500">
                      <div>
                        <span className="font-medium text-red-800">Costi Totali</span>
                        <p className="text-sm text-red-600">Premi erogati</p>
                      </div>
                      <span className="font-bold text-red-600 text-xl">€{totalCosts.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                      <div>
                        <span className="font-medium text-blue-800">Profitto Netto</span>
                        <p className="text-sm text-blue-600">Margine: {profitMargin.toFixed(1)}%</p>
                      </div>
                      <span className={`font-bold text-xl ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        €{profit.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Algorithm Status */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    Stato Algoritmo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">Cash-Gating</span>
                      </div>
                      <Badge className="bg-green-500 hover:bg-green-600">Attivo</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${gameState.cashRegister >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="font-medium">Protezione Overdraft</span>
                      </div>
                      <Badge variant={gameState.cashRegister >= 0 ? 'default' : 'destructive'}>
                        {gameState.cashRegister >= 0 ? 'Sicuro' : 'Allerta'}
                      </Badge>
                    </div>

                    <Separator />
                    
                    <div className="p-4 bg-slate-100 rounded-lg">
                      <div className="text-sm text-slate-600 mb-1">Seed Corrente</div>
                      <div className="font-mono text-lg font-bold text-slate-900">{gameState.currentSeed}</div>
                      <div className="text-xs text-slate-500 mt-1">Per audit e tracciabilità</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Recent Activity */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Attività Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-lg font-medium">Nessuna attività registrata</p>
                    <p className="text-slate-400">Le attività recenti appariranno qui</p>
                  </div>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {recentActivity.map((spin, index) => (
                        <div key={spin.id} className={`p-4 rounded-xl border-l-4 transition-all duration-200 hover:shadow-md ${
                          spin.outcome === 'Miss ❌' 
                            ? 'bg-slate-50 border-slate-300' 
                            : 'bg-green-50 border-green-400'
                        }`}>
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              <Badge variant={spin.outcome === 'Miss ❌' ? 'secondary' : 'default'} className="mt-1">
                                {spin.outcome}
                              </Badge>
                              <div>
                                <div className="text-sm font-medium text-slate-900">
                                  {new Date(spin.timestamp).toLocaleString()}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  Seed: {spin.seed}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold">€{spin.cashAfter.toFixed(2)}</div>
                              <div className="text-xs text-slate-500">Cassa finale</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prizes" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  Analisi Dettagliata Premi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-slate-200">
                          <th className="text-left p-3 font-semibold text-slate-700">Premio</th>
                          <th className="text-right p-3 font-semibold text-slate-700">Prezzo</th>
                          <th className="text-right p-3 font-semibold text-slate-700">Costo</th>
                          <th className="text-right p-3 font-semibold text-slate-700">Vincite</th>
                          <th className="text-right p-3 font-semibold text-slate-700">Ricavi</th>
                          <th className="text-right p-3 font-semibold text-slate-700">Profitto</th>
                          <th className="text-center p-3 font-semibold text-slate-700">Stato</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prizeStats.map((prize) => (
                          <tr key={prize.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{prize.emoji}</span>
                                <span className="font-medium">{prize.name}</span>
                              </div>
                            </td>
                            <td className="p-3 text-right font-medium">€{prize.salePrice}</td>
                            <td className="p-3 text-right">€{prize.unitCost}</td>
                            <td className="p-3 text-right font-semibold">{prize.wins}</td>
                            <td className="p-3 text-right">€{prize.revenue.toFixed(2)}</td>
                            <td className={`p-3 text-right font-bold ${prize.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              €{prize.profit.toFixed(2)}
                            </td>
                            <td className="p-3 text-center">
                              <Badge variant={prize.isEligible ? 'default' : 'secondary'}>
                                {prize.isEligible ? '✅ Disponibile' : '🔒 Bloccato'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  Cronologia Completa dei Giri
                </CardTitle>
              </CardHeader>
              <CardContent>
                {gameState.spinHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-lg font-medium">Nessuna cronologia disponibile</p>
                    <p className="text-slate-400">I giri effettuati appariranno qui</p>
                  </div>
                ) : (
                  <ScrollArea className="h-96">
                    <div className="space-y-2">
                      {gameState.spinHistory.slice().reverse().map((spin, index) => (
                        <div key={spin.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              #{gameState.spinHistory.length - index}
                            </div>
                            <Badge variant={spin.outcome === 'Miss ❌' ? 'secondary' : 'default'} className="text-sm">
                              {spin.outcome}
                            </Badge>
                            <span className="text-sm text-slate-600">
                              {new Date(spin.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold">
                              €{spin.cashBefore.toFixed(2)} → €{spin.cashAfter.toFixed(2)}
                            </div>
                            <div className="text-xs text-slate-500">
                              Incasso: €{spin.revenue.toFixed(2)} | Costo: €{spin.cost.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-slate-600" />
                  Configurazione Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <span className="font-semibold text-amber-800">Avviso Importante</span>
                    </div>
                    <p className="text-amber-700">
                      Le modifiche ai parametri del gioco possono influenzare significativamente la redditività. 
                      Assicurati di testare accuratamente prima di applicare in produzione.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        Parametri Economici
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="font-medium">Prezzo per giro:</span>
                          <Badge className="bg-green-500 text-white">€2.00</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="font-medium">Peso Miss:</span>
                          <Badge variant="secondary">49.809%</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="font-medium">Protezione overdraft:</span>
                          <Badge className="bg-green-500 text-white">✅ Attiva</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                        Statistiche Algoritmo
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="font-medium">Premi sbloccati:</span>
                          <Badge className="bg-blue-500 text-white">
                            {prizeStats.filter(p => p.isEligible).length}/{prizes.length}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="font-medium">Probabilità vincita:</span>
                          <Badge className="bg-purple-500 text-white">
                            {(prizeStats.filter(p => p.isEligible).reduce((sum, p) => sum + p.baseWeight, 0) * 100).toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="font-medium">Margine teorico:</span>
                          <Badge className="bg-green-500 text-white">✅ Positivo</Badge>
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
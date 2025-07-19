import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Euro, TrendingUp, TrendingDown } from 'lucide-react';

interface CashRegisterProps {
  cash: number;
  totalSpins: number;
  totalProfit: number;
  lastProfit?: number;
}

export function CashRegister({ cash, totalSpins, totalProfit, lastProfit }: CashRegisterProps) {
  const averageProfit = totalSpins > 0 ? totalProfit / totalSpins : 0;
  
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Euro className="w-5 h-5" />
          Cassa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Cash */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${cash > 0 ? 'text-primary cash-pulse' : 'text-muted-foreground'}`}>
            €{cash.toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">Cassa attuale</p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-secondary/50 rounded-lg">
            <div className="text-lg font-semibold text-foreground">{totalSpins}</div>
            <p className="text-xs text-muted-foreground">Spin totali</p>
          </div>
          
          <div className="text-center p-3 bg-secondary/50 rounded-lg">
            <div className={`text-lg font-semibold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              €{totalProfit.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Profitto totale</p>
          </div>
        </div>
        
        {/* Last Spin Result */}
        {lastProfit !== undefined && (
          <div className="flex items-center justify-center gap-2 p-2 bg-secondary/30 rounded-lg">
            {lastProfit > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : lastProfit < 0 ? (
              <TrendingDown className="w-4 h-4 text-red-400" />
            ) : (
              <div className="w-4 h-4" />
            )}
            <span className={`text-sm font-medium ${
              lastProfit > 0 ? 'text-green-400' : 
              lastProfit < 0 ? 'text-red-400' : 
              'text-muted-foreground'
            }`}>
              Ultimo: €{lastProfit.toFixed(2)}
            </span>
          </div>
        )}
        
        {/* Average Profit */}
        {totalSpins > 0 && (
          <div className="text-center">
            <Badge variant={averageProfit >= 0 ? "default" : "destructive"} className="text-xs">
              Media: €{averageProfit.toFixed(2)} per spin
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
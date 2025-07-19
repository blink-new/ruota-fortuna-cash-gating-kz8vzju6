import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { SpinResult } from '../types/game';
import { ScrollArea } from './ui/scroll-area';
import { Clock, TrendingUp, TrendingDown } from 'lucide-react';

interface SpinHistoryProps {
  history: SpinResult[];
}

export function SpinHistory({ history }: SpinHistoryProps) {
  const recentHistory = history.slice(-20).reverse(); // Show last 20 spins, most recent first
  
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Clock className="w-5 h-5" />
          Storico Spin
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ultimi {recentHistory.length} spin
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-2">
            {recentHistory.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Nessun spin ancora effettuato
              </div>
            ) : (
              recentHistory.map((spin, index) => (
                <div
                  key={`${spin.timestamp}-${index}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-foreground">
                        {spin.outcome}
                      </span>
                      {spin.profit > 0 ? (
                        <TrendingUp className="w-3 h-3 text-green-400" />
                      ) : spin.profit < 0 ? (
                        <TrendingDown className="w-3 h-3 text-red-400" />
                      ) : null}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {new Date(spin.timestamp).toLocaleTimeString('it-IT')}
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-1">
                      Cassa: €{spin.cashBefore.toFixed(2)} → €{spin.cashAfter.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <Badge 
                      variant={spin.profit >= 0 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      €{spin.profit.toFixed(2)}
                    </Badge>
                    
                    {spin.cost > 0 && (
                      <div className="text-xs text-muted-foreground">
                        Costo: €{spin.cost.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        {history.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-sm font-medium text-foreground">
                  {history.length}
                </div>
                <div className="text-xs text-muted-foreground">Totali</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-green-400">
                  {history.filter(s => s.profit > 0).length}
                </div>
                <div className="text-xs text-muted-foreground">Profitto</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-red-400">
                  {history.filter(s => s.profit < 0).length}
                </div>
                <div className="text-xs text-muted-foreground">Perdita</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
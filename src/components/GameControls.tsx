import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Play, RotateCcw, AlertTriangle } from 'lucide-react';
import { SPIN_PRICE } from '../data/prizes';

interface GameControlsProps {
  onSpin: () => void;
  onReset: () => void;
  isSpinning: boolean;
  cash: number;
  lastResult: string | null;
}

export function GameControls({ onSpin, onReset, isSpinning, cash, lastResult }: GameControlsProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {/* Last Result */}
          {lastResult && (
            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="text-lg font-semibold text-foreground mb-1">
                Ultimo Risultato
              </div>
              <div className="text-2xl">{lastResult}</div>
            </div>
          )}
          
          {/* Spin Button */}
          <div className="space-y-3">
            <Button
              onClick={onSpin}
              disabled={isSpinning}
              size="lg"
              className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSpinning ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Girando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Play className="w-6 h-6" />
                  GIRA LA RUOTA
                </div>
              )}
            </Button>
            
            <Badge variant="secondary" className="text-sm">
              Costo per spin: €{SPIN_PRICE}
            </Badge>
          </div>
          
          {/* Algorithm Status */}
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-green-400 text-sm">
              <AlertTriangle className="w-4 h-4" />
              Algoritmo Cash-Gating Attivo
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              I premi sono sbloccati solo quando la cassa raggiunge il loro prezzo di vendita
            </div>
          </div>
          
          {/* Reset Button */}
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            className="w-full"
            disabled={isSpinning}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Gioco
          </Button>
          
          {/* Overdraft Protection */}
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Protezione overdraft attiva
            </div>
            <div>La cassa non può mai scendere sotto €0</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
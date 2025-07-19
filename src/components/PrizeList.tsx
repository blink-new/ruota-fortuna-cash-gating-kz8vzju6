import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { prizes } from '../data/prizes';
import { getEligiblePrizes, calculateProbabilities } from '../utils/gameLogic';
import { Lock, Unlock } from 'lucide-react';

interface PrizeListProps {
  cash: number;
}

export function PrizeList({ cash }: PrizeListProps) {
  const eligiblePrizes = getEligiblePrizes(cash);
  const probabilities = calculateProbabilities(cash);
  
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-primary">Premi Disponibili</CardTitle>
        <p className="text-sm text-muted-foreground">
          Cassa necessaria per sbloccare i premi
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {prizes.map((prize) => {
            const isEligible = eligiblePrizes.includes(prize);
            const probability = probabilities.find(p => p.prize.id === prize.id)?.probability || 0;
            
            return (
              <div
                key={prize.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  isEligible 
                    ? 'bg-primary/10 border-primary/30 prize-glow' 
                    : 'bg-secondary/30 border-border opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{prize.emoji}</span>
                  <div>
                    <div className={`font-medium ${isEligible ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {prize.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Prezzo: €{prize.salePrice} • Costo: €{prize.unitCost}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {isEligible ? (
                    <>
                      <Badge variant="default" className="text-xs bg-primary/20 text-primary">
                        {(probability * 100).toFixed(1)}%
                      </Badge>
                      <Unlock className="w-4 h-4 text-green-400" />
                    </>
                  ) : (
                    <>
                      <Badge variant="secondary" className="text-xs">
                        €{(prize.salePrice - cash).toFixed(2)} mancanti
                      </Badge>
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    </>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Miss probability */}
          <div className="flex items-center justify-between p-3 rounded-lg border bg-red-500/10 border-red-500/30">
            <div className="flex items-center gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <div className="font-medium text-foreground">Miss</div>
                <div className="text-xs text-muted-foreground">Nessun premio</div>
              </div>
            </div>
            <Badge variant="destructive" className="text-xs">
              {((1 - probabilities.reduce((sum, p) => sum + p.probability, 0)) * 100).toFixed(1)}%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
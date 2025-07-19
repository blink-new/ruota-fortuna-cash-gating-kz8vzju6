import React, { useState, useRef } from 'react';
import { prizes, MISS_WEIGHT } from '../data/prizes';
import { getEligiblePrizes } from '../utils/gameLogic';

interface FortuneWheelProps {
  cash: number;
  onSpinComplete: (rotation: number) => void;
  isSpinning: boolean;
  onSpin?: () => void;
}

export function FortuneWheel({ cash, onSpinComplete, isSpinning, onSpin }: FortuneWheelProps) {
  const wheelRef = useRef<SVGSVGElement>(null);
  const [rotation, setRotation] = useState(0);

  const eligiblePrizes = getEligiblePrizes(cash);
  const totalSegments = prizes.length + 1; // +1 for miss
  const segmentAngle = 360 / totalSegments;

  // Calculate colors for each segment
  const getSegmentColor = (index: number) => {
    if (index === prizes.length) return '#ef4444'; // Miss segment - red
    
    const prize = prizes[index];
    const isEligible = eligiblePrizes.includes(prize);
    
    if (isEligible) {
      // Eligible prizes get gold gradient
      return index % 2 === 0 ? '#D4AF37' : '#B8941F';
    } else {
      // Ineligible prizes are grayed out
      return index % 2 === 0 ? '#374151' : '#1F2937';
    }
  };

  const getTextColor = (index: number) => {
    if (index === prizes.length) return '#ffffff'; // Miss segment
    
    const prize = prizes[index];
    const isEligible = eligiblePrizes.includes(prize);
    return isEligible ? '#000000' : '#9CA3AF';
  };

  // Create wheel segments
  const segments = [...prizes, { id: -1, name: 'Miss', emoji: '❌', salePrice: 0, unitCost: 0, baseWeight: MISS_WEIGHT }];

  return (
    <div className="relative">
      {/* Wheel container */}
      <div className="relative w-80 h-80 mx-auto">
        <svg
          ref={wheelRef}
          width="320"
          height="320"
          viewBox="0 0 320 320"
          className={`transform transition-transform duration-3000 ease-out cursor-pointer hover:scale-105 transition-transform ${isSpinning ? 'wheel-spin' : ''} ${!isSpinning ? 'hover:drop-shadow-2xl' : ''}`}
          style={{
            '--final-rotation': `${rotation}deg`
          } as React.CSSProperties}
          onClick={onSpin && !isSpinning ? onSpin : undefined}
        >
          {/* Outer ring */}
          <circle
            cx="160"
            cy="160"
            r="155"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="4"
          />
          
          {/* Segments */}
          {segments.map((segment, index) => {
            const startAngle = index * segmentAngle - 90; // -90 to start from top
            const endAngle = (index + 1) * segmentAngle - 90;
            
            const startAngleRad = (startAngle * Math.PI) / 180;
            const endAngleRad = (endAngle * Math.PI) / 180;
            
            const x1 = 160 + 150 * Math.cos(startAngleRad);
            const y1 = 160 + 150 * Math.sin(startAngleRad);
            const x2 = 160 + 150 * Math.cos(endAngleRad);
            const y2 = 160 + 150 * Math.sin(endAngleRad);
            
            const largeArcFlag = segmentAngle > 180 ? 1 : 0;
            
            const pathData = [
              `M 160 160`,
              `L ${x1} ${y1}`,
              `A 150 150 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');
            
            // Text position
            const textAngle = startAngle + segmentAngle / 2;
            const textAngleRad = (textAngle * Math.PI) / 180;
            const textX = 160 + 100 * Math.cos(textAngleRad);
            const textY = 160 + 100 * Math.sin(textAngleRad);
            
            return (
              <g key={index}>
                {/* Segment */}
                <path
                  d={pathData}
                  fill={getSegmentColor(index)}
                  stroke="#1F2937"
                  strokeWidth="1"
                />
                
                {/* Text */}
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={getTextColor(index)}
                  fontSize="12"
                  fontWeight="600"
                  transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                >
                  <tspan x={textX} dy="-8">{segment.emoji}</tspan>
                  <tspan x={textX} dy="16" fontSize="10">{segment.name}</tspan>
                </text>
              </g>
            );
          })}
          
          {/* Center circle */}
          <circle
            cx="160"
            cy="160"
            r="20"
            fill="#D4AF37"
            stroke="#B8941F"
            strokeWidth="2"
          />
        </svg>
        
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500"></div>
        </div>
      </div>
    </div>
  );
}
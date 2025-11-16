import { Card } from "@/components/ui/card";

interface DirectionalTiltData {
  bear: number;
  neutral: number;
  bull: number;
}

interface TileDirectionalTiltProps {
  tilt: 'BULLISH' | 'NEUTRAL' | 'BEARISH' | DirectionalTiltData;
  onClick: () => void;
}

export function TileDirectionalTilt({ tilt, onClick }: TileDirectionalTiltProps) {
  // Determine the dominant direction
  let dominantTilt: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  let probabilities: DirectionalTiltData;
  
  if (typeof tilt === 'string') {
    dominantTilt = tilt;
    probabilities = { bear: 0, neutral: 0, bull: 0 };
  } else {
    probabilities = tilt;
    // Find dominant probability
    const max = Math.max(probabilities.bear, probabilities.neutral, probabilities.bull);
    if (max === probabilities.bull) {
      dominantTilt = 'BULLISH';
    } else if (max === probabilities.bear) {
      dominantTilt = 'BEARISH';
    } else {
      dominantTilt = 'NEUTRAL';
    }
  }

  const segments = [
    { id: 'bearish', label: 'Bear', active: dominantTilt === 'BEARISH', color: 'bg-bear', prob: probabilities.bear },
    { id: 'neutral', label: 'Neutral', active: dominantTilt === 'NEUTRAL', color: 'bg-neutral', prob: probabilities.neutral },
    { id: 'bullish', label: 'Bull', active: dominantTilt === 'BULLISH', color: 'bg-bull', prob: probabilities.bull },
  ];

  return (
    <Card 
      className="p-4 hover-elevate cursor-pointer transition-all duration-300"
      onClick={onClick}
      data-testid="tile-directional-tilt"
    >
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">Directional Tilt</h3>
        <p className="text-xs text-muted-foreground">Market leaning: <span className="font-semibold text-foreground">{dominantTilt}</span></p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {segments.map((segment) => (
          <div
            key={segment.id}
            className={`
              h-12 rounded-md flex flex-col items-center justify-center text-xs font-semibold
              transition-all duration-300
              ${segment.active 
                ? `${segment.color} text-white shadow-lg` 
                : 'bg-secondary text-muted-foreground'
              }
            `}
          >
            {segment.label}
            {probabilities && segment.prob > 0 && (
              <span className="text-xs opacity-75">{(segment.prob * 100).toFixed(0)}%</span>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Model-derived · Click for explanation
      </p>
    </Card>
  );
}

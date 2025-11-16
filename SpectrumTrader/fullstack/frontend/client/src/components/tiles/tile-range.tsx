import { Card } from "@/components/ui/card";

interface TileRangeProps {
  title: string;
  subtitle?: string;
  rangePts: [number, number];
  close: number;
  onClick: () => void;
  testId: string;
}

export function TileRange({ title, subtitle, rangePts, close, onClick, testId }: TileRangeProps) {
  const safeRangePts = rangePts ?? [0, 0];
  const safeClose = close ?? 0;
  
  const [low, high] = safeRangePts;
  const lowPrice = Math.round(safeClose + low);
  const highPrice = Math.round(safeClose + high);
  const midPrice = Math.round((lowPrice + highPrice) / 2);
  
  const currentPosition = ((safeClose - lowPrice) / (highPrice - lowPrice)) * 100;
  const clampedPosition = Math.max(0, Math.min(100, currentPosition));

  return (
    <Card 
      className="p-4 hover-elevate cursor-pointer transition-all duration-300"
      onClick={onClick}
      data-testid={testId}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative h-8 bg-secondary rounded-md overflow-hidden">
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-bull/20 to-bull/30 transition-all duration-500"
            style={{ width: '100%' }}
          />
          
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-0.5 h-full bg-accent z-10"
            style={{ left: `${clampedPosition}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent" />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="text-muted-foreground">
            Low: <span className="font-mono font-semibold text-foreground">{lowPrice}</span>
          </div>
          <div className="text-muted-foreground">
            Mid: <span className="font-mono font-semibold text-foreground">{midPrice}</span>
          </div>
          <div className="text-muted-foreground">
            High: <span className="font-mono font-semibold text-foreground">{highPrice}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        Click for explanation
      </p>
    </Card>
  );
}

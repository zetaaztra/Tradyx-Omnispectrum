import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SpotPriceData {
  current: number;
  change_percent: number;
  ohlc: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
}

interface TileSpotPriceProps {
  data: SpotPriceData;
  onClick: () => void;
}

export function TileSpotPrice({ data, onClick }: TileSpotPriceProps) {
  const safeData = data ?? {
    current: 0,
    change_percent: 0,
    ohlc: { open: 0, high: 0, low: 0, close: 0 }
  };

  const isPositive = safeData.change_percent > 0;
  const isNegative = safeData.change_percent < 0;

  const signClass = isPositive
    ? "text-bull"
    : isNegative
    ? "text-bear"
    : "text-neutral";

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <Card
      className="p-4 hover-elevate cursor-pointer transition-all duration-300"
      onClick={onClick}
      data-testid="tile-spot-price"
    >
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">Spot Price</h3>
      </div>

      <div className="flex items-baseline gap-2 mb-4">
        <Icon className={`h-5 w-5 ${signClass}`} />
        <span className={`font-mono text-2xl sm:text-3xl font-bold ${signClass}`}>
          ₹{safeData.current.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <div className={`text-sm font-semibold mb-3 ${signClass}`}>
        {isPositive ? '+' : ''}{safeData.change_percent.toFixed(2)}%
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Open</span>
          <span className="font-mono font-semibold text-foreground">
            ₹{safeData.ohlc.open.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">High</span>
          <span className="font-mono font-semibold text-foreground">
            ₹{safeData.ohlc.high.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Low</span>
          <span className="font-mono font-semibold text-foreground">
            ₹{safeData.ohlc.low.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Close</span>
          <span className="font-mono font-semibold text-foreground">
            ₹{safeData.ohlc.close.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </Card>
  );
}

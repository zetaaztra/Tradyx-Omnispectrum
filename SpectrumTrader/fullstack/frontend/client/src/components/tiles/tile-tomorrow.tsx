import { Card } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TileTomorrowProps {
  pts: number;
  close: number;
  historicalClose: number[];
  lastUpdate?: string;
  onClick: () => void;
}

const chartConfig = {
  close: {
    label: "Price",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function TileTomorrow({ pts, close, historicalClose, lastUpdate, onClick }: TileTomorrowProps) {
  const safePts = pts ?? 0;
  const safeClose = close ?? 0;
  const safeHistoricalClose = historicalClose ?? [safeClose];
  
  const implied = Math.round(safeClose + safePts);
  const isPositive = safePts > 0;
  const isNegative = safePts < 0;
  
  const signClass = isPositive 
    ? "text-bull" 
    : isNegative 
    ? "text-bear" 
    : "text-neutral";

  const chartData = safeHistoricalClose.slice(-30).map((value, index) => ({
    index,
    close: value,
  }));

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <Card 
      className="p-4 sm:p-6 col-span-full sm:col-span-2 sm:row-span-2 hover-elevate cursor-pointer transition-all duration-300"
      onClick={onClick}
      data-testid="tile-tomorrow"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Tomorrow</h3>
        {lastUpdate && (
          <span className="text-xs text-muted-foreground">
            Updated {lastUpdate}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-3 sm:gap-4 mb-2">
        <div className="flex items-baseline gap-2">
          <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${signClass}`} />
          <span className={`font-mono text-3xl sm:text-4xl md:text-5xl font-bold ${signClass}`}>
            {safePts > 0 ? `+${safePts}` : safePts}
          </span>
          <span className="text-base sm:text-lg text-muted-foreground">pts</span>
        </div>
      </div>

      <div className="text-xs sm:text-sm text-muted-foreground mb-4">
        Implied: <span className="font-mono font-semibold text-foreground">{implied}</span>
      </div>

      <div className="h-16 sm:h-20">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillClose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "hsl(var(--bull))" : isNegative ? "hsl(var(--bear))" : "hsl(var(--neutral))"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPositive ? "hsl(var(--bull))" : isNegative ? "hsl(var(--bear))" : "hsl(var(--neutral))"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="close"
                stroke={isPositive ? "hsl(var(--bull))" : isNegative ? "hsl(var(--bear))" : "hsl(var(--neutral))"}
                strokeWidth={2}
                fill="url(#fillClose)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        Click for detailed explanation
      </p>
    </Card>
  );
}

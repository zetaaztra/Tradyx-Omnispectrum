import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

interface TilePatternMatchProps {
  index: number;
  historicalPattern?: number[];
  onClick: () => void;
}

const chartConfig = {
  pattern: {
    label: "Match Score",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function TilePatternMatch({ index, historicalPattern, onClick }: TilePatternMatchProps) {
  const safeIndex = index ?? 0;
  const normalizedIndex = Math.min(100, Math.max(0, safeIndex));
  
  const getQualityLabel = () => {
    if (normalizedIndex >= 70) return { label: 'High similarity', color: 'text-bull' };
    if (normalizedIndex >= 40) return { label: 'Moderate match', color: 'text-neutral' };
    return { label: 'Low precedent', color: 'text-bear' };
  };

  const quality = getQualityLabel();

  const chartData = historicalPattern && historicalPattern.length > 0
    ? historicalPattern.slice(-20).map((value, i) => ({ index: i, pattern: Math.min(100, Math.max(0, value)) }))
    : Array.from({ length: 20 }, (_, i) => ({ index: i, pattern: 50 + Math.random() * 20 }));

  return (
    <Card 
      className="p-4 hover-elevate cursor-pointer transition-all duration-300"
      onClick={onClick}
      data-testid="tile-pattern-match"
    >
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">Pattern Match Index</h3>
        <p className={`text-xs ${quality.color}`}>{quality.label}</p>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-mono font-bold text-foreground">
            {normalizedIndex}
          </span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>
        <Progress value={normalizedIndex} className="h-2" />
      </div>

      <div className="h-12">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="pattern"
                stroke="hsl(var(--chart-1))"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        Click for explanation
      </p>
    </Card>
  );
}

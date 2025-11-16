import { Card } from "@/components/ui/card";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

interface TileEnvelopeProps {
  title: string;
  envelope: [number, number];
  close: number;
  historicalClose: number[];
  onClick: () => void;
  testId: string;
}

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--chart-1))",
  },
  upper: {
    label: "Upper",
    color: "hsl(var(--bull))",
  },
  lower: {
    label: "Lower",
    color: "hsl(var(--bear))",
  },
} satisfies ChartConfig;

export function TileEnvelope({ title, envelope, close, historicalClose, onClick, testId }: TileEnvelopeProps) {
  const safeEnvelope = envelope ?? [0, 0];
  const safeClose = close ?? 0;
  const safeHistoricalClose = historicalClose ?? [safeClose];
  
  const [low, high] = safeEnvelope;
  const lowPrice = Math.round(safeClose + low);
  const highPrice = Math.round(safeClose + high);
  const isPositive = (low + high) / 2 > 0;

  const chartData = safeHistoricalClose.slice(-15).map((value, index) => ({
    index,
    price: value,
    upper: index === safeHistoricalClose.length - 1 ? highPrice : value,
    lower: index === safeHistoricalClose.length - 1 ? lowPrice : value,
  }));

  return (
    <Card 
      className="p-4 hover-elevate cursor-pointer transition-all duration-300"
      onClick={onClick}
      data-testid={testId}
    >
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <div className="text-xs text-muted-foreground">
          Range: <span className="font-mono font-semibold text-foreground">{lowPrice}</span>
          {" – "}
          <span className="font-mono font-semibold text-foreground">{highPrice}</span>
        </div>
      </div>

      <div className="h-24">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`fillEnvelope-${testId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "hsl(var(--bull))" : "hsl(var(--bear))"} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={isPositive ? "hsl(var(--bull))" : "hsl(var(--bear))"} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? "hsl(var(--bull))" : "hsl(var(--bear))"}
                strokeWidth={1.5}
                fill={`url(#fillEnvelope-${testId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        Click for explanation
      </p>
    </Card>
  );
}

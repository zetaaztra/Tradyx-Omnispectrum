import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TileMultidayProps {
  title: string;
  pts: number;
  showConfidence?: boolean;
  confidenceProb?: number;
  onClick: () => void;
  testId: string;
}

export function TileMultiday({ title, pts, showConfidence, confidenceProb, onClick, testId }: TileMultidayProps) {
  // Provide defaults for undefined values
  const safePts = pts ?? 0;
  const safeConfidenceProb = confidenceProb ?? 0;
  
  const isPositive = safePts > 0;
  const isNegative = safePts < 0;
  
  const signClass = isPositive 
    ? "text-bull" 
    : isNegative 
    ? "text-bear" 
    : "text-neutral";

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const ArrowIcon = isPositive ? ArrowUp : ArrowDown;

  const getConfidenceBadge = () => {
    if (!showConfidence || confidenceProb === undefined) return null;
    
    const variant = safeConfidenceProb < 0.3 
      ? "default" 
      : safeConfidenceProb < 0.6 
      ? "secondary" 
      : "destructive";
    
    const label = safeConfidenceProb < 0.3 
      ? "Stable" 
      : safeConfidenceProb < 0.6 
      ? "Moderate" 
      : "Volatile";

    return (
      <Badge variant={variant} className="text-xs">
        {label}
      </Badge>
    );
  };

  return (
    <Card 
      className="p-4 hover-elevate cursor-pointer transition-all duration-300"
      onClick={onClick}
      data-testid={testId}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {getConfidenceBadge()}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <Icon className={`h-5 w-5 ${signClass}`} />
        <span className={`font-mono text-2xl sm:text-3xl font-bold ${signClass}`}>
          {safePts > 0 ? `+${safePts}` : safePts}
        </span>
        <span className="text-sm text-muted-foreground">pts</span>
      </div>

      {!showConfidence && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <ArrowIcon className={`h-3 w-3 ${signClass}`} />
          <span>Cumulative movement</span>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-3">
        Click for explanation
      </p>
    </Card>
  );
}

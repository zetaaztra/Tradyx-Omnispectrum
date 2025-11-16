import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface TileOptionRadarProps {
  title: string;
  status: 'FAVORABLE' | 'NEUTRAL' | 'CAUTION' | 'AVOID';
  onClick: () => void;
  testId: string;
}

export function TileOptionRadar({ title, status, onClick, testId }: TileOptionRadarProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'FAVORABLE':
        return {
          icon: CheckCircle2,
          color: 'text-bull',
          bg: 'bg-bull/10',
          variant: 'default' as const,
        };
      case 'NEUTRAL':
        return {
          icon: AlertCircle,
          color: 'text-neutral',
          bg: 'bg-neutral/10',
          variant: 'secondary' as const,
        };
      case 'CAUTION':
        return {
          icon: AlertCircle,
          color: 'text-destructive',
          bg: 'bg-destructive/10',
          variant: 'destructive' as const,
        };
      case 'AVOID':
        return {
          icon: XCircle,
          color: 'text-bear',
          bg: 'bg-bear/10',
          variant: 'destructive' as const,
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-neutral',
          bg: 'bg-neutral/10',
          variant: 'secondary' as const,
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Card 
      className="p-4 hover-elevate cursor-pointer transition-all duration-300"
      onClick={onClick}
      data-testid={testId}
    >
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>

      <div className={`flex items-center gap-3 p-3 rounded-md ${config.bg} mb-3`}>
        <Icon className={`h-5 w-5 ${config.color} shrink-0`} />
        <div>
          <Badge variant={config.variant} className="mb-1">
            {status}
          </Badge>
          <p className="text-xs text-muted-foreground">
            {status === 'FAVORABLE' && 'Ideal conditions'}
            {status === 'NEUTRAL' && 'Standard conditions'}
            {status === 'CAUTION' && 'Heightened risk'}
            {status === 'AVOID' && 'Unfavorable setup'}
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Click for explanation
      </p>
    </Card>
  );
}

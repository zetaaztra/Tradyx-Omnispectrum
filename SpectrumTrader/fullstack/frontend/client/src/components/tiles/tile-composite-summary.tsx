import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface TileCompositeSummaryProps {
  summary: string | Record<string, any>;
  onClick: () => void;
}

export function TileCompositeSummary({ summary, onClick }: TileCompositeSummaryProps) {
  // Handle both string and object formats
  const summaryText = typeof summary === 'string' 
    ? summary 
    : typeof summary === 'object' && summary !== null
    ? Object.values(summary).join('. ').substring(0, 200) + '...'
    : 'No summary available';

  return (
    <Card 
      className="p-4 hover-elevate cursor-pointer transition-all duration-300 col-span-full"
      onClick={onClick}
      data-testid="tile-composite-summary"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-md bg-accent/10 shrink-0">
          <FileText className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground mb-2">Composite Summary</h3>
          <p className="text-sm sm:text-base leading-relaxed font-medium text-foreground">
            {summaryText}
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            Click to expand for model metadata and full disclaimer
          </p>
        </div>
      </div>
    </Card>
  );
}

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import { ChevronDown, Info } from "lucide-react";
import { useState } from "react";

export function HowToUseSection() {
  const [open, setOpen] = useState(false);

  const guides = [
    {
      tile: "Tomorrow Forecast",
      description: "The large number shows expected point movement tomorrow. Green = bullish, red = bearish. Use this as your primary directional bias for intraday trades.",
    },
    {
      tile: "2-Day & 3-Day Forecasts",
      description: "Cumulative point movements over 2-3 days. The 3-day tile includes a confidence badge showing volatility risk.",
    },
    {
      tile: "Weekly & Monthly Ranges",
      description: "Shows projected low-high boundaries. The vertical line marks current price position within the range. Use these for setting profit targets and stop-losses.",
    },
    {
      tile: "Directional Tilt",
      description: "Traffic light visualization of overall market bias. Highlighted segment shows dominant direction based on multiple models.",
    },
    {
      tile: "Envelope Charts",
      description: "Short-term (tomorrow) and medium-term (weekly) price channels. Shaded bands represent model confidence intervals.",
    },
    {
      tile: "Option Sellers Radar",
      description: "Guidance for premium sellers. FAVORABLE = low volatility risk, good for selling credit spreads. AVOID = potential volatility spike ahead.",
    },
    {
      tile: "Option Buyers Radar",
      description: "Guidance for option buyers. FAVORABLE = volatility expansion likely, attractive for long options. CAUTION = unfavorable risk/reward.",
    },
    {
      tile: "Pattern Match Index",
      description: "0-100 score showing similarity to historical patterns. Higher scores (70+) indicate strong precedent. Lower scores (<40) suggest unique conditions.",
    },
    {
      tile: "Composite Summary",
      description: "Plain-English synthesis of all forecasts. Click to expand for model metadata and transparency information.",
    },
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
      <Collapsible open={open} onOpenChange={setOpen}>
        <Card className="p-4 sm:p-6">
          <CollapsibleTrigger className="flex items-center justify-between w-full group" data-testid="button-how-to-use-toggle">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-accent/10">
                <Info className="h-5 w-5 text-accent" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">How to Use This Dashboard</h2>
            </div>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>

          <CollapsibleContent className="pt-6">
            <div className="space-y-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This dashboard provides institutional-grade market forecasts for intraday and short-term traders. 
                  Each tile displays numeric point forecasts and directional signals. Click any tile for detailed explanations.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {guides.map((guide, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">{guide.tile}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {guide.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-card-border">
                <h3 className="text-sm font-semibold text-foreground mb-2">Quick Tips</h3>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Focus on the Tomorrow tile for primary directional bias</li>
                  <li>Use range projections to set realistic targets and stops</li>
                  <li>Combine forecasts with your own technical analysis</li>
                  <li>Higher Pattern Match scores indicate stronger historical precedent</li>
                  <li>Always manage risk - forecasts are probabilistic, not guarantees</li>
                </ul>
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}

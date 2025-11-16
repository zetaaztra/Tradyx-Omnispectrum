import { Button } from "@/components/ui/button";
import { Moon, Sun, RefreshCw } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";

interface DashboardHeaderProps {
  lastUpdate?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export function DashboardHeader({ lastUpdate, isRefreshing = false, onRefresh }: DashboardHeaderProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const formatLastUpdate = (timestamp?: string) => {
    if (!timestamp) return "—";
    try {
      const date = new Date(timestamp);
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year} • ${hours}:${minutes}`;
    } catch {
      return "—";
    }
  };

  const isMarketHours = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeInMinutes = hours * 60 + minutes;
    const marketOpen = 9 * 60 + 15; // 9:15 AM
    const marketClose = 15 * 60 + 30; // 3:30 PM
    return timeInMinutes >= marketOpen && timeInMinutes <= marketClose;
  };

  return (
    <header className="border-b border-card-border bg-card px-4 sm:px-6 py-3 sm:py-4">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
            Tradyxa OmniSpectrum — NIFTY Move Predictor Engine
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Point predictions, volatility structure, and option-friendly analytics powered by advanced models.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end text-right">
            <p className="text-xs font-medium text-muted-foreground">Last Update</p>
            <p className="text-sm font-semibold">{formatLastUpdate(lastUpdate)}</p>
            {!isMarketHours() && (
              <p className="text-xs text-amber-600 dark:text-amber-400">Market Closed</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isRefreshing}
              data-testid="button-refresh"
              className="shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="sr-only">Refresh Data</span>
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
              className="shrink-0"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle Theme</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

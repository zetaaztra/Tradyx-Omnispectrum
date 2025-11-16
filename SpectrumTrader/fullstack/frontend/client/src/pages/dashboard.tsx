import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardFooter } from "@/components/dashboard-footer";
import { HowToUseSection } from "@/components/how-to-use-section";
import { DisclaimerModal } from "@/components/consent-disclaimer-modal";
import { CookieConsentModal } from "@/components/consent-cookie-modal";
import { TileExplanationModal } from "@/components/tile-explanation-modal";
import { TileTomorrow } from "@/components/tiles/tile-tomorrow";
import { TileMultiday } from "@/components/tiles/tile-multiday";
import { TileRange } from "@/components/tiles/tile-range";
import { TileDirectionalTilt } from "@/components/tiles/tile-directional-tilt";
import { TileEnvelope } from "@/components/tiles/tile-envelope";
import { TileOptionRadar } from "@/components/tiles/tile-option-radar";
import { TilePatternMatch } from "@/components/tiles/tile-pattern-match";
import { TileCompositeSummary } from "@/components/tiles/tile-composite-summary";
import { TileSpotPrice } from "@/components/tiles/tile-spot-price";
import { TileIndiaVIX } from "@/components/tiles/tile-india-vix";
import { getDisclaimerAccepted, setDisclaimerAccepted, hasShownConsentDialog, setConsentPreferences } from "@/lib/consent";
import { tileExplanations } from "@shared/schema";
import type { ConsentPreferences } from "@/lib/consent";
import type { OmniSpectrumData } from "@shared/schema";
import useSWR from "swr";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard() {
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [explanationTile, setExplanationTile] = useState<keyof typeof tileExplanations | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<OmniSpectrumData>(
    '/api/omnispectrum',
    fetcher,
    { 
      refreshInterval: 30 * 60 * 1000,
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  useEffect(() => {
    const { accepted } = getDisclaimerAccepted();
    if (!accepted) {
      setShowDisclaimer(true);
    } else if (!hasShownConsentDialog()) {
      setShowConsent(true);
    }
  }, []);

  const handleDisclaimerAccept = () => {
    setDisclaimerAccepted();
    setShowDisclaimer(false);
    if (!hasShownConsentDialog()) {
      setShowConsent(true);
    }
  };

  const handleConsentSave = (preferences: ConsentPreferences) => {
    setConsentPreferences(preferences);
    setShowConsent(false);
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/omnispectrum/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      
      if (result.data) {
        mutate(result.data, false);
      }
    } catch (err) {
      console.error("Failed to refresh data:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const openExplanation = (tile: keyof typeof tileExplanations) => {
    setExplanationTile(tile);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <p className="text-sm text-muted-foreground">Loading market data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 p-6">
          <div className="flex justify-center">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold">Unable to Load Data</h2>
          <p className="text-sm text-muted-foreground">Please refresh the page to try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader 
        lastUpdate={data?.timestamp}
        isRefreshing={isRefreshing}
        onRefresh={handleRefreshData}
      />

      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up">
            <TileSpotPrice
              data={data.spotPrice}
              onClick={() => openExplanation('spotPrice')}
            />

            <TileIndiaVIX
              data={data.indiaVIX}
              onClick={() => openExplanation('indiaVIX')}
            />

            <TileTomorrow
              pts={data.tiles.tomorrow_expected_move_pts}
              close={data.close}
              historicalClose={data.historicalClose}
              lastUpdate={data.lastUpdate}
              onClick={() => openExplanation('tomorrow')}
            />

            <TileMultiday
              title="2-Day"
              pts={data.tiles.twoday_expected_move_pts}
              onClick={() => openExplanation('twoday')}
              testId="tile-twoday"
            />

            <TileMultiday
              title="3-Day"
              pts={data.tiles.threeday_expected_move_pts}
              showConfidence
              confidenceProb={data.tiles.volatility_expansion_prob}
              onClick={() => openExplanation('threeday')}
              testId="tile-threeday"
            />

            <TileRange
              title="Weekly Range"
              subtitle="5 trading days"
              rangePts={data.tiles.weekly_range_pts}
              close={data.close}
              onClick={() => openExplanation('weeklyRange')}
              testId="tile-weekly-range"
            />

            <TileRange
              title="Monthly Range"
              subtitle="21 trading days"
              rangePts={data.tiles.monthly_range_pts}
              close={data.close}
              onClick={() => openExplanation('monthlyRange')}
              testId="tile-monthly-range"
            />

            <TileDirectionalTilt
              tilt={data.tiles.directional_tilt}
              onClick={() => openExplanation('directionalTilt')}
            />

            <TileEnvelope
              title="Short-Term Envelope"
              envelope={data.tiles.short_term_envelope}
              close={data.close}
              historicalClose={data.historicalClose}
              onClick={() => openExplanation('shortTermEnvelope')}
              testId="tile-short-term-envelope"
            />

            <TileEnvelope
              title="Medium-Term Envelope"
              envelope={data.tiles.medium_term_envelope}
              close={data.close}
              historicalClose={data.historicalClose}
              onClick={() => openExplanation('mediumTermEnvelope')}
              testId="tile-medium-term-envelope"
            />

            <TileOptionRadar
              title="Option Sellers Radar"
              status={data.tiles.option_sellers_status}
              onClick={() => openExplanation('optionSellers')}
              testId="tile-option-sellers"
            />

            <TileOptionRadar
              title="Option Buyers Radar"
              status={data.tiles.option_buyers_status}
              onClick={() => openExplanation('optionBuyers')}
              testId="tile-option-buyers"
            />

            <TilePatternMatch
              index={data.tiles.pattern_match_index}
              historicalPattern={data.historicalPatternMatch}
              onClick={() => openExplanation('patternMatch')}
            />

            <TileCompositeSummary
              summary={data.tiles.composite_summary}
              onClick={() => openExplanation('compositeSummary')}
            />
          </div>
        </div>
      </main>

      <HowToUseSection />
      <DashboardFooter />

      <DisclaimerModal open={showDisclaimer} onAccept={handleDisclaimerAccept} />
      <CookieConsentModal open={showConsent} onSave={handleConsentSave} />
      
      {explanationTile && (
        <TileExplanationModal
          open={!!explanationTile}
          onClose={() => setExplanationTile(null)}
          tileKey={explanationTile}
        />
      )}
    </div>
  );
}

import { z } from "zod";

// Omnispectrum Dashboard Data Schema
export const omnisSpectrumDataSchema = z.object({
  close: z.number(),
  lastUpdate: z.string(),
  modelVersion: z.string().optional(),
  modelDate: z.string().optional(),
  mae: z.number().optional(),
  spotPrice: z.object({
    current: z.number(),
    change_percent: z.number(),
    ohlc: z.object({
      open: z.number(),
      high: z.number(),
      low: z.number(),
      close: z.number(),
    }),
  }).optional(),
  indiaVIX: z.object({
    current: z.number(),
    change_percent: z.number(),
    ohlc: z.object({
      open: z.number(),
      high: z.number(),
      low: z.number(),
      close: z.number(),
    }),
  }).optional(),
  tiles: z.object({
    tomorrow_expected_move_pts: z.number(),
    twoday_expected_move_pts: z.number(),
    threeday_expected_move_pts: z.number(),
    weekly_range_pts: z.tuple([z.number(), z.number()]),
    monthly_range_pts: z.tuple([z.number(), z.number()]),
    directional_tilt: z.object({
      bear: z.number(),
      neutral: z.number(),
      bull: z.number(),
    }).or(z.enum(['BULLISH', 'NEUTRAL', 'BEARISH'])),
    short_term_envelope: z.tuple([z.number(), z.number()]),
    medium_term_envelope: z.tuple([z.number(), z.number()]),
    volatility_expansion_prob: z.number(),
    option_sellers_status: z.enum(['FAVORABLE', 'NEUTRAL', 'AVOID']),
    option_buyers_status: z.enum(['FAVORABLE', 'NEUTRAL', 'CAUTION', 'AVOID']),
    pattern_match_index: z.number(),
    composite_summary: z.string(),
  }),
  forecasts: z.object({
    tomorrow: z.object({
      median: z.number(),
      p10: z.number(),
      p90: z.number(),
    }).optional(),
  }).optional(),
  historicalClose: z.array(z.number()),
  historicalPatternMatch: z.array(z.number()).optional(),
});

export type OmniSpectrumData = z.infer<typeof omnisSpectrumDataSchema>;

// Tile explanation content
export const tileExplanations: Record<string, { title: string; description: string }> = {
  spotPrice: {
    title: "Spot Price",
    description: "Current trading price of NIFTY 50 index with real-time change percentage and OHLC (Open, High, Low, Close) values from the current trading session. The trend indicator shows if the market is trading above (green) or below (red) its opening price.",
  },
  indiaVIX: {
    title: "India VIX",
    description: "Volatility Index measuring the market's expected volatility level. Values are shown in percentages with OHLC breakdown. Decreasing VIX (downward arrow) suggests increasing market confidence, while increasing VIX suggests caution. VIX levels below 15% indicate calm conditions, above 20% suggest elevated fear.",
  },
  tomorrow: {
    title: "Tomorrow - Point Forecast",
    description: "This displays the expected market movement in points for tomorrow's trading session. The large numeric value shows the directional bias (positive = upward, negative = downward). The implied price is calculated by adding this point movement to today's close. The sparkline shows recent price action with a shaded envelope representing tomorrow's expected range.",
  },
  twoday: {
    title: "2-Day Point Forecast",
    description: "Expected cumulative point movement over the next two trading days. This helps identify short-term momentum and provides context for multi-day position planning. The arrow indicates directional change compared to the previous forecast.",
  },
  threeday: {
    title: "3-Day Point Forecast",
    description: "Three-day cumulative point forecast with a confidence indicator. The badge color (green/amber/red) reflects volatility expansion probability - green indicates stable conditions favorable for directional plays, while red suggests increased uncertainty requiring tighter risk management.",
  },
  weeklyRange: {
    title: "Weekly Range Projection",
    description: "Projected price range for the upcoming trading week. The horizontal band shows the expected low-to-high boundary, with the current price marked as a vertical line. This helps set realistic profit targets and stop-loss levels for swing trades.",
  },
  monthlyRange: {
    title: "Monthly Range Projection",
    description: "21-trading-day range projection providing a broader market context. Useful for position sizing and understanding the larger directional bias beyond intraday noise. The wider band accounts for increased uncertainty over longer timeframes.",
  },
  directionalTilt: {
    title: "Directional Tilt",
    description: "Overall market bias derived from multiple technical and statistical models. The traffic light visualization shows which direction has the strongest probability: BULLISH (green) favors long positions, BEARISH (red) favors shorts, and NEUTRAL (gray) suggests range-bound conditions or conflicting signals.",
  },
  shortTermEnvelope: {
    title: "Short-Term Envelope (Tomorrow)",
    description: "Visualizes tomorrow's expected price channel as a translucent band around recent price action. Green shading indicates bullish setup, red indicates bearish. This envelope represents the model's confidence interval and helps identify potential breakout levels.",
  },
  mediumTermEnvelope: {
    title: "Medium-Term Envelope (Weekly)",
    description: "Weekly-scale envelope showing the broader price channel. Useful for understanding whether short-term forecasts align with or diverge from the larger trend. Persistent trading near envelope boundaries may signal continuation or reversal setups.",
  },
  optionSellers: {
    title: "Option Sellers Radar",
    description: "Guidance for premium sellers (short options strategies). FAVORABLE indicates low volatility expansion risk - ideal for selling credit spreads or covered calls. NEUTRAL suggests standard conditions. AVOID warns of potential volatility spikes that could hurt short option positions.",
  },
  optionBuyers: {
    title: "Option Buyers Radar",
    description: "Guidance for option buyers (long volatility strategies). FAVORABLE indicates conditions where volatility expansion is likely, making long options attractive. CAUTION suggests unfavorable risk/reward for option purchases due to stable or declining volatility expectations.",
  },
  patternMatch: {
    title: "Pattern Match Index",
    description: "Quantifies similarity between current market structure and historical patterns in the model's database. Higher scores (70-100) indicate strong pattern recognition, suggesting the forecast has robust historical precedent. Lower scores (<40) suggest unique or unprecedented conditions requiring additional caution.",
  },
  compositeSummary: {
    title: "Composite Summary",
    description: "Plain-English synthesis of all model outputs. This one-sentence summary integrates point forecasts, range projections, and option radar signals. Click to expand for model metadata (version, last mean absolute error, safety caps) and full transparency disclaimer.",
  },
};

import { useState, useMemo } from "react";
import { Search, Filter, TrendingUp, TrendingDown, Minus, Clock, Star, BookOpen, Newspaper, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Dynamic AI Signal Score Engine
 * Based on: Kirtac & Germano (2024) "Sentiment trading with large language models"
 * DOI: 10.1016/j.frl.2024.105227
 *
 * Static AI scores are unreliable. This formula applies:
 * 1. Recency decay — older news loses signal weight exponentially
 * 2. Keyword importance signals — high-signal financial keywords add/subtract score
 * 3. Signal directional alignment — bullish/bearish tagging amplifies keyword weights
 * 4. Source credibility multiplier — tier-1 outlets weight higher
 * 5. Base score clamp to [20, 98] to avoid false certainty at extremes
 */
const KEYWORD_WEIGHTS: Record<string, number> = {
  // Strong bullish signals
  "beats": 8, "beat": 8, "guide-up": 10, "raises": 7, "exceeds": 8,
  "acceleration": 7, "inflection": 6, "upgrade": 8, "buyback": 6,
  "record": 6, "margin expansion": 8, "revenue growth": 6, "NII": 5,
  // Strong bearish signals
  "miss": -8, "misses": -8, "margin compress": -8, "compression": -6,
  "decline": -5, "falls": -5, "loss": -6, "layoffs": -7, "downgrade": -8,
  "regulatory": -5, "probe": -7, "fine": -5, "concern": -4, "slower": -4,
  // High-impact neutral/macro
  "fed": 4, "rate": 3, "inflation": 3, "guidance": 5, "earnings": 5,
  "acquisition": 5, "deal": 4, "partnership": 4, "capex": 3,
};

const SOURCE_CREDIBILITY: Record<string, number> = {
  "Reuters": 1.05, "Bloomberg": 1.06, "Financial Times": 1.05,
  "Wall Street Journal": 1.04, "WSJ": 1.04, "CNBC": 1.02, "TechCrunch": 1.0,
};

// Parse time string into minutes-ago offset for recency decay
function parseMinutesAgo(timeStr: string): number {
  if (timeStr.startsWith("Yesterday")) return 480; // ~8 hours ago
  const match = timeStr.match(/(\d+):(\d+)\s+(AM|PM)/);
  if (!match) return 120;
  let hours = parseInt(match[1]);
  const mins = parseInt(match[2]);
  const ampm = match[3];
  if (ampm === "PM" && hours !== 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  const nowHours = 4; // reference: 04:32 AM CDT
  const nowMins = 32;
  const storyMinutes = hours * 60 + mins;
  const nowMinutes = nowHours * 60 + nowMins;
  const diff = nowMinutes >= storyMinutes ? nowMinutes - storyMinutes : 60 * 24 - storyMinutes + nowMinutes;
  return Math.max(diff, 1);
}

function computeAIScore(news: {
  time: string;
  signal: string;
  importance: number;
  headline: string;
  summary: string;
  source: string;
  tags: string[];
}): number {
  // 1. Base from importance (1-5 scale → 30-60 base)
  let score = 28 + news.importance * 6;

  // 2. Recency decay: half-life of 90 minutes (Kirtac & Germano 2024)
  const minutesAgo = parseMinutesAgo(news.time);
  const halfLife = 90;
  const recencyMultiplier = Math.pow(0.5, minutesAgo / halfLife);
  score += recencyMultiplier * 20; // up to +20 for very fresh news

  // 3. Keyword signals from headline + summary
  const textLower = (news.headline + " " + news.summary).toLowerCase();
  let keywordScore = 0;
  for (const [kw, weight] of Object.entries(KEYWORD_WEIGHTS)) {
    if (textLower.includes(kw.toLowerCase())) {
      // Directional alignment amplifier
      const aligned =
        (news.signal === "bullish" && weight > 0) ||
        (news.signal === "bearish" && weight < 0);
      keywordScore += aligned ? weight * 1.4 : weight * 0.7;
    }
  }
  score += Math.min(Math.max(keywordScore, -25), 25);

  // 4. Source credibility multiplier
  const credMultiplier = SOURCE_CREDIBILITY[news.source] ?? 1.0;
  score *= credMultiplier;

  // 5. Clamp to [20, 98]
  return Math.round(Math.min(Math.max(score, 20), 98));
}

// NEWS_FEED: aiScore removed — computed dynamically via computeAIScore()
const NEWS_FEED_RAW = [
  {
    id: "1", time: "04:12 AM", ticker: "NVDA", signal: "bullish", importance: 5,
    headline: "NVIDIA Blackwell GPU demand exceeds supply by 3x — Jensen Huang confirms at GTC",
    summary: "CEO Jensen Huang confirmed at the annual GTC conference that Blackwell GPU demand is running 3x ahead of supply capacity. Data center revenue guidance raised to $38B for the quarter. AI inference workloads driving sustained demand beyond training cycles. Enterprise customers now represent 40% of DC revenue vs 12% in 2023.",
    source: "Reuters", tags: ["AI", "Semis", "Earnings"],
    catalyst: "Revenue guide-up. Enterprise mix shift narrative is structurally bullish.",
  },
  {
    id: "2", time: "03:58 AM", ticker: "TSLA", signal: "bearish", importance: 5,
    headline: "Tesla Q1 deliveries miss by 8.3% — worst quarter since 2020, margins at 16.4%",
    summary: "Tesla reported 386,810 deliveries vs consensus 421,000, a -8.3% miss. Automotive gross margins fell to 16.4% from 18.2% in Q4, driven by pricing pressure in China and lower ASPs. Cybertruck ramp slower than expected. Management cited 'factory retooling' but declined to guide Q2.",
    source: "Bloomberg", tags: ["EV", "China", "Margin"],
    catalyst: "Margin trajectory bearish. China share loss accelerating. No Q2 guidance = uncertainty premium.",
  },
  {
    id: "3", time: "03:44 AM", ticker: "FED", signal: "neutral", importance: 5,
    headline: "Fed's Waller: 'Three cuts possible in 2025 if inflation continues declining path'",
    summary: "Fed Governor Waller signaled openness to 3 rate cuts in 2025, contingent on CPI sustained below 3%. Current Fed Funds at 5.25-5.50%. Markets pricing 67bps of cuts by Dec 2025. Treasury yields fell 6bps on comments. Dollar index DXY down 0.3% to 103.2.",
    source: "WSJ", tags: ["Macro", "Fed", "Rates"],
    catalyst: "Dovish signal positive for growth/tech multiples. Duration assets benefit.",
  },
  {
    id: "4", time: "02:31 AM", ticker: "JPM", signal: "bullish", importance: 4,
    headline: "JPMorgan Q1: NII beats by $400M, credit quality 'excellent', Dimon raises buyback",
    summary: "JPMorgan Chase Q1 EPS of $4.44 vs $4.17 estimate. Net interest income $23.1B, up 3% YoY. Net charge-off ratio 0.52%, below historical average. Jamie Dimon announced an additional $3B in share buybacks. Investment banking fees up 21% YoY driven by M&A revival.",
    source: "Financial Times", tags: ["Banks", "Earnings", "NII"],
    catalyst: "Quality beat + capital return = near-term upside. IB recovery = cycle proxy.",
  },
  {
    id: "5", time: "01:48 AM", ticker: "META", signal: "bullish", importance: 4,
    headline: "Meta Llama 4 adoption drives 34% YoY ad revenue growth — Threads hits 300M MAU",
    summary: "Meta's latest AI model Llama 4 is accelerating ad targeting efficiency, with CPM inflation of +14% QoQ. Threads platform reached 300M MAU, adding potential inventory expansion. Reality Labs losses narrowed to $3.9B. CFO guided Q2 revenue $36-38B, implying 18% growth acceleration.",
    source: "CNBC", tags: ["AI", "Ad Tech", "Social"],
    catalyst: "AI-monetization flywheel accelerating. Threads optionality undervalued.",
  },
  {
    id: "6", time: "01:12 AM", ticker: "AAPL", signal: "neutral", importance: 3,
    headline: "Apple iPhone China sales down 7% YoY, but services revenue accelerates to +14%",
    summary: "Counterpoint Research data shows Apple iPhone sell-through in China fell 7% YoY in Q1, with Huawei gaining ground at the high end. However, Apple's services segment ($23.9B quarterly run rate) growing at 14% YoY insulates the overall story. App Store + Apple Pay momentum intact.",
    source: "Wall Street Journal", tags: ["China", "Services", "iPhone"],
    catalyst: "Services growth offsets hardware softness. Net neutral — watch Q2 services guide.",
  },
  {
    id: "7", time: "00:33 AM", ticker: "MSFT", signal: "bullish", importance: 4,
    headline: "Microsoft Azure AI capacity expansions drive 33% cloud growth — Copilot seat count at 1.3M",
    summary: "Azure AI revenue contribution accelerating to $11B quarterly run rate. Microsoft 365 Copilot seat count hit 1.3M enterprise users, up 4x in 12 months. Operating margin expanded to 44.6% from 42.1% on opex discipline. Management confirmed $70B AI capex plan on track.",
    source: "TechCrunch", tags: ["Cloud", "AI", "Enterprise"],
    catalyst: "Copilot monetization inflection point. Azure market share gains from AWS at the margin.",
  },
  {
    id: "8", time: "Yesterday 11:42 PM", ticker: "GS", signal: "bullish", importance: 3,
    headline: "Goldman Sachs M&A advisory revenue +28% QoQ as deal pipeline reaches 5-year high",
    summary: "Goldman's Investment Banking division reported $2.8B in advisory revenue, driven by mega-deal completion in TMT and energy. Deal pipeline described as 'strongest since 2021' by CEO David Solomon. Equity underwriting up 41% reflecting IPO window reopening. Stock up 3.2% pre-market.",
    source: "Bloomberg", tags: ["IB", "M&A", "Financials"],
    catalyst: "IB cycle recovery. GS highest beta to M&A revival in banking universe.",
  },
  {
    id: "9", time: "04:28 AM", ticker: "AMZN", signal: "bullish", importance: 4,
    headline: "Amazon AWS AI inference revenue reaches $12B run rate — Bedrock enterprise adoption 5x YoY",
    summary: "Amazon Web Services Q1 AI inference revenue hit a $12B annualized run rate, driven by Bedrock enterprise adoption growing 5x year-over-year. Amazon is deploying custom Trainium2 chips to reduce AI infrastructure costs by 30%. North American retail margins expanded to 6.7%, beating Street estimates of 5.9%.",
    source: "Reuters", tags: ["Cloud", "AI", "AWS"],
    catalyst: "AWS AI monetization accelerating. Margin beats across all segments.",
  },
  {
    id: "10", time: "03:15 AM", ticker: "BRK-B", signal: "neutral", importance: 3,
    headline: "Berkshire Hathaway Q1 operating earnings +12% — Buffett raises cash position to $189B record",
    summary: "Berkshire Hathaway Q1 operating earnings rose 12% YoY to $11.2B. Warren Buffett increased cash and T-bill holdings to $189B, a new record. Equity portfolio trimmed with further Apple sales. Buffett commentary: 'Attractive opportunities remain scarce at current valuations.' Insurance float at all-time high $169B.",
    source: "Bloomberg", tags: ["Financials", "Insurance", "Value"],
    catalyst: "Record cash signals Buffett caution. High-quality franchise at reasonable valuation.",
  },
];

// Compute aiScore dynamically for every news item
const NEWS_FEED = NEWS_FEED_RAW.map(n => ({ ...n, aiScore: computeAIScore(n) }));

const SIGNAL_FILTERS = ["All", "Bullish", "Bearish", "Neutral"];
const TICKER_FILTERS = ["All", "NVDA", "TSLA", "META", "AAPL", "MSFT", "JPM", "AMZN", "BRK-B"];

export default function NewsPage() {
  const [search, setSearch] = useState("");
  const [signalFilter, setSignalFilter] = useState("All");
  const [selectedNews, setSelectedNews] = useState<typeof NEWS_FEED[0] | null>(null);

  const filtered = NEWS_FEED.filter(n => {
    const matchSearch = !search || n.headline.toLowerCase().includes(search.toLowerCase()) || n.ticker.toLowerCase().includes(search.toLowerCase());
    const matchSignal = signalFilter === "All" || n.signal === signalFilter.toLowerCase();
    return matchSearch && matchSignal;
  });

  return (
    <div className="flex h-full overflow-hidden">
      {/* News list */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
        {/* Search & filters */}
        <div className="p-3 border-b border-border space-y-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-foreground flex-1">News & Signals</h1>
            <Badge variant="outline" className="text-xs badge-bullish">
              {NEWS_FEED.filter(n => n.signal === "bullish").length} Bullish
            </Badge>
            <Badge variant="outline" className="text-xs badge-bearish">
              {NEWS_FEED.filter(n => n.signal === "bearish").length} Bearish
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search headlines, tickers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs bg-muted border-border"
                data-testid="input-news-search"
              />
            </div>
            <div className="flex gap-1">
              {SIGNAL_FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setSignalFilter(f)}
                  className={cn(
                    "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                    signalFilter === f
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                  data-testid={`filter-signal-${f.toLowerCase()}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* News list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map(news => (
            <div
              key={news.id}
              onClick={() => setSelectedNews(news)}
              className={cn(
                "p-3 border-b border-border cursor-pointer transition-colors hover:bg-muted/40",
                selectedNews?.id === news.id && "bg-muted/60 border-l-2 border-l-primary"
              )}
              data-testid={`news-item-${news.id}`}
            >
              <div className="flex items-start gap-2.5">
                <div className="flex-shrink-0 mt-0.5">
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-mono font-bold",
                    news.signal === "bullish" ? "badge-bullish" : news.signal === "bearish" ? "badge-bearish" : "badge-neutral"
                  )}>
                    {news.ticker}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground leading-tight line-clamp-2">{news.headline}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={10} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-[10px] text-muted-foreground">{news.time}</span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] text-muted-foreground">{news.source}</span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className={cn("text-[10px] font-semibold font-mono", news.aiScore >= 80 ? "text-primary" : "text-muted-foreground")}>
                      AI: {news.aiScore}
                    </span>
                  </div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {news.tags.map(t => (
                      <span key={t} className="text-[9px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0 flex gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className={cn("w-1 h-1 rounded-full", j < news.importance ? "bg-primary" : "bg-border")} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      <div className="w-80 flex-shrink-0 flex flex-col overflow-hidden bg-card">
        {selectedNews ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 animate-fade-in">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={cn(
                  "text-xs px-2 py-1 rounded font-mono font-bold",
                  selectedNews.signal === "bullish" ? "badge-bullish" : selectedNews.signal === "bearish" ? "badge-bearish" : "badge-neutral"
                )}>
                  {selectedNews.ticker}
                </span>
                <span className={cn("text-xs font-semibold capitalize",
                  selectedNews.signal === "bullish" ? "text-up" : selectedNews.signal === "bearish" ? "text-down" : "text-flat"
                )}>
                  {selectedNews.signal}
                </span>
              </div>
              <h2 className="text-sm font-semibold text-foreground leading-snug">{selectedNews.headline}</h2>
              <p className="text-[10px] text-muted-foreground mt-1">{selectedNews.time} · {selectedNews.source}</p>
            </div>

            {/* AI Score */}
            <div className="bg-muted rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <Brain size={11} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">AI Signal Score</span>
                </div>
                <span className={cn("text-lg font-bold font-mono",
                  selectedNews.aiScore >= 80 ? "text-primary" :
                  selectedNews.aiScore >= 60 ? "text-yellow-400" : "text-muted-foreground"
                )}>{selectedNews.aiScore}</span>
              </div>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all",
                    selectedNews.aiScore >= 80 ? "bg-primary" :
                    selectedNews.aiScore >= 60 ? "bg-yellow-500" : "bg-muted-foreground"
                  )}
                  style={{ width: `${selectedNews.aiScore}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
                Score computed via recency decay (t½=90min) + keyword signal weighting
                (Kirtac &amp; Germano, 2024)
              </p>
              <p className="text-[10px] text-foreground mt-1.5 leading-relaxed">{selectedNews.catalyst}</p>
            </div>

            {/* Full summary */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen size={11} /> Analysis
              </h3>
              <p className="text-xs text-foreground leading-relaxed">{selectedNews.summary}</p>
            </div>

            {/* Importance */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Signal Importance</h3>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className={cn("flex-1 h-2 rounded", j < selectedNews.importance ? "bg-primary" : "bg-border")} />
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Categories</h3>
              <div className="flex gap-1.5 flex-wrap">
                {selectedNews.tags.map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 bg-muted border border-border rounded text-muted-foreground">{t}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-6">
            <div>
              <Newspaper size={32} className="text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm text-muted-foreground">Select a news item to view AI analysis and signal breakdown</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

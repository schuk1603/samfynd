import { Link } from "wouter";
import {
  TrendingUp, TrendingDown, Activity, Newspaper,
  AlertCircle, BarChart2, DollarSign, Globe, Zap, ArrowUpRight,
  Users, Brain, ShieldAlert, Radar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip
} from "recharts";

const SPY_DATA = [
  { t: "9:30", v: 545.2 }, { t: "10:00", v: 546.8 }, { t: "10:30", v: 547.1 },
  { t: "11:00", v: 546.4 }, { t: "11:30", v: 548.0 }, { t: "12:00", v: 547.6 },
  { t: "12:30", v: 548.9 }, { t: "13:00", v: 549.4 }, { t: "13:30", v: 548.2 },
  { t: "14:00", v: 548.9 }, { t: "14:30", v: 549.8 }, { t: "15:00", v: 550.1 },
  { t: "15:30", v: 549.6 }, { t: "16:00", v: 548.32 },
];

const MACRO_DATA = [
  { label: "Fed Funds Rate", value: "5.25–5.50%", trend: "flat", note: "Unchanged since Jul '23" },
  { label: "CPI YoY", value: "3.2%", trend: "down", note: "Below 3.5% prev" },
  { label: "10Y Treasury", value: "4.32%", trend: "up", note: "+5bps today" },
  { label: "VIX", value: "18.43", trend: "down", note: "Fear easing" },
  { label: "DXY Index", value: "103.24", trend: "down", note: "USD weakening" },
  { label: "WTI Crude", value: "$78.32", trend: "down", note: "OPEC supply concerns" },
];

const TOP_SIGNALS = [
  { ticker: "NVDA", signal: "bullish", headline: "Jensen Huang confirms Blackwell GPU demand exceeds supply 3x", importance: 5 },
  { ticker: "TSLA", signal: "bearish", headline: "Q1 deliveries miss consensus by 8.3%, margins compress to 16.4%", importance: 5 },
  { ticker: "JPM", signal: "bullish", headline: "Dimon: 'Credit quality remains excellent, NIM stable at 2.8%'", importance: 4 },
  { ticker: "META", signal: "bullish", headline: "Llama 4 adoption drives 34% YoY ad revenue acceleration", importance: 4 },
  { ticker: "AAPL", signal: "neutral", headline: "China iPhone sales down 7% but services revenue up 14%", importance: 3 },
];

const SECTOR_PERF = [
  { name: "Technology", change: "+2.1%", up: true },
  { name: "Financials", change: "+1.4%", up: true },
  { name: "Healthcare", change: "+0.8%", up: true },
  { name: "Energy", change: "-0.9%", up: false },
  { name: "Utilities", change: "-1.2%", up: false },
  { name: "Consumer Disc.", change: "-0.4%", up: false },
];

// Research data: Analyst Herding Scores (Şeker et al. 2025 — consensus crowding bias)
const HERDING_DATA = [
  { ticker: "NVDA", score: 94 },
  { ticker: "MSFT", score: 88 },
  { ticker: "AMZN", score: 89 },
  { ticker: "META", score: 85 },
  { ticker: "GOOGL", score: 72 },
  { ticker: "TSLA", score: 42 },
];

// Research data: Market Regime Confidence (Cao 2021 — regime detection)
const REGIME_DATA = [
  { label: "Momentum / Risk-On", confidence: 74, color: "bg-green-500", textColor: "text-up" },
  { label: "Mean Reversion", confidence: 18, color: "bg-yellow-500", textColor: "text-yellow-400" },
  { label: "Defensive / Risk-Off", confidence: 8, color: "bg-red-500", textColor: "text-down" },
];

const QUICK_METRICS = [
  { label: "S&P 500", value: "5,482", change: "+1.24%", sub: "All-time high proximity", icon: TrendingUp, up: true },
  { label: "Nasdaq 100", value: "19,248", change: "+1.87%", sub: "Tech rally continues", icon: BarChart2, up: true },
  { label: "Market Cap (US)", value: "$46.2T", change: "+$580B", sub: "vs. prior close", icon: DollarSign, up: true },
  { label: "Global Sentiment", value: "RISK-ON", change: "Bullish", sub: "AI + rate cut optimism", icon: Globe, up: true },
];

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-md px-2.5 py-1.5 text-xs shadow-lg">
        <p className="text-muted-foreground">{label}</p>
        <p className="font-mono font-semibold text-foreground">${payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
}

export default function Dashboard() {
  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Command Center</h1>
          <p className="text-xs text-muted-foreground">Sunday, April 19, 2026 · 04:32 AM CDT · Pre-market</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs badge-bullish">
            <Zap size={10} className="mr-1" /> Risk-On Environment
          </Badge>
        </div>
      </div>

      {/* Quick metrics row */}
      <div className="grid grid-cols-4 gap-3">
        {QUICK_METRICS.map((m) => (
          <Card key={m.label} className="bg-card border-border">
            <CardContent className="p-3">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-muted-foreground font-medium">{m.label}</p>
                <m.icon size={13} className={m.up ? "text-up" : "text-down"} />
              </div>
              <p className="text-lg font-bold font-mono text-foreground">{m.value}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={cn("text-xs font-mono font-semibold", m.up ? "text-up" : "text-down")}>{m.change}</span>
                <span className="text-xs text-muted-foreground truncate">{m.sub}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content: chart + signals */}
      <div className="grid grid-cols-3 gap-3">
        {/* SPY intraday */}
        <div className="col-span-2">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-3 px-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">SPY Intraday</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-foreground text-sm">$548.32</span>
                  <span className="text-xs font-mono text-up">+$6.74 (+1.24%)</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-1 pb-2">
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={SPY_DATA} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(213 94% 60%)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(213 94% 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="t" tick={{ fontSize: 10, fill: 'hsl(210 10% 50%)' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(210 10% 50%)' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="v" stroke="hsl(213 94% 60%)" strokeWidth={1.5} fill="url(#spyGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Sector performance */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sector Performance</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 space-y-1.5">
            {SECTOR_PERF.map(s => (
              <div key={s.name} className="flex items-center justify-between">
                <span className="text-xs text-foreground">{s.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", s.up ? "bg-green-500" : "bg-red-500")}
                      style={{ width: `${Math.min(Math.abs(parseFloat(s.change)) * 20, 100)}%` }}
                    />
                  </div>
                  <span className={cn("text-xs font-mono font-semibold w-12 text-right", s.up ? "text-up" : "text-down")}>{s.change}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Research-grounded widgets: Herding Alert + Regime Detector */}
      <div className="grid grid-cols-2 gap-3">
        {/* Analyst Herding Alert — Şeker et al. 2025: consensus crowding bias */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 pt-3 px-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Users size={12} /> Analyst Herding Alert
              </CardTitle>
              <Badge variant="outline" className="text-[10px] badge-bearish">Bias Detected</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3 space-y-2">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Consensus crowding bias (Şeker et al., 2025) — when analyst herding score {'>'} 75%, contrarian signals carry extra weight.
            </p>
            {HERDING_DATA.map(h => (
              <div key={h.ticker} className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-foreground w-14 flex-shrink-0">{h.ticker}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", h.score >= 75 ? "bg-red-500" : h.score >= 55 ? "bg-yellow-500" : "bg-green-500")}
                    style={{ width: `${h.score}%` }}
                  />
                </div>
                <span className={cn("font-mono text-[10px] font-semibold w-10 text-right flex-shrink-0",
                  h.score >= 75 ? "text-down" : h.score >= 55 ? "text-yellow-400" : "text-up"
                )}>{h.score}%</span>
                {h.score >= 75 && <ShieldAlert size={10} className="text-down flex-shrink-0" />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Market Regime Detector — Cao 2021: regime detection for risk-adjusted decisions */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 pt-3 px-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Radar size={12} /> Market Regime Detector
              </CardTitle>
              <Badge variant="outline" className="text-[10px] badge-bullish">Risk-On</Badge>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3 space-y-2">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Regime detection engine (Cao, 2021 — AI in Finance) — identifies macro regime for risk-adjusted position sizing.
            </p>
            {REGIME_DATA.map(r => (
              <div key={r.label} className="flex items-center justify-between py-0.5">
                <span className="text-xs text-muted-foreground">{r.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", r.color)}
                      style={{ width: `${r.confidence}%` }}
                    />
                  </div>
                  <span className={cn("font-mono text-[10px] font-semibold w-8 text-right", r.textColor)}>{r.confidence}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: macro + signals */}
      <div className="grid grid-cols-2 gap-3">
        {/* Macro dashboard */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Macro Indicators</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <table className="w-full">
              <tbody>
                {MACRO_DATA.map(m => (
                  <tr key={m.label} className="border-b border-border/50 last:border-0">
                    <td className="py-1.5 text-xs text-muted-foreground w-36">{m.label}</td>
                    <td className="py-1.5 text-xs font-mono font-semibold text-foreground">{m.value}</td>
                    <td className="py-1.5 text-right">
                      {m.trend === "up" ? <TrendingUp size={11} className="text-down ml-auto" /> :
                       m.trend === "down" ? <TrendingDown size={11} className="text-up ml-auto" /> :
                       <Activity size={11} className="text-flat ml-auto" />}
                    </td>
                    <td className="py-1.5 text-xs text-muted-foreground text-right pl-2 hidden sm:table-cell">{m.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Top AI signals */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 pt-3 px-3 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top AI Signals</CardTitle>
            <Link href="/news">
              <span className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1">
                All signals <ArrowUpRight size={10} />
              </span>
            </Link>
          </CardHeader>
          <CardContent className="px-3 pb-3 space-y-2">
            {TOP_SIGNALS.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-mono font-bold flex-shrink-0 mt-0.5",
                  s.signal === "bullish" ? "badge-bullish" : s.signal === "bearish" ? "badge-bearish" : "badge-neutral"
                )}>{s.ticker}</span>
                <p className="text-xs text-foreground leading-tight line-clamp-2">{s.headline}</p>
                <div className="flex-shrink-0 flex gap-0.5 mt-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} className={cn("w-1 h-1 rounded-full", j < s.importance ? "bg-primary" : "bg-border")} />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from "react";
import { TrendingUp, TrendingDown, BarChart2, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  LineChart, Line, CartesianGrid
} from "recharts";

const GAINERS = [
  { ticker: "NVDA", name: "NVIDIA Corp", price: "897.64", change: "+3.42%", vol: "48.2M", mktCap: "$2.2T" },
  { ticker: "META", name: "Meta Platforms", price: "521.33", change: "+2.34%", vol: "18.7M", mktCap: "$1.3T" },
  { ticker: "MSFT", name: "Microsoft Corp", price: "418.32", change: "+2.11%", vol: "22.1M", mktCap: "$3.1T" },
  { ticker: "AMZN", name: "Amazon.com", price: "197.12", change: "+1.56%", vol: "31.4M", mktCap: "$2.1T" },
  { ticker: "JPM", name: "JPMorgan Chase", price: "234.56", change: "+0.78%", vol: "9.3M", mktCap: "$680B" },
];

const LOSERS = [
  { ticker: "TSLA", name: "Tesla Inc", price: "177.82", change: "-1.23%", vol: "94.1M", mktCap: "$567B" },
  { ticker: "XOM", name: "ExxonMobil Corp", price: "112.45", change: "-0.94%", vol: "11.2M", mktCap: "$450B" },
  { ticker: "INTC", name: "Intel Corp", price: "20.14", change: "-2.81%", vol: "44.8M", mktCap: "$85B" },
  { ticker: "BA", name: "Boeing Co", price: "172.34", change: "-1.67%", vol: "8.4M", mktCap: "$103B" },
  { ticker: "DIS", name: "Walt Disney Co", price: "89.12", change: "-0.82%", vol: "7.9M", mktCap: "$162B" },
];

const INDICES = [
  { name: "S&P 500", sym: "^GSPC", price: "5,482.34", change: "+67.82", pct: "+1.25%", ytd: "+8.2%", up: true },
  { name: "Nasdaq 100", sym: "^NDX", price: "19,248.16", change: "+354.12", pct: "+1.87%", ytd: "+11.4%", up: true },
  { name: "Dow Jones", sym: "^DJI", price: "40,124.56", change: "+312.44", pct: "+0.78%", ytd: "+5.1%", up: true },
  { name: "Russell 2000", sym: "^RUT", price: "2,043.78", change: "-12.34", pct: "-0.60%", ytd: "+2.3%", up: false },
  { name: "VIX", sym: "^VIX", price: "18.43", change: "-1.02", pct: "-5.24%", ytd: "-8.1%", up: false },
  { name: "FTSE 100", sym: "^FTSE", price: "8,134.22", change: "+42.18", pct: "+0.52%", ytd: "+4.2%", up: true },
  { name: "Nikkei 225", sym: "^N225", price: "38,892.10", change: "+441.72", pct: "+1.15%", ytd: "+6.8%", up: true },
  { name: "DAX", sym: "^GDAXI", price: "18,234.56", change: "+189.43", pct: "+1.05%", ytd: "+9.3%", up: true },
];

const SECTOR_ROTATION = [
  { sector: "Technology", weight: 31.2, wk: "+3.2", mo: "+7.1", ytd: "+14.2" },
  { sector: "Financials", weight: 13.4, wk: "+1.8", mo: "+3.4", ytd: "+8.9" },
  { sector: "Healthcare", weight: 12.1, wk: "+0.4", mo: "-0.8", ytd: "+2.1" },
  { sector: "Consumer Disc", weight: 10.8, wk: "-0.6", mo: "+1.2", ytd: "+4.4" },
  { sector: "Industrials", weight: 8.7, wk: "+1.1", mo: "+2.3", ytd: "+6.7" },
  { sector: "Energy", weight: 3.9, wk: "-1.2", mo: "-3.4", ytd: "-2.1" },
  { sector: "Materials", weight: 2.3, wk: "+0.8", mo: "+1.1", ytd: "+3.2" },
  { sector: "Utilities", weight: 2.4, wk: "-1.8", mo: "-2.4", ytd: "-4.1" },
];

const FEAR_GREED_COMPONENTS = [
  { name: "Price Momentum", score: 72, signal: "Greed" },
  { name: "Market Breadth", score: 64, signal: "Greed" },
  { name: "Put/Call Ratio", score: 58, signal: "Neutral" },
  { name: "Market Volatility", score: 67, signal: "Greed" },
  { name: "Safe Haven Demand", score: 42, signal: "Fear" },
  { name: "Junk Bond Demand", score: 71, signal: "Greed" },
];

const WEEKLY_PERF = [
  { day: "Mon", spy: 1.2, tech: 2.1, finance: 0.8 },
  { day: "Tue", spy: -0.4, tech: -0.8, finance: 0.2 },
  { day: "Wed", spy: 0.9, tech: 1.4, finance: 0.6 },
  { day: "Thu", spy: -0.2, tech: 0.1, finance: -0.4 },
  { day: "Fri", spy: 1.1, tech: 1.9, finance: 0.7 },
];

function MiniTable({ data, type }: { data: typeof GAINERS; type: "gain" | "loss" }) {
  return (
    <table className="w-full data-table">
      <thead>
        <tr>
          <th>Ticker</th>
          <th>Price</th>
          <th>Change</th>
          <th className="hidden md:table-cell">Volume</th>
          <th className="hidden md:table-cell">Mkt Cap</th>
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr key={row.ticker}>
            <td>
              <div className="font-mono font-semibold text-foreground text-xs">{row.ticker}</div>
              <div className="text-[10px] text-muted-foreground">{row.name}</div>
            </td>
            <td className="font-mono font-medium text-xs text-foreground">${row.price}</td>
            <td>
              <span className={cn("font-mono font-semibold text-xs", type === "gain" ? "text-up" : "text-down")}>
                {row.change}
              </span>
            </td>
            <td className="hidden md:table-cell text-xs text-muted-foreground font-mono">{row.vol}</td>
            <td className="hidden md:table-cell text-xs text-muted-foreground font-mono">{row.mktCap}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function MarketPage() {
  const fearGreed = 68;

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div>
        <h1 className="text-lg font-bold text-foreground">Market Intelligence</h1>
        <p className="text-xs text-muted-foreground">Real-time market data, indices, and cross-asset signals</p>
      </div>

      {/* Index grid */}
      <div className="grid grid-cols-4 gap-2">
        {INDICES.map(idx => (
          <Card key={idx.sym} className="bg-card border-border">
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{idx.name}</p>
              <p className="font-mono font-bold text-sm text-foreground">{idx.price}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={cn("text-xs font-mono", idx.up ? "text-up" : "text-down")}>{idx.pct}</span>
                <span className="text-[10px] text-muted-foreground">YTD {idx.ytd}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Movers & Rotation */}
      <div className="grid grid-cols-3 gap-3">
        {/* Top movers tabs */}
        <div className="col-span-2">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top Movers</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-2">
              <Tabs defaultValue="gainers">
                <TabsList className="mx-3 h-7 text-xs mb-2">
                  <TabsTrigger value="gainers" className="text-xs h-6">
                    <TrendingUp size={11} className="mr-1" /> Gainers
                  </TabsTrigger>
                  <TabsTrigger value="losers" className="text-xs h-6">
                    <TrendingDown size={11} className="mr-1" /> Losers
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="gainers">
                  <MiniTable data={GAINERS} type="gain" />
                </TabsContent>
                <TabsContent value="losers">
                  <MiniTable data={LOSERS} type="loss" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Fear & Greed */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fear & Greed Index</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-center mb-3">
              <div className="text-3xl font-bold font-mono text-primary">{fearGreed}</div>
              <div className="text-xs font-semibold text-up mt-0.5">GREED</div>
              <div className="w-full h-2 bg-gradient-to-r from-red-600 via-yellow-500 to-green-500 rounded-full mt-2 relative">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-card rounded-full shadow"
                  style={{ left: `${fearGreed}%`, marginLeft: '-6px' }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>Extreme Fear</span>
                <span>Extreme Greed</span>
              </div>
            </div>
            <div className="space-y-1.5 mt-3">
              {FEAR_GREED_COMPONENTS.map(c => (
                <div key={c.name} className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{c.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${c.score}%` }} />
                    </div>
                    <Badge variant="outline" className={cn("text-[10px] py-0 h-4", c.score > 60 ? "badge-bullish" : c.score < 40 ? "badge-bearish" : "badge-neutral")}>
                      {c.signal}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sector rotation + weekly chart */}
      <div className="grid grid-cols-3 gap-3">
        {/* Sector rotation */}
        <div className="col-span-2">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sector Rotation Matrix</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-2">
              <table className="w-full data-table">
                <thead>
                  <tr>
                    <th>Sector</th>
                    <th className="text-right">S&P Weight</th>
                    <th className="text-right">1 Week</th>
                    <th className="text-right">1 Month</th>
                    <th className="text-right">YTD</th>
                  </tr>
                </thead>
                <tbody>
                  {SECTOR_ROTATION.map(s => {
                    const wkUp = parseFloat(s.wk) > 0;
                    const moUp = parseFloat(s.mo) > 0;
                    const ytdUp = parseFloat(s.ytd) > 0;
                    return (
                      <tr key={s.sector}>
                        <td className="text-xs font-medium text-foreground">{s.sector}</td>
                        <td className="text-right font-mono text-xs text-muted-foreground">{s.weight}%</td>
                        <td className={cn("text-right font-mono text-xs font-semibold", wkUp ? "text-up" : "text-down")}>{s.wk}%</td>
                        <td className={cn("text-right font-mono text-xs font-semibold", moUp ? "text-up" : "text-down")}>{s.mo}%</td>
                        <td className={cn("text-right font-mono text-xs font-semibold", ytdUp ? "text-up" : "text-down")}>{s.ytd}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Weekly performance chart */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Weekly Performance</CardTitle>
          </CardHeader>
          <CardContent className="px-1 pb-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={WEEKLY_PERF} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="hsl(222 16% 18%)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'hsl(210 10% 50%)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(210 10% 50%)' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(222 24% 10%)', border: '1px solid hsl(222 16% 18%)', borderRadius: '4px', fontSize: '11px' }}
                  labelStyle={{ color: 'hsl(210 15% 88%)' }}
                />
                <Bar dataKey="spy" name="SPY" fill="hsl(213 94% 60%)" radius={2} />
                <Bar dataKey="tech" name="Tech" fill="hsl(38 92% 58%)" radius={2} />
                <Bar dataKey="finance" name="Finance" fill="hsl(152 60% 50%)" radius={2} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

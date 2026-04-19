import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, BookMarked, TrendingUp, TrendingDown, Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { WatchlistItem } from "@shared/schema";

// Mock live price data
const MOCK_PRICES: Record<string, { price: string; change: string; pct: string; up: boolean }> = {
  NVDA: { price: "897.64", change: "+30.82", pct: "+3.56%", up: true },
  TSLA: { price: "177.82", change: "-2.21", pct: "-1.23%", up: false },
  AAPL: { price: "213.49", change: "+1.15", pct: "+0.54%", up: true },
  MSFT: { price: "418.32", change: "+8.62", pct: "+2.11%", up: true },
  META: { price: "521.33", change: "+11.92", pct: "+2.34%", up: true },
  GOOGL: { price: "172.45", change: "+1.52", pct: "+0.89%", up: true },
  AMZN: { price: "197.12", change: "+3.02", pct: "+1.56%", up: true },
  JPM: { price: "234.56", change: "+1.82", pct: "+0.78%", up: true },
  GS: { price: "512.34", change: "+5.16", pct: "+1.02%", up: true },
  "BRK-B": { price: "448.21", change: "+0.54", pct: "+0.12%", up: true },
};

const DEFAULT_WATCHLIST = [
  { id: 1, ticker: "NVDA", companyName: "NVIDIA Corp", sector: "Semiconductors", addedAt: "2024-01-15", notes: "AI infrastructure play — highest conviction", targetPrice: 985, alertPrice: 950 },
  { id: 2, ticker: "TSLA", companyName: "Tesla Inc", sector: "EV", addedAt: "2024-02-20", notes: "Monitoring delivery trends and margin recovery", targetPrice: 200, alertPrice: 170 },
  { id: 3, ticker: "MSFT", companyName: "Microsoft Corp", sector: "Software", addedAt: "2024-03-10", notes: "Copilot monetization inflection — long term hold", targetPrice: 450, alertPrice: 400 },
  { id: 4, ticker: "JPM", companyName: "JPMorgan Chase", sector: "Financials", addedAt: "2024-03-25", notes: "Rate environment beneficiary, strong NII", targetPrice: 250, alertPrice: 225 },
  { id: 5, ticker: "GOOGL", companyName: "Alphabet Inc", sector: "Technology", addedAt: "2024-04-01", notes: "Search moat + Gemini AI monetization. Cloud inflection", targetPrice: 215, alertPrice: 160 },
  { id: 6, ticker: "BRK-B", companyName: "Berkshire Hathaway B", sector: "Diversified", addedAt: "2024-04-10", notes: "Quality compounding at scale. Buffett capital allocation", targetPrice: 490, alertPrice: 425 },
];

function AddTickerDialog({ onAdd }: { onAdd: (ticker: string, name: string, sector: string, notes: string) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ticker: "", companyName: "", sector: "", notes: "" });

  const handleSubmit = () => {
    if (!form.ticker) return;
    onAdd(form.ticker.toUpperCase(), form.companyName, form.sector, form.notes);
    setForm({ ticker: "", companyName: "", sector: "", notes: "" });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 text-xs gap-1.5" data-testid="button-add-watchlist">
          <Plus size={13} /> Add Ticker
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-sm">Add to Watchlist</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Ticker Symbol *</label>
            <Input
              placeholder="e.g. AAPL"
              value={form.ticker}
              onChange={e => setForm(f => ({ ...f, ticker: e.target.value.toUpperCase() }))}
              className="h-8 text-xs bg-muted border-border font-mono uppercase"
              data-testid="input-watchlist-ticker"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Company Name</label>
            <Input
              placeholder="e.g. Apple Inc"
              value={form.companyName}
              onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
              className="h-8 text-xs bg-muted border-border"
              data-testid="input-watchlist-company"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Sector</label>
            <Input
              placeholder="e.g. Technology"
              value={form.sector}
              onChange={e => setForm(f => ({ ...f, sector: e.target.value }))}
              className="h-8 text-xs bg-muted border-border"
              data-testid="input-watchlist-sector"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Notes</label>
            <Input
              placeholder="Investment thesis note..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="h-8 text-xs bg-muted border-border"
              data-testid="input-watchlist-notes"
            />
          </div>
          <Button onClick={handleSubmit} className="w-full h-8 text-xs" data-testid="button-submit-watchlist">
            Add to Watchlist
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function WatchlistPage() {
  const [items, setItems] = useState<typeof DEFAULT_WATCHLIST>(DEFAULT_WATCHLIST);
  const { toast } = useToast();

  const handleAdd = (ticker: string, companyName: string, sector: string, notes: string) => {
    const newItem = {
      id: Date.now(),
      ticker, companyName, sector,
      addedAt: new Date().toISOString().split("T")[0],
      notes, targetPrice: null, alertPrice: null,
    };
    setItems(prev => [...prev, newItem]);
    toast({ title: `${ticker} added to watchlist`, description: "Track it in your command center." });
  };

  const handleRemove = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
    toast({ title: "Removed from watchlist" });
  };

  const totalGainers = items.filter(i => MOCK_PRICES[i.ticker]?.up).length;
  const totalLosers = items.filter(i => !MOCK_PRICES[i.ticker]?.up).length;

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Watchlist</h1>
          <p className="text-xs text-muted-foreground">{items.length} positions tracked · {totalGainers} up · {totalLosers} down</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs badge-bullish">{totalGainers} Up</Badge>
          <Badge variant="outline" className="text-xs badge-bearish">{totalLosers} Down</Badge>
          <AddTickerDialog onAdd={handleAdd} />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BookMarked size={40} className="text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-sm text-muted-foreground">Your watchlist is empty</p>
            <p className="text-xs text-muted-foreground mt-1">Add tickers to track them here</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-2">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 px-3 py-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold border-b border-border">
            <div className="col-span-2">Ticker</div>
            <div className="col-span-3">Company</div>
            <div className="col-span-1">Sector</div>
            <div className="col-span-1 text-right">Price</div>
            <div className="col-span-1 text-right">Change</div>
            <div className="col-span-1 text-right">Target</div>
            <div className="col-span-1 text-right">Alert</div>
            <div className="col-span-2 text-right">Notes</div>
          </div>

          {items.map(item => {
            const liveData = MOCK_PRICES[item.ticker];
            const targetUpside = liveData && item.targetPrice
              ? (((item.targetPrice / parseFloat(liveData.price)) - 1) * 100).toFixed(1)
              : null;

            return (
              <Card key={item.id} className="bg-card border-border hover:border-primary/30 transition-colors" data-testid={`watchlist-item-${item.id}`}>
                <CardContent className="p-0">
                  <div className="grid grid-cols-12 gap-2 px-3 py-2.5 items-center">
                    <div className="col-span-2">
                      <div className="font-mono font-bold text-sm text-foreground">{item.ticker}</div>
                      <div className="text-[10px] text-muted-foreground">{item.addedAt}</div>
                    </div>
                    <div className="col-span-3">
                      <p className="text-xs text-foreground font-medium truncate">{item.companyName}</p>
                    </div>
                    <div className="col-span-1">
                      {item.sector && (
                        <Badge variant="outline" className="text-[10px] py-0 h-4 px-1.5">{item.sector}</Badge>
                      )}
                    </div>
                    <div className="col-span-1 text-right">
                      {liveData ? (
                        <span className="font-mono font-semibold text-xs text-foreground">${liveData.price}</span>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                    <div className="col-span-1 text-right">
                      {liveData ? (
                        <div className="flex items-center justify-end gap-0.5">
                          {liveData.up ? <TrendingUp size={11} className="text-up" /> : <TrendingDown size={11} className="text-down" />}
                          <span className={cn("font-mono font-semibold text-xs", liveData.up ? "text-up" : "text-down")}>{liveData.pct}</span>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                    <div className="col-span-1 text-right">
                      {item.targetPrice ? (
                        <div>
                          <span className="font-mono text-xs text-foreground">${item.targetPrice}</span>
                          {targetUpside && (
                            <div className={cn("text-[10px] font-mono", parseFloat(targetUpside) > 0 ? "text-up" : "text-down")}>
                              {parseFloat(targetUpside) > 0 ? "+" : ""}{targetUpside}%
                            </div>
                          )}
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                    <div className="col-span-1 text-right">
                      {item.alertPrice ? (
                        <span className="font-mono text-xs text-muted-foreground">${item.alertPrice}</span>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-1">
                      {item.notes && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">{item.notes}</span>
                      )}
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="ml-1 p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        data-testid={`button-remove-watchlist-${item.id}`}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { Plus, TrendingUp, TrendingDown, FileText, Star, ChevronDown, ChevronUp, Trash2, ShieldAlert } from "lucide-react";

// Type-safe normalizer: ensures catalysts/risks are always string[]
// Fixes mismatch between DEFAULT_THESES (string arrays) and any legacy string data
function toStringArray(val: string | string[] | undefined | null): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  return val.split("\n").filter(Boolean);
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const DEFAULT_THESES = [
  {
    id: 1, ticker: "NVDA", companyName: "NVIDIA Corp", direction: "long", conviction: 5,
    thesis: "NVIDIA is the infrastructure layer for the AI supercycle. CUDA ecosystem lock-in creates a multi-year moat. Blackwell GPU architecture extends compute leadership through 2026. At 34x FY25 PE on ~100% EPS growth, the stock is not obviously expensive. Data center revenue run rate heading toward $160B annually within 18 months.",
    catalysts: ["GB200 NVL72 rack shipment ramp", "Sovereign AI deal pipeline ($5-10B)", "Inference workload expansion"],
    risks: ["Export control escalation", "Custom ASIC competition", "Multiple compression if AI spend slows"],
    targetPrice: 985, timeHorizon: "12 months", status: "active", createdAt: "2024-11-01",
  },
  {
    id: 2, ticker: "TSLA", companyName: "Tesla Inc", direction: "short", conviction: 3,
    thesis: "Tesla is in a structural margin compression cycle. China market share loss to BYD is accelerating. EPS revisions are negative. The FSD/Robotaxi narrative is a 2026+ story at best, providing little near-term support. Current 58x FY25 PE is unjustifiable for a -9% revenue growth company. The Musk brand overhang is an emerging risk.",
    catalysts: ["Negative Q2 delivery miss", "FSD timeline pushback", "China market share data worsening"],
    risks: ["FSD commercial launch pulls forward", "New affordable model demand surprise", "Short squeeze on positive headline"],
    targetPrice: 130, timeHorizon: "6 months", status: "active", createdAt: "2025-01-15",
  },
  {
    id: 3, ticker: "JPM", companyName: "JPMorgan Chase", direction: "long", conviction: 4,
    thesis: "JPMorgan is the highest quality bank in the world. With rates remaining elevated, NII sustains at $90B+ annualized. Credit quality is excellent (NCO ratio 0.52%). M&A revival boosts IB fees. Dimon's disciplined capital allocation (buybacks + selective M&A) creates durable shareholder value. Trading at 1.85x book — a reasonable premium for best-in-class franchise.",
    catalysts: ["M&A pipeline monetization", "Rate environment NII sustain", "Buyback acceleration"],
    risks: ["Commercial real estate credit deterioration", "Recession reduces loan demand", "Regulatory capital requirement increases"],
    targetPrice: 255, timeHorizon: "9 months", status: "active", createdAt: "2025-02-20",
  },
];

function ConvictionStars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={11}
          className={cn(i < n ? "text-primary fill-primary" : "text-border")}
        />
      ))}
    </div>
  );
}

function NewThesisDialog({ onAdd }: { onAdd: (thesis: any) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    ticker: "", companyName: "", direction: "long", conviction: 3,
    thesis: "", catalysts: "", risks: "", targetPrice: "", timeHorizon: "12 months",
  });

  const handleSubmit = () => {
    if (!form.ticker || !form.thesis) return;
    onAdd({
      id: Date.now(),
      ticker: form.ticker.toUpperCase(),
      companyName: form.companyName,
      direction: form.direction,
      conviction: form.conviction,
      thesis: form.thesis,
      catalysts: form.catalysts.split("\n").filter(Boolean),
      risks: form.risks.split("\n").filter(Boolean),
      targetPrice: parseFloat(form.targetPrice) || null,
      timeHorizon: form.timeHorizon,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    });
    setOpen(false);
    setForm({ ticker: "", companyName: "", direction: "long", conviction: 3, thesis: "", catalysts: "", risks: "", targetPrice: "", timeHorizon: "12 months" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 text-xs gap-1.5" data-testid="button-new-thesis">
          <Plus size={13} /> New Thesis
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm">New Investment Thesis</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Ticker *</label>
              <Input placeholder="AAPL" value={form.ticker} onChange={e => setForm(f => ({ ...f, ticker: e.target.value.toUpperCase() }))} className="h-8 text-xs bg-muted border-border font-mono" data-testid="input-thesis-ticker" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Company Name</label>
              <Input placeholder="Apple Inc" value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} className="h-8 text-xs bg-muted border-border" data-testid="input-thesis-company" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Direction</label>
              <Select value={form.direction} onValueChange={v => setForm(f => ({ ...f, direction: v }))}>
                <SelectTrigger className="h-8 text-xs bg-muted border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Conviction (1-5)</label>
              <Select value={String(form.conviction)} onValueChange={v => setForm(f => ({ ...f, conviction: parseInt(v) }))}>
                <SelectTrigger className="h-8 text-xs bg-muted border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Target Price</label>
              <Input type="number" placeholder="200" value={form.targetPrice} onChange={e => setForm(f => ({ ...f, targetPrice: e.target.value }))} className="h-8 text-xs bg-muted border-border font-mono" data-testid="input-thesis-target" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Investment Thesis *</label>
            <textarea
              placeholder="Why is this trade compelling?"
              value={form.thesis}
              onChange={e => setForm(f => ({ ...f, thesis: e.target.value }))}
              className="w-full h-24 text-xs bg-muted border border-border rounded-md px-3 py-2 resize-none focus-visible:ring-1 focus-visible:ring-primary text-foreground"
              data-testid="textarea-thesis-body"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Catalysts (one per line)</label>
            <textarea
              placeholder="Q2 earnings beat&#10;New product launch&#10;Market share gains"
              value={form.catalysts}
              onChange={e => setForm(f => ({ ...f, catalysts: e.target.value }))}
              className="w-full h-16 text-xs bg-muted border border-border rounded-md px-3 py-2 resize-none focus-visible:ring-1 focus-visible:ring-primary text-foreground"
              data-testid="textarea-thesis-catalysts"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Risks (one per line)</label>
            <textarea
              placeholder="Regulatory risk&#10;Competition&#10;Macro downturn"
              value={form.risks}
              onChange={e => setForm(f => ({ ...f, risks: e.target.value }))}
              className="w-full h-16 text-xs bg-muted border border-border rounded-md px-3 py-2 resize-none focus-visible:ring-1 focus-visible:ring-primary text-foreground"
              data-testid="textarea-thesis-risks"
            />
          </div>
          <Button onClick={handleSubmit} className="w-full h-8 text-xs" data-testid="button-submit-thesis">
            Save Thesis
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ThesesPage() {
  const [theses, setTheses] = useState(DEFAULT_THESES);
  const [expanded, setExpanded] = useState<number | null>(1);
  const { toast } = useToast();

  const handleAdd = (thesis: any) => {
    setTheses(prev => [thesis, ...prev]);
    toast({ title: `Thesis created for ${thesis.ticker}` });
  };

  const handleDelete = (id: number) => {
    setTheses(prev => prev.filter(t => t.id !== id));
    toast({ title: "Thesis deleted" });
  };

  const longs = theses.filter(t => t.direction === "long");
  const shorts = theses.filter(t => t.direction === "short");

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Investment Theses</h1>
          <p className="text-xs text-muted-foreground">{longs.length} longs · {shorts.length} shorts · structured conviction tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs badge-bullish">{longs.length} Long</Badge>
          <Badge variant="outline" className="text-xs badge-bearish">{shorts.length} Short</Badge>
          <NewThesisDialog onAdd={handleAdd} />
        </div>
      </div>

      {theses.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText size={40} className="text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-sm text-muted-foreground">No theses yet</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {theses.map(thesis => (
            <Card
              key={thesis.id}
              className={cn("bg-card border-border transition-colors", expanded === thesis.id && "glow-blue")}
              data-testid={`thesis-card-${thesis.id}`}
            >
              {/* Header row */}
              <div
                className="flex items-center gap-3 p-3 cursor-pointer"
                onClick={() => setExpanded(expanded === thesis.id ? null : thesis.id)}
              >
                <div className="flex-shrink-0">
                  <div className="font-mono font-bold text-base text-foreground">{thesis.ticker}</div>
                </div>
                <Badge className={cn("text-xs flex-shrink-0", thesis.direction === "long" ? "badge-bullish" : "badge-bearish")}>
                  {thesis.direction === "long" ? <TrendingUp size={10} className="mr-1" /> : <TrendingDown size={10} className="mr-1" />}
                  {thesis.direction.toUpperCase()}
                </Badge>
                <div className="flex-shrink-0">
                  <ConvictionStars n={thesis.conviction} />
                </div>
                <p className="flex-1 text-xs text-muted-foreground truncate">{thesis.companyName}</p>
                {thesis.targetPrice && (
                  <span className="text-xs font-mono text-primary flex-shrink-0">Target: ${thesis.targetPrice}</span>
                )}
                <span className="text-[10px] text-muted-foreground flex-shrink-0">{thesis.timeHorizon}</span>
                <Badge variant="outline" className="text-[10px] flex-shrink-0">{thesis.status}</Badge>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(thesis.id); }}
                  className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0"
                  data-testid={`button-delete-thesis-${thesis.id}`}
                >
                  <Trash2 size={12} />
                </button>
                {expanded === thesis.id ? <ChevronUp size={14} className="text-muted-foreground flex-shrink-0" /> : <ChevronDown size={14} className="text-muted-foreground flex-shrink-0" />}
              </div>

              {/* Expanded detail */}
              {expanded === thesis.id && (
                <div className="px-3 pb-3 border-t border-border pt-3 space-y-3 animate-fade-in">
                  <p className="text-xs text-foreground leading-relaxed">{thesis.thesis}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-up uppercase tracking-wider font-semibold mb-1.5">Catalysts</p>
                      <ul className="space-y-1">
                        {toStringArray(thesis.catalysts).map((c, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-foreground">
                            <TrendingUp size={10} className="text-up flex-shrink-0 mt-0.5" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] text-down uppercase tracking-wider font-semibold mb-1.5">Risks</p>
                      <ul className="space-y-1">
                        {toStringArray(thesis.risks).map((r, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-foreground">
                            <TrendingDown size={10} className="text-down flex-shrink-0 mt-0.5" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-1 text-[10px] text-muted-foreground border-t border-border">
                    <span>Created: {thesis.createdAt}</span>
                    <span>Time horizon: {thesis.timeHorizon}</span>
                    {thesis.targetPrice && <span>Price target: ${thesis.targetPrice}</span>}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { Plus, Bell, BellOff, Trash2, AlertTriangle, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const DEFAULT_ALERTS = [
  { id: 1, ticker: "NVDA", alertType: "price_above", threshold: 950, message: "NVDA crossed $950 — near analyst consensus target", isActive: 1, createdAt: "2025-03-01" },
  { id: 2, ticker: "TSLA", alertType: "price_below", threshold: 165, message: "TSLA dropped below $165 — monitor short position sizing", isActive: 1, createdAt: "2025-02-20" },
  { id: 3, ticker: "SPY", alertType: "price_below", threshold: 520, message: "SPY below $520 — risk-off signal, review portfolio", isActive: 1, createdAt: "2025-03-15" },
  { id: 4, ticker: "VIX", alertType: "price_above", threshold: 25, message: "VIX spike above 25 — elevate cash, reduce beta", isActive: 0, createdAt: "2025-01-10" },
  { id: 5, ticker: "AAPL", alertType: "earnings", threshold: null, message: "AAPL earnings in 48 hours — prepare analysis", isActive: 1, createdAt: "2025-04-01" },
];

const ALERT_TYPE_LABELS: Record<string, string> = {
  price_above: "Price Above",
  price_below: "Price Below",
  earnings: "Earnings Alert",
  news: "News Alert",
};

const ALERT_TYPE_ICONS: Record<string, any> = {
  price_above: TrendingUp,
  price_below: TrendingDown,
  earnings: Activity,
  news: Bell,
};

function NewAlertDialog({ onAdd }: { onAdd: (a: any) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ticker: "", alertType: "price_above", threshold: "", message: "" });

  const handleSubmit = () => {
    if (!form.ticker || !form.message) return;
    onAdd({
      id: Date.now(),
      ticker: form.ticker.toUpperCase(),
      alertType: form.alertType,
      threshold: parseFloat(form.threshold) || null,
      message: form.message,
      isActive: 1,
      createdAt: new Date().toISOString().split("T")[0],
    });
    setOpen(false);
    setForm({ ticker: "", alertType: "price_above", threshold: "", message: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-7 text-xs gap-1.5" data-testid="button-new-alert">
          <Plus size={13} /> New Alert
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-sm">Create Alert</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Ticker *</label>
              <Input placeholder="AAPL" value={form.ticker} onChange={e => setForm(f => ({ ...f, ticker: e.target.value.toUpperCase() }))} className="h-8 text-xs bg-muted border-border font-mono" data-testid="input-alert-ticker" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Alert Type</label>
              <Select value={form.alertType} onValueChange={v => setForm(f => ({ ...f, alertType: v }))}>
                <SelectTrigger className="h-8 text-xs bg-muted border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price_above">Price Above</SelectItem>
                  <SelectItem value="price_below">Price Below</SelectItem>
                  <SelectItem value="earnings">Earnings Alert</SelectItem>
                  <SelectItem value="news">News Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {(form.alertType === "price_above" || form.alertType === "price_below") && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Threshold Price</label>
              <Input type="number" placeholder="200.00" value={form.threshold} onChange={e => setForm(f => ({ ...f, threshold: e.target.value }))} className="h-8 text-xs bg-muted border-border font-mono" data-testid="input-alert-threshold" />
            </div>
          )}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Alert Message *</label>
            <Input placeholder="What should this alert tell you?" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="h-8 text-xs bg-muted border-border" data-testid="input-alert-message" />
          </div>
          <Button onClick={handleSubmit} className="w-full h-8 text-xs" data-testid="button-submit-alert">
            Create Alert
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(DEFAULT_ALERTS);
  const { toast } = useToast();

  const handleAdd = (alert: any) => {
    setAlerts(prev => [alert, ...prev]);
    toast({ title: `Alert created for ${alert.ticker}` });
  };

  const handleToggle = (id: number) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isActive: a.isActive ? 0 : 1 } : a));
  };

  const handleDelete = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    toast({ title: "Alert deleted" });
  };

  const active = alerts.filter(a => a.isActive);
  const inactive = alerts.filter(a => !a.isActive);

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Alerts</h1>
          <p className="text-xs text-muted-foreground">{active.length} active · {inactive.length} paused</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs badge-bullish">{active.length} Active</Badge>
          <NewAlertDialog onAdd={handleAdd} />
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Bell size={40} className="text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-sm text-muted-foreground">No alerts configured</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map(alert => {
            const TypeIcon = ALERT_TYPE_ICONS[alert.alertType] || Bell;
            const isUp = alert.alertType === "price_above";
            const isDown = alert.alertType === "price_below";
            return (
              <Card
                key={alert.id}
                className={cn("bg-card border-border transition-colors", !alert.isActive && "opacity-50")}
                data-testid={`alert-card-${alert.id}`}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      isUp ? "bg-green-500/10" : isDown ? "bg-red-500/10" : "bg-primary/10"
                    )}>
                      <TypeIcon size={14} className={isUp ? "text-up" : isDown ? "text-down" : "text-primary"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono font-bold text-sm text-foreground">{alert.ticker}</span>
                        <Badge variant="outline" className="text-[10px] py-0 h-4">{ALERT_TYPE_LABELS[alert.alertType]}</Badge>
                        {alert.threshold && (
                          <span className={cn("text-xs font-mono font-semibold", isUp ? "text-up" : "text-down")}>
                            ${alert.threshold}
                          </span>
                        )}
                        {!alert.isActive && <Badge variant="outline" className="text-[10px] py-0 h-4 text-muted-foreground">Paused</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Created {alert.createdAt}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleToggle(alert.id)}
                        className={cn(
                          "p-1.5 rounded transition-colors",
                          alert.isActive ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-muted"
                        )}
                        data-testid={`button-toggle-alert-${alert.id}`}
                        title={alert.isActive ? "Pause alert" : "Enable alert"}
                      >
                        {alert.isActive ? <Bell size={13} /> : <BellOff size={13} />}
                      </button>
                      <button
                        onClick={() => handleDelete(alert.id)}
                        className="p-1.5 rounded text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        data-testid={`button-delete-alert-${alert.id}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Alert summary */}
      <Card className="bg-primary/5 border-primary/20 mt-4">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={13} className="text-primary" />
            <span className="text-xs font-semibold text-primary">Alert Intelligence</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Alerts are checked against real-time market data. Price alerts trigger when intraday trades cross thresholds. 
            Earnings alerts activate 48h before confirmed report dates. 
            News alerts monitor high-importance AI signal scores above 80.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

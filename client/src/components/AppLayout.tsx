import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, TrendingUp, Newspaper, Search,
  BookMarked, FileText, Bell, ChevronLeft, ChevronRight,
  Sun, Moon, Zap, Activity, Settings
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

const NAV = [
  { path: "/", icon: LayoutDashboard, label: "Command Center" },
  { path: "/market", icon: TrendingUp, label: "Market Intelligence" },
  { path: "/news", icon: Newspaper, label: "News & Signals" },
  { path: "/company", icon: Search, label: "Company Deep Dive" },
  { path: "/watchlist", icon: BookMarked, label: "Watchlist" },
  { path: "/theses", icon: FileText, label: "Investment Theses" },
  { path: "/alerts", icon: Bell, label: "Alerts" },
];

// Simulated live ticker tape data
const TICKER_DATA = [
  { t: "SPY", p: "548.32", c: "+1.24%" },
  { t: "QQQ", p: "462.18", c: "+1.87%" },
  { t: "AAPL", p: "213.49", c: "+0.54%" },
  { t: "MSFT", p: "418.32", c: "+2.11%" },
  { t: "NVDA", p: "897.64", c: "+3.42%" },
  { t: "TSLA", p: "177.82", c: "-1.23%" },
  { t: "GOOGL", p: "172.45", c: "+0.89%" },
  { t: "AMZN", p: "197.12", c: "+1.56%" },
  { t: "META", p: "521.33", c: "+2.34%" },
  { t: "BRK-B", p: "448.21", c: "+0.12%" },
  { t: "JPM", p: "234.56", c: "+0.78%" },
  { t: "GS", p: "512.34", c: "+1.02%" },
  { t: "BTC-USD", p: "87,432", c: "+4.12%" },
  { t: "^VIX", p: "18.43", c: "-5.21%" },
  { t: "^DXY", p: "103.24", c: "-0.34%" },
  { t: "GC=F", p: "3,124.50", c: "+0.67%" },
  { t: "CL=F", p: "78.32", c: "-0.89%" },
  { t: "TNX", p: "4.32%", c: "+0.05" },
];

function TickerTape() {
  const doubled = [...TICKER_DATA, ...TICKER_DATA];
  return (
    <div className="bg-card border-b border-border overflow-hidden h-8 flex items-center">
      <div className="flex items-center gap-0 ticker-scroll whitespace-nowrap">
        {doubled.map((item, i) => {
          const isUp = item.c.startsWith("+");
          const isDown = item.c.startsWith("-");
          return (
            <span key={i} className="inline-flex items-center gap-1.5 px-4 text-xs">
              <span className="font-semibold text-foreground font-mono">{item.t}</span>
              <span className="font-mono text-muted-foreground">{item.p}</span>
              <span className={cn("font-mono font-medium", isUp ? "text-up" : isDown ? "text-down" : "text-flat")}>{item.c}</span>
              <span className="text-border mx-1">|</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();
  const { theme, toggle } = useTheme();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top ticker tape */}
      <TickerTape />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            "flex flex-col border-r border-border bg-sidebar transition-all duration-200 flex-shrink-0",
            collapsed ? "w-14" : "w-56"
          )}
          style={{ backgroundColor: 'hsl(var(--sidebar-background))' }}
        >
          {/* Logo */}
          <div className={cn("flex items-center gap-2.5 px-3 py-3 border-b border-border", collapsed && "justify-center px-0")}>
            <div className="flex-shrink-0">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="SamFynd" className="flex-shrink-0">
                <rect width="28" height="28" rx="6" fill="hsl(213 94% 60%)"/>
                <path d="M7 8h2.5v4.5L14.5 8H18l-5.5 5.2L18 20h-3.5l-4-5.2V20H7V8z" fill="hsl(222 28% 7%)"/>
                <circle cx="21" cy="9" r="2" fill="hsl(38 92% 58%)"/>
              </svg>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-xs font-bold tracking-widest text-foreground uppercase">SamFynd</div>
                <div className="text-[10px] text-muted-foreground tracking-wide">Analyst Platform</div>
              </div>
            )}
          </div>

          {/* Status indicator */}
          {!collapsed && (
            <div className="px-3 py-2 border-b border-border">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0"/>
                <span>MARKETS OPEN • NYSE</span>
              </div>
            </div>
          )}

          {/* Nav */}
          <nav className="flex-1 py-2 overflow-y-auto">
            {NAV.map(({ path, icon: Icon, label }) => {
              const active = path === "/" ? location === "/" : location.startsWith(path);
              return (
                <Link key={path} href={path}>
                  <div
                    data-testid={`nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-md cursor-pointer transition-colors text-xs font-medium",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      collapsed && "justify-center px-0 mx-0.5"
                    )}
                  >
                    <Icon size={15} className="flex-shrink-0" />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Bottom controls */}
          <div className="border-t border-border p-2 flex flex-col gap-1">
            <button
              onClick={toggle}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xs w-full"
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? <Sun size={14} className="flex-shrink-0" /> : <Moon size={14} className="flex-shrink-0" />}
              {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
            </button>
            <button
              onClick={() => setCollapsed(c => !c)}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xs w-full"
              data-testid="button-collapse-sidebar"
            >
              {collapsed ? <ChevronRight size={14} className="flex-shrink-0" /> : <ChevronLeft size={14} className="flex-shrink-0" />}
              {!collapsed && <span>Collapse</span>}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}

import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "./components/ThemeProvider";
import { AppLayout } from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import MarketPage from "./pages/MarketPage";
import NewsPage from "./pages/NewsPage";
import CompanyPage from "./pages/CompanyPage";
import WatchlistPage from "./pages/WatchlistPage";
import ThesesPage from "./pages/ThesesPage";
import AlertsPage from "./pages/AlertsPage";
import NotFound from "./pages/not-found";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router hook={useHashLocation}>
          <AppLayout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/market" component={MarketPage} />
              <Route path="/news" component={NewsPage} />
              <Route path="/company/:ticker" component={CompanyPage} />
              <Route path="/company" component={CompanyPage} />
              <Route path="/watchlist" component={WatchlistPage} />
              <Route path="/theses" component={ThesesPage} />
              <Route path="/alerts" component={AlertsPage} />
              <Route component={NotFound} />
            </Switch>
          </AppLayout>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

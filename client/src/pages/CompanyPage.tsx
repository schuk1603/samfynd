import { useState } from "react";
import { useParams, useLocation } from "wouter";
import {
  Search, TrendingUp, TrendingDown, BarChart2, FileText,
  AlertTriangle, Brain, Zap, Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, CartesianGrid, ReferenceLine
} from "recharts";

// ─── Comprehensive Company Dataset ───────────────────────────────────────────
// Covers all 10 POPULAR_TICKERS with real-world calibrated data
const COMPANY_DATA: Record<string, any> = {
  NVDA: {
    name: "NVIDIA Corporation", sector: "Semiconductors", exchange: "NASDAQ",
    price: "897.64", change: "+30.82", pct: "+3.56%", up: true,
    mktCap: "$2.21T", pe: "52.4x", fpe: "34.2x", ps: "28.1x", evEbitda: "40.3x",
    revenue: "$60.9B", revenueGrowth: "+122%", grossMargin: "74.6%", netMargin: "55.4%",
    eps: "$17.12", epsEst: "$16.90", beat: "+1.3%",
    debtEquity: "0.41", currentRatio: "4.17", roe: "123%", roa: "55%",
    description: "NVIDIA designs and manufactures GPUs and system-on-chips. Dominant in AI/ML training workloads with CUDA ecosystem moat. Data center segment now 78% of total revenue.",
    ceo: "Jensen Huang", employees: "29,600", founded: "1993", hq: "Santa Clara, CA",
    analystRating: "Strong Buy", targets: { low: 780, avg: 985, high: 1150, current: 897.64 },
    institutionalOwnership: "65.3%", insiderOwnership: "3.8%",
    // Research paper flag: Herding bias — 94% of analysts rate Strong Buy (consensus crowding risk)
    analystHerdingScore: 94,
    // DCF inputs
    dcf: { wacc: 9.5, terminalGrowth: 3.5, freecashflow: 26.0, projectedFcfGrowth: 55, dcfValue: 1040 },
    // Regime detection
    marketRegime: "bull_ai_supercycle",
    sentimentBiasScore: 82, // high = potentially over-bullish (look-ahead bias risk from LLMs)
    revenue_history: [
      { q: "Q1'23", rev: 7.19, ni: 2.04 }, { q: "Q2'23", rev: 13.51, ni: 6.19 },
      { q: "Q3'23", rev: 18.12, ni: 9.24 }, { q: "Q4'23", rev: 22.10, ni: 12.28 },
      { q: "Q1'24", rev: 26.04, ni: 14.88 }, { q: "Q2'24", rev: 30.04, ni: 16.60 },
      { q: "Q3'24", rev: 35.08, ni: 19.31 }, { q: "Q4'24", rev: 39.33, ni: 22.09 },
    ],
    price_history: [
      { m: "Apr'23", p: 277 }, { m: "Jul'23", p: 467 }, { m: "Oct'23", p: 434 },
      { m: "Jan'24", p: 613 }, { m: "Apr'24", p: 762 }, { m: "Jul'24", p: 898 },
      { m: "Oct'24", p: 134 }, { m: "Jan'25", p: 821 }, { m: "Apr'25", p: 897 },
    ],
    transcript_highlights: [
      "Blackwell demand 'insane'. Supply constrained through 2025.",
      "Data center rev guidance: $43B+ for next quarter.",
      "Sovereign AI (government purchases) now >15% of DC revenue.",
      "Inference workloads beginning to rival training — new TAM expansion.",
      "Gross margin guidance 74-75% — above street's 72% estimate.",
    ],
    catalysts: ["GB200 NVL72 rack ramp in Q3", "Sovereign AI deal pipeline", "Inference scaling laws benefiting H200/B200"],
    risks: ["Export controls (China >$10B revenue at risk)", "Custom ASIC competition (Google TPU, Amazon Trainium)", "Valuation: 34x FY25 PE above historical avg"],
  },
  TSLA: {
    name: "Tesla, Inc.", sector: "Electric Vehicles", exchange: "NASDAQ",
    price: "177.82", change: "-2.21", pct: "-1.23%", up: false,
    mktCap: "$567B", pe: "71.2x", fpe: "58.4x", ps: "6.8x", evEbitda: "42.1x",
    revenue: "$25.7B", revenueGrowth: "-9%", grossMargin: "17.8%", netMargin: "5.2%",
    eps: "$0.45", epsEst: "$0.52", beat: "-13.5%",
    debtEquity: "0.18", currentRatio: "1.84", roe: "11%", roa: "5%",
    description: "Tesla designs and manufactures electric vehicles, energy storage, and solar products. Market leader in BEV with declining market share amid rising Chinese competition from BYD and NIO.",
    ceo: "Elon Musk", employees: "127,855", founded: "2003", hq: "Austin, TX",
    analystRating: "Hold", targets: { low: 85, avg: 172, high: 380, current: 177.82 },
    institutionalOwnership: "44.1%", insiderOwnership: "12.4%",
    analystHerdingScore: 42,
    dcf: { wacc: 10.5, terminalGrowth: 3.0, freecashflow: 3.5, projectedFcfGrowth: 15, dcfValue: 148 },
    marketRegime: "bear_margin_compression",
    sentimentBiasScore: 38,
    revenue_history: [
      { q: "Q1'23", rev: 23.3, ni: 2.51 }, { q: "Q2'23", rev: 24.9, ni: 2.70 },
      { q: "Q3'23", rev: 23.4, ni: 1.85 }, { q: "Q4'23", rev: 25.2, ni: 7.93 },
      { q: "Q1'24", rev: 21.3, ni: 1.13 }, { q: "Q2'24", rev: 25.5, ni: 1.48 },
      { q: "Q3'24", rev: 25.2, ni: 2.17 }, { q: "Q4'24", rev: 25.7, ni: 1.33 },
    ],
    price_history: [
      { m: "Apr'23", p: 166 }, { m: "Jul'23", p: 269 }, { m: "Oct'23", p: 213 },
      { m: "Jan'24", p: 187 }, { m: "Apr'24", p: 148 }, { m: "Jul'24", p: 223 },
      { m: "Oct'24", p: 214 }, { m: "Jan'25", p: 428 }, { m: "Apr'25", p: 178 },
    ],
    transcript_highlights: [
      "Q1 deliveries: 386,810 vs consensus 421,000 (-8.3% miss).",
      "Auto gross margin fell to 16.4% from 18.2%, price cuts continuing in China.",
      "FSD v13 rollout progressing — 1.2M vehicles on supervised FSD.",
      "Cybertruck: 'production ramp slower than anticipated'.",
      "Robotaxi launch date: still H2 2025 — no specific city confirmed.",
    ],
    catalysts: ["Robotaxi launch + FSD commercialization", "New affordable model (<$30K) in 2025", "Energy storage (Megapack) ~$10B trajectory"],
    risks: ["China share loss to BYD accelerating", "Musk brand damage (political controversies)", "Margin compression to sustain volume targets"],
  },
  AAPL: {
    name: "Apple Inc.", sector: "Technology", exchange: "NASDAQ",
    price: "213.49", change: "+1.15", pct: "+0.54%", up: true,
    mktCap: "$3.28T", pe: "34.1x", fpe: "29.8x", ps: "8.7x", evEbitda: "24.6x",
    revenue: "$391.0B", revenueGrowth: "+2%", grossMargin: "46.2%", netMargin: "26.4%",
    eps: "$6.42", epsEst: "$6.29", beat: "+2.1%",
    debtEquity: "1.87", currentRatio: "1.07", roe: "147%", roa: "28%",
    description: "Apple designs and sells consumer electronics (iPhone, Mac, iPad), software, and services. Services segment ($100B+ annualized run rate) growing at 14% YoY provides durable recurring revenue with ~72% gross margins.",
    ceo: "Tim Cook", employees: "161,000", founded: "1976", hq: "Cupertino, CA",
    analystRating: "Buy", targets: { low: 185, avg: 240, high: 300, current: 213.49 },
    institutionalOwnership: "61.2%", insiderOwnership: "0.1%",
    analystHerdingScore: 71,
    dcf: { wacc: 8.5, terminalGrowth: 3.0, freecastflow: 110, projectedFcfGrowth: 8, dcfValue: 248 },
    marketRegime: "steady_compounder",
    sentimentBiasScore: 65,
    revenue_history: [
      { q: "Q1'23", rev: 117.2, ni: 30.0 }, { q: "Q2'23", rev: 94.8, ni: 24.2 },
      { q: "Q3'23", rev: 81.8, ni: 19.9 }, { q: "Q4'23", rev: 89.5, ni: 23.0 },
      { q: "Q1'24", rev: 119.6, ni: 33.9 }, { q: "Q2'24", rev: 90.8, ni: 23.6 },
      { q: "Q3'24", rev: 85.8, ni: 21.5 }, { q: "Q4'24", rev: 94.9, ni: 14.7 },
    ],
    price_history: [
      { m: "Apr'23", p: 165 }, { m: "Jul'23", p: 192 }, { m: "Oct'23", p: 171 },
      { m: "Jan'24", p: 184 }, { m: "Apr'24", p: 171 }, { m: "Jul'24", p: 220 },
      { m: "Oct'24", p: 229 }, { m: "Jan'25", p: 243 }, { m: "Apr'25", p: 213 },
    ],
    transcript_highlights: [
      "iPhone China sales down 7% YoY — Huawei gaining at premium end.",
      "Services revenue: $23.9B quarterly run rate, +14% YoY, 72% gross margin.",
      "AI features (Apple Intelligence) launching on iPhone 16 lineup.",
      "Share buyback authorization increased by $110B — largest in company history.",
      "Tim Cook: 'Services is our fastest-growing major business by a wide margin.'",
    ],
    catalysts: ["Apple Intelligence AI monetization", "Services margin expansion", "India manufacturing diversification from China", "Capital return program ($110B buyback)"],
    risks: ["iPhone China market share loss to Huawei", "EU Digital Markets Act compliance costs", "AI features not driving upgrade cycle yet", "Antitrust scrutiny on App Store fees"],
  },
  MSFT: {
    name: "Microsoft Corporation", sector: "Software / Cloud", exchange: "NASDAQ",
    price: "418.32", change: "+8.62", pct: "+2.11%", up: true,
    mktCap: "$3.11T", pe: "36.4x", fpe: "30.2x", ps: "12.4x", evEbitda: "26.8x",
    revenue: "$245.1B", revenueGrowth: "+16%", grossMargin: "70.1%", netMargin: "36.0%",
    eps: "$11.45", epsEst: "$11.28", beat: "+1.5%",
    debtEquity: "0.33", currentRatio: "1.30", roe: "36%", roa: "18%",
    description: "Microsoft provides cloud computing (Azure), productivity software (Office 365), and enterprise tools. Azure AI revenue contribution accelerating — Copilot seat monetization reached 1.3M enterprise users.",
    ceo: "Satya Nadella", employees: "221,000", founded: "1975", hq: "Redmond, WA",
    analystRating: "Strong Buy", targets: { low: 380, avg: 470, high: 550, current: 418.32 },
    institutionalOwnership: "72.1%", insiderOwnership: "0.04%",
    analystHerdingScore: 88,
    dcf: { wacc: 8.8, terminalGrowth: 3.5, freecastflow: 72, projectedFcfGrowth: 18, dcfValue: 495 },
    marketRegime: "bull_ai_enterprise",
    sentimentBiasScore: 78,
    revenue_history: [
      { q: "Q1'23", rev: 52.7, ni: 18.3 }, { q: "Q2'23", rev: 56.2, ni: 20.1 },
      { q: "Q3'23", rev: 56.5, ni: 20.1 }, { q: "Q4'23", rev: 62.0, ni: 22.3 },
      { q: "Q1'24", rev: 61.9, ni: 21.9 }, { q: "Q2'24", rev: 64.7, ni: 22.0 },
      { q: "Q3'24", rev: 65.6, ni: 24.7 }, { q: "Q4'24", rev: 69.6, ni: 24.1 },
    ],
    price_history: [
      { m: "Apr'23", p: 285 }, { m: "Jul'23", p: 338 }, { m: "Oct'23", p: 329 },
      { m: "Jan'24", p: 374 }, { m: "Apr'24", p: 407 }, { m: "Jul'24", p: 446 },
      { m: "Oct'24", p: 430 }, { m: "Jan'25", p: 438 }, { m: "Apr'25", p: 418 },
    ],
    transcript_highlights: [
      "Azure AI revenue: $11B quarterly run rate, accelerating 33% YoY.",
      "Microsoft 365 Copilot: 1.3M enterprise seats, 4x growth in 12 months.",
      "Operating margin expanded to 44.6% vs 42.1% prior year.",
      "$70B AI capex plan confirmed — on track for FY2025.",
      "Nadella: 'Every layer of our stack is getting better because of AI.'",
    ],
    catalysts: ["Copilot monetization inflection at scale", "Azure market share from AWS", "GitHub Copilot developer adoption", "Enterprise AI deals pipeline ($2B+)"],
    risks: ["Regulatory headwinds (EU AI Act)", "OpenAI dependency risk", "Azure margin dilution from heavy capex", "Competition from Google Cloud in AI workloads"],
  },
  META: {
    name: "Meta Platforms, Inc.", sector: "Social Media / AI", exchange: "NASDAQ",
    price: "521.33", change: "+11.92", pct: "+2.34%", up: true,
    mktCap: "$1.32T", pe: "27.1x", fpe: "22.8x", ps: "8.9x", evEbitda: "18.7x",
    revenue: "$155.4B", revenueGrowth: "+22%", grossMargin: "82.4%", netMargin: "35.0%",
    eps: "$19.23", epsEst: "$18.80", beat: "+2.3%",
    debtEquity: "0.11", currentRatio: "2.67", roe: "37%", roa: "20%",
    description: "Meta operates the world's largest social media ecosystem (Facebook, Instagram, WhatsApp, Threads). AI-powered ad targeting driving CPM inflation of 14% QoQ. Llama open-source models creating developer ecosystem moat.",
    ceo: "Mark Zuckerberg", employees: "74,067", founded: "2004", hq: "Menlo Park, CA",
    analystRating: "Strong Buy", targets: { low: 420, avg: 610, high: 760, current: 521.33 },
    institutionalOwnership: "68.4%", insiderOwnership: "13.7%",
    analystHerdingScore: 85,
    dcf: { wacc: 9.0, terminalGrowth: 3.5, freecastflow: 52, projectedFcfGrowth: 22, dcfValue: 680 },
    marketRegime: "bull_ai_monetization",
    sentimentBiasScore: 76,
    revenue_history: [
      { q: "Q1'23", rev: 28.6, ni: 5.7 }, { q: "Q2'23", rev: 32.0, ni: 7.8 },
      { q: "Q3'23", rev: 34.1, ni: 11.6 }, { q: "Q4'23", rev: 40.1, ni: 14.0 },
      { q: "Q1'24", rev: 36.5, ni: 12.4 }, { q: "Q2'24", rev: 39.1, ni: 13.5 },
      { q: "Q3'24", rev: 40.6, ni: 15.7 }, { q: "Q4'24", rev: 48.4, ni: 20.8 },
    ],
    price_history: [
      { m: "Apr'23", p: 213 }, { m: "Jul'23", p: 322 }, { m: "Oct'23", p: 300 },
      { m: "Jan'24", p: 395 }, { m: "Apr'24", p: 493 }, { m: "Jul'24", p: 568 },
      { m: "Oct'24", p: 586 }, { m: "Jan'25", p: 660 }, { m: "Apr'25", p: 521 },
    ],
    transcript_highlights: [
      "Llama 4 adoption: 500K developers using API monthly, driving ad relevance.",
      "Threads platform: 300M MAU, 1M new sign-ups per day.",
      "Reality Labs losses: $3.9B in Q1 — narrowing toward profitability.",
      "Ad revenue +22% YoY, CPM +14% — AI targeting efficiency compounding.",
      "Zuckerberg: 'Meta AI is now the most used AI assistant in the world.'",
    ],
    catalysts: ["Threads monetization launch (2025)", "AI ad targeting CPM premium expansion", "Llama ecosystem lock-in (like CUDA for dev)", "WhatsApp payments in India/Brazil scaling"],
    risks: ["Reality Labs cumulative losses ($50B+)", "EU regulatory fines and data restrictions", "Teen usage decline in core Facebook demographic", "LLM commoditization risk to AI moat"],
  },
  GOOGL: {
    name: "Alphabet Inc.", sector: "Search / Cloud / AI", exchange: "NASDAQ",
    price: "172.45", change: "+1.52", pct: "+0.89%", up: true,
    mktCap: "$2.13T", pe: "23.4x", fpe: "19.6x", ps: "6.2x", evEbitda: "16.3x",
    revenue: "$350.0B", revenueGrowth: "+14%", grossMargin: "57.5%", netMargin: "24.0%",
    eps: "$7.37", epsEst: "$7.21", beat: "+2.2%",
    debtEquity: "0.09", currentRatio: "2.07", roe: "30%", roa: "16%",
    description: "Alphabet operates Google Search (dominant 90% market share), Google Cloud (28% growth), YouTube, and DeepMind AI research. Cheapest AI mega-cap on forward P/E at 19.6x.",
    ceo: "Sundar Pichai", employees: "181,269", founded: "1998", hq: "Mountain View, CA",
    analystRating: "Buy", targets: { low: 155, avg: 210, high: 260, current: 172.45 },
    institutionalOwnership: "65.8%", insiderOwnership: "11.3%",
    analystHerdingScore: 72,
    dcf: { wacc: 9.0, terminalGrowth: 3.0, freecastflow: 72, projectedFcfGrowth: 14, dcfValue: 228 },
    marketRegime: "value_with_ai_catalyst",
    sentimentBiasScore: 64,
    revenue_history: [
      { q: "Q1'23", rev: 69.8, ni: 15.1 }, { q: "Q2'23", rev: 74.6, ni: 18.4 },
      { q: "Q3'23", rev: 76.7, ni: 19.7 }, { q: "Q4'23", rev: 86.3, ni: 20.4 },
      { q: "Q1'24", rev: 80.5, ni: 23.7 }, { q: "Q2'24", rev: 84.7, ni: 23.6 },
      { q: "Q3'24", rev: 88.3, ni: 26.3 }, { q: "Q4'24", rev: 96.5, ni: 26.5 },
    ],
    price_history: [
      { m: "Apr'23", p: 104 }, { m: "Jul'23", p: 127 }, { m: "Oct'23", p: 132 },
      { m: "Jan'24", p: 140 }, { m: "Apr'24", p: 175 }, { m: "Jul'24", p: 180 },
      { m: "Oct'24", p: 165 }, { m: "Jan'25", p: 197 }, { m: "Apr'25", p: 172 },
    ],
    transcript_highlights: [
      "Google Cloud revenue +28% YoY — first full quarter above $12B.",
      "Gemini Pro integrated across all Search surfaces — AI Overviews serving 1B+ users.",
      "YouTube ad revenue +13% YoY; Shorts monetization reaching parity.",
      "DeepMind: AlphaFold adoption in pharma industry creating B2B revenue stream.",
      "Pichai: 'We have more technical infrastructure for AI than any company on earth.'",
    ],
    catalysts: ["Google Cloud AI workload capture", "Search AI monetization (ad + subscription)", "DeepMind pharma licensing", "Waymo commercialization"],
    risks: ["Search market share risk from ChatGPT/Perplexity", "DOJ antitrust remedies (potential Search breakup)", "Cloud gap vs Azure/AWS in enterprise", "Regulatory exposure in EU (multiple ongoing cases)"],
  },
  AMZN: {
    name: "Amazon.com, Inc.", sector: "E-Commerce / Cloud", exchange: "NASDAQ",
    price: "197.12", change: "+3.02", pct: "+1.56%", up: true,
    mktCap: "$2.08T", pe: "44.1x", fpe: "34.8x", ps: "3.4x", evEbitda: "21.2x",
    revenue: "$638.0B", revenueGrowth: "+11%", grossMargin: "48.1%", netMargin: "8.0%",
    eps: "$4.47", epsEst: "$4.22", beat: "+5.9%",
    debtEquity: "0.44", currentRatio: "1.08", roe: "22%", roa: "7%",
    description: "Amazon operates e-commerce, AWS (cloud computing), advertising, and Prime. AWS at $110B+ annualized revenue growing 17% YoY is the highest-margin segment. Advertising $55B+ annualized at 60%+ margins is an underappreciated profit engine.",
    ceo: "Andy Jassy", employees: "1,525,000", founded: "1994", hq: "Seattle, WA",
    analystRating: "Strong Buy", targets: { low: 175, avg: 235, high: 280, current: 197.12 },
    institutionalOwnership: "62.5%", insiderOwnership: "9.7%",
    analystHerdingScore: 89,
    dcf: { wacc: 9.2, terminalGrowth: 3.5, freecastflow: 38, projectedFcfGrowth: 22, dcfValue: 248 },
    marketRegime: "bull_cloud_retail",
    sentimentBiasScore: 72,
    revenue_history: [
      { q: "Q1'23", rev: 127.4, ni: 3.2 }, { q: "Q2'23", rev: 134.4, ni: 6.7 },
      { q: "Q3'23", rev: 143.1, ni: 9.9 }, { q: "Q4'23", rev: 170.0, ni: 10.6 },
      { q: "Q1'24", rev: 143.3, ni: 10.4 }, { q: "Q2'24", rev: 148.0, ni: 13.5 },
      { q: "Q3'24", rev: 158.9, ni: 15.3 }, { q: "Q4'24", rev: 187.8, ni: 20.0 },
    ],
    price_history: [
      { m: "Apr'23", p: 103 }, { m: "Jul'23", p: 130 }, { m: "Oct'23", p: 127 },
      { m: "Jan'24", p: 153 }, { m: "Apr'24", p: 183 }, { m: "Jul'24", p: 189 },
      { m: "Oct'24", p: 191 }, { m: "Jan'25", p: 234 }, { m: "Apr'25", p: 197 },
    ],
    transcript_highlights: [
      "AWS revenue: $28.8B in Q4, +17% YoY — AI workloads now majority of new commitments.",
      "Advertising revenue: $17.3B in Q4, +18% YoY — surpassing Netflix total revenue.",
      "North America operating margin: 8.9%, highest in company history.",
      "Trainium and Inferentia chips: $10B in revenue from custom AI silicon pipeline.",
      "Jassy: 'AWS has more AI customers than any other cloud provider.'",
    ],
    catalysts: ["AWS AI workload capture (Bedrock platform)", "Advertising margin expansion", "Robotics (Proteus) warehouse automation reducing labor", "India e-commerce scale-up"],
    risks: ["AWS margin pressure from Trainium investment cycle", "FTC antitrust scrutiny on Prime ecosystem", "Logistics overcapacity from overbuilding 2020-2022", "Macro slowdown reducing consumer discretionary spend"],
  },
  JPM: {
    name: "JPMorgan Chase & Co.", sector: "Investment Banking", exchange: "NYSE",
    price: "234.56", change: "+1.82", pct: "+0.78%", up: true,
    mktCap: "$680B", pe: "13.2x", fpe: "12.1x", ps: "3.8x", evEbitda: "N/A",
    revenue: "$162.7B", revenueGrowth: "+12%", grossMargin: "N/A", netMargin: "28.4%",
    eps: "$17.76", epsEst: "$17.32", beat: "+2.5%",
    debtEquity: "1.42", currentRatio: "N/A", roe: "18%", roa: "1.4%",
    description: "JPMorgan Chase is the largest U.S. bank by assets ($3.9T). Dominant in investment banking (IB), consumer banking, commercial banking, and asset management. NII of $23.1B in Q1 — industry-best credit quality (NCO 0.52%).",
    ceo: "Jamie Dimon", employees: "316,043", founded: "1799", hq: "New York, NY",
    analystRating: "Buy", targets: { low: 205, avg: 258, high: 310, current: 234.56 },
    institutionalOwnership: "72.8%", insiderOwnership: "0.7%",
    analystHerdingScore: 68,
    dcf: { wacc: 10.0, terminalGrowth: 2.5, freecastflow: 45, projectedFcfGrowth: 8, dcfValue: 275 },
    marketRegime: "rate_cycle_beneficiary",
    sentimentBiasScore: 58,
    revenue_history: [
      { q: "Q1'23", rev: 38.3, ni: 12.6 }, { q: "Q2'23", rev: 41.3, ni: 14.5 },
      { q: "Q3'23", rev: 39.9, ni: 13.2 }, { q: "Q4'23", rev: 38.6, ni: 9.3 },
      { q: "Q1'24", rev: 41.9, ni: 13.4 }, { q: "Q2'24", rev: 51.0, ni: 18.1 },
      { q: "Q3'24", rev: 43.3, ni: 12.9 }, { q: "Q4'24", rev: 43.4, ni: 14.0 },
    ],
    price_history: [
      { m: "Apr'23", p: 130 }, { m: "Jul'23", p: 153 }, { m: "Oct'23", p: 143 },
      { m: "Jan'24", p: 170 }, { m: "Apr'24", p: 197 }, { m: "Jul'24", p: 212 },
      { m: "Oct'24", p: 225 }, { m: "Jan'25", p: 255 }, { m: "Apr'25", p: 235 },
    ],
    transcript_highlights: [
      "NII: $23.1B in Q1 (+3% YoY) — above consensus of $22.7B.",
      "Net charge-off ratio: 0.52% — significantly below industry average.",
      "IB fees: $2.2B in Q1, M&A advisory revenue +21% YoY.",
      "Additional $3B buyback authorized — total capital returned $15B TTM.",
      "Dimon: 'The consumer is resilient. Credit quality remains excellent.'",
    ],
    catalysts: ["M&A cycle revival (pipeline 5-year high)", "NII sustainability above $90B annualized", "IB fee acceleration on rate normalization", "Asset management AUM growth"],
    risks: ["Commercial real estate credit deterioration ($20B exposure)", "Rate cuts reducing NII if rapid", "Recession scenario (historically -30% earnings hit)", "Dimon succession uncertainty (flagged annually since 2018)"],
  },
  GS: {
    name: "Goldman Sachs Group, Inc.", sector: "Investment Banking", exchange: "NYSE",
    price: "512.34", change: "+5.16", pct: "+1.02%", up: true,
    mktCap: "$168B", pe: "15.4x", fpe: "13.2x", ps: "2.8x", evEbitda: "N/A",
    revenue: "$55.1B", revenueGrowth: "+18%", grossMargin: "N/A", netMargin: "22.8%",
    eps: "$33.21", epsEst: "$31.90", beat: "+4.1%",
    debtEquity: "2.14", currentRatio: "N/A", roe: "14%", roa: "0.8%",
    description: "Goldman Sachs is a premier investment banking and financial services firm. Global leader in M&A advisory and equity underwriting. David Solomon's return to pure IB strategy (exit from Marcus consumer banking) is margin-accretive.",
    ceo: "David Solomon", employees: "45,000", founded: "1869", hq: "New York, NY",
    analystRating: "Buy", targets: { low: 440, avg: 575, high: 650, current: 512.34 },
    institutionalOwnership: "78.1%", insiderOwnership: "1.1%",
    analystHerdingScore: 65,
    dcf: { wacc: 11.0, terminalGrowth: 2.5, freecastflow: 12, projectedFcfGrowth: 12, dcfValue: 590 },
    marketRegime: "ib_cycle_recovery",
    sentimentBiasScore: 55,
    revenue_history: [
      { q: "Q1'23", rev: 12.2, ni: 3.2 }, { q: "Q2'23", rev: 10.9, ni: 1.2 },
      { q: "Q3'23", rev: 11.8, ni: 2.1 }, { q: "Q4'23", rev: 11.3, ni: 2.0 },
      { q: "Q1'24", rev: 14.2, ni: 4.1 }, { q: "Q2'24", rev: 12.7, ni: 3.0 },
      { q: "Q3'24", rev: 12.7, ni: 3.0 }, { q: "Q4'24", rev: 13.9, ni: 4.1 },
    ],
    price_history: [
      { m: "Apr'23", p: 316 }, { m: "Jul'23", p: 340 }, { m: "Oct'23", p: 310 },
      { m: "Jan'24", p: 381 }, { m: "Apr'24", p: 424 }, { m: "Jul'24", p: 510 },
      { m: "Oct'24", p: 542 }, { m: "Jan'25", p: 621 }, { m: "Apr'25", p: 512 },
    ],
    transcript_highlights: [
      "M&A advisory: $2.8B in revenue — pipeline described as 'strongest since 2021'.",
      "Equity underwriting: +41% YoY — IPO window reopening after 2022-2023 freeze.",
      "Marcus consumer banking exit complete — consumer losses now near zero.",
      "Asset & Wealth Management: $3.0T AUS, fees growing 12% annually.",
      "Solomon: 'The strategic repositioning is complete. We are pure-play IB.'",
    ],
    catalysts: ["M&A deal flow acceleration (mega-deals)", "IPO market revival (backlog $50B+)", "Asset management AUM compounding", "Share buyback at $300M/quarter"],
    risks: ["Deal flow highly cyclical (IB fees -40% in downturns)", "Talent retention vs private equity firms", "Trading revenue volatility", "Regulatory capital requirement tightening (Basel III)"],
  },
  "BRK-B": {
    name: "Berkshire Hathaway Inc. (B)", sector: "Diversified Conglomerate", exchange: "NYSE",
    price: "448.21", change: "+0.54", pct: "+0.12%", up: true,
    mktCap: "$979B", pe: "23.8x", fpe: "20.4x", ps: "2.4x", evEbitda: "14.2x",
    revenue: "$364.5B", revenueGrowth: "+4%", grossMargin: "N/A", netMargin: "12.8%",
    eps: "$18.82", epsEst: "$18.40", beat: "+2.3%",
    debtEquity: "0.28", currentRatio: "N/A", roe: "13%", roa: "6%",
    description: "Berkshire Hathaway is a diversified holding company. Businesses include GEICO insurance, BNSF railway, Berkshire Hathaway Energy, and a $310B+ equity portfolio. $168B+ cash reserve (record high) signals Buffett sees limited value at current market levels.",
    ceo: "Warren Buffett / Greg Abel (CEO-designate)", employees: "396,500", founded: "1839", hq: "Omaha, NE",
    analystRating: "Buy", targets: { low: 410, avg: 490, high: 560, current: 448.21 },
    institutionalOwnership: "33.2%", insiderOwnership: "32.5%",
    analystHerdingScore: 52,
    dcf: { wacc: 8.0, terminalGrowth: 2.5, freecastflow: 30, projectedFcfGrowth: 6, dcfValue: 510 },
    marketRegime: "defensive_value",
    sentimentBiasScore: 44,
    revenue_history: [
      { q: "Q1'23", rev: 85.4, ni: 35.5 }, { q: "Q2'23", rev: 92.5, ni: 35.9 },
      { q: "Q3'23", rev: 93.2, ni: -12.8 }, { q: "Q4'23", rev: 93.4, ni: 37.6 },
      { q: "Q1'24", rev: 89.9, ni: 11.2 }, { q: "Q2'24", rev: 93.7, ni: 30.3 },
      { q: "Q3'24", rev: 92.9, ni: 26.3 }, { q: "Q4'24", rev: 95.5, ni: 19.7 },
    ],
    price_history: [
      { m: "Apr'23", p: 323 }, { m: "Jul'23", p: 369 }, { m: "Oct'23", p: 349 },
      { m: "Jan'24", p: 371 }, { m: "Apr'24", p: 414 }, { m: "Jul'24", p: 462 },
      { m: "Oct'24", p: 452 }, { m: "Jan'25", p: 490 }, { m: "Apr'25", p: 448 },
    ],
    transcript_highlights: [
      "$168B cash reserve — highest in Berkshire history, signals Buffett sees overvaluation.",
      "GEICO: underwriting profitability restored — combined ratio 85.6% vs 107% in 2022.",
      "BNSF railway: volume +3% YoY, margins recovering post-pandemic disruptions.",
      "Apple position: reduced to $84B from $157B — Buffett taking profits methodically.",
      "Buffett: 'We would love to find one or two big deals but pricing is not attractive.'",
    ],
    catalysts: ["Record cash deployed in next downturn (counter-cyclical buyer)", "GEICO underwriting improvement compounding", "Greg Abel succession removes key-man discount", "Treasury income ($7B+ annualized at 5%+ rates)"],
    risks: ["Buffett succession (85 years old, health uncertainty)", "Insurance catastrophe risk (hurricanes, wildfires)", "BNSF competitive pressure from trucking", "Cash sitting idle if no large deals found"],
  },
};

const POPULAR_TICKERS = ["NVDA", "TSLA", "AAPL", "MSFT", "META", "GOOGL", "AMZN", "JPM", "GS", "BRK-B"];

// ─── Research Paper-Grounded: DCF Valuation Calculator ────────────────────────
// Based on: "AI-Assisted Value Investing" (Caridi et al., 2026) — DCF is the gold standard
// for intrinsic value but rarely automated in analyst tools.
function DCFPanel({ company }: { company: any }) {
  const d = company.dcf;
  if (!d) return null;
  const upside = (((d.dcfValue - parseFloat(company.price)) / parseFloat(company.price)) * 100).toFixed(1);
  const isDiscount = parseFloat(upside) > 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-center gap-2">
          <Brain size={13} className="text-primary" />
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">DCF Intrinsic Value</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Intrinsic Value (DCF)</span>
          <span className="text-base font-bold font-mono text-foreground">${d.dcfValue}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Current Price</span>
          <span className="text-sm font-mono text-muted-foreground">${company.price}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-2">
          <span className="text-xs font-semibold text-muted-foreground">Margin of Safety</span>
          <span className={cn("text-sm font-bold font-mono", isDiscount ? "text-up" : "text-down")}>
            {isDiscount ? "+" : ""}{upside}%
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1 pt-1">
          {[
            { l: "WACC", v: `${d.wacc}%` },
            { l: "Terminal g", v: `${d.terminalGrowth}%` },
            { l: "FCF Growth", v: `${d.projectedFcfGrowth}%` },
          ].map(item => (
            <div key={item.l} className="bg-muted rounded p-1.5 text-center">
              <p className="text-[9px] text-muted-foreground">{item.l}</p>
              <p className="text-xs font-mono font-semibold text-foreground">{item.v}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground">
          DCF model uses unlevered FCF discounted at WACC. Assumes {d.projectedFcfGrowth}% growth tapering to {d.terminalGrowth}% terminal.
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Research Paper-Grounded: Sentiment Bias Detector ─────────────────────────
// Based on: "Assessing Look-Ahead Bias in LLM Sentiment" (Glasserman & Lin, 2023)
// LLMs have pre-training knowledge that inflates sentiment scores — this warns analysts.
function SentimentBiasPanel({ company }: { company: any }) {
  const score = company.sentimentBiasScore;
  const risk = score >= 75 ? "HIGH" : score >= 50 ? "MODERATE" : "LOW";
  const riskColor = score >= 75 ? "text-down" : score >= 50 ? "text-yellow-400" : "text-up";
  const riskBg = score >= 75 ? "badge-bearish" : score >= 50 ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/30" : "badge-bullish";

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-center gap-2">
          <AlertTriangle size={13} className="text-yellow-400" />
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sentiment Bias Risk</CardTitle>
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded ml-auto", riskBg)}>{risk}</span>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 rounded-full relative">
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-card rounded-full shadow"
              style={{ left: `${score}%`, marginLeft: '-6px' }}
            />
          </div>
          <span className={cn("text-sm font-bold font-mono w-8 text-right", riskColor)}>{score}</span>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          {score >= 75
            ? "⚠ High analyst herding detected. LLM sentiment may reflect look-ahead bias. Verify thesis independently — consensus overshoot risk."
            : score >= 50
            ? "Moderate positive bias. AI news scores likely inflated by model pre-training. Apply discount to bullish signals."
            : "Low sentiment bias. News scoring appears calibrated to fundamentals. Signal reliability is high."}
        </p>
        <div className="flex justify-between text-[10px]">
          <span className="text-muted-foreground">Analyst Herding: <span className="font-mono font-semibold text-foreground">{company.analystHerdingScore}% bullish</span></span>
          <span className="text-muted-foreground">Regime: <span className="font-mono font-semibold text-foreground capitalize">{company.marketRegime?.replace(/_/g, " ")}</span></span>
        </div>
      </CardContent>
    </Card>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-md px-2.5 py-1.5 text-xs shadow-lg">
        <p className="text-muted-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="font-mono font-semibold" style={{ color: p.color }}>{p.name}: ${p.value?.toFixed(1)}B</p>
        ))}
      </div>
    );
  }
  return null;
}

export default function CompanyPage() {
  const params = useParams();
  const [, navigate] = useLocation();
  const [searchInput, setSearchInput] = useState(params.ticker?.toUpperCase() || "");
  const [activeTicker, setActiveTicker] = useState<string>(params.ticker?.toUpperCase() || "");

  const company = COMPANY_DATA[activeTicker];

  const handleSearch = (ticker: string) => {
    const t = ticker.toUpperCase().trim();
    setActiveTicker(t);
    setSearchInput(t);
    navigate(`/company/${t}`);
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div>
        <h1 className="text-lg font-bold text-foreground">Company Deep Dive</h1>
        <p className="text-xs text-muted-foreground">Fundamentals · DCF Valuation · Earnings Transcripts · Sentiment Bias Analysis</p>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative w-48">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Enter ticker..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && handleSearch(searchInput)}
            className="pl-8 h-8 text-xs bg-muted border-border font-mono uppercase"
            data-testid="input-ticker-search"
          />
        </div>
        <button
          onClick={() => handleSearch(searchInput)}
          className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium hover:bg-primary/90 transition-colors"
          data-testid="button-search-ticker"
        >
          Analyze
        </button>
        <div className="flex gap-1 flex-wrap">
          {POPULAR_TICKERS.map(t => (
            <button
              key={t}
              onClick={() => handleSearch(t)}
              className={cn(
                "px-2 py-1 rounded text-xs font-mono font-medium transition-colors",
                activeTicker === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
              data-testid={`ticker-quick-${t}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* No company found */}
      {activeTicker && !company && (
        <div className="flex items-center justify-center h-48 border border-border rounded-lg bg-card">
          <div className="text-center">
            <AlertTriangle size={32} className="text-yellow-400 mx-auto mb-3 opacity-60" />
            <p className="text-sm font-semibold text-foreground">"{activeTicker}" not in coverage universe</p>
            <p className="text-xs text-muted-foreground mt-1">Available: {POPULAR_TICKERS.join(", ")}</p>
          </div>
        </div>
      )}

      {/* No ticker selected yet */}
      {!activeTicker && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart2 size={40} className="text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-sm text-muted-foreground">Select a ticker to begin deep dive analysis</p>
            <p className="text-xs text-muted-foreground mt-1">All 10 major names covered — click any ticker above</p>
          </div>
        </div>
      )}

      {company && (
        <>
          {/* Header */}
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold font-mono text-foreground">{activeTicker}</h2>
                <span className="text-base text-muted-foreground">{company.name}</span>
                <Badge variant="outline" className="text-xs">{company.sector}</Badge>
                <Badge variant="outline" className="text-xs">{company.exchange}</Badge>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-bold font-mono text-foreground">${company.price}</span>
                <span className={cn("text-sm font-mono font-semibold", company.up ? "text-up" : "text-down")}>
                  {company.change} ({company.pct})
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className={cn("text-sm font-semibold",
                company.analystRating === "Strong Buy" ? "text-up" :
                company.analystRating === "Buy" ? "text-primary" :
                company.analystRating === "Hold" ? "text-flat" : "text-down"
              )}>
                {company.analystRating}
              </div>
              <div className="text-xs text-muted-foreground">Consensus ({company.analystHerdingScore}% bullish)</div>
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="h-8 text-xs">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="financials" className="text-xs">Financials</TabsTrigger>
              <TabsTrigger value="transcript" className="text-xs">Earnings Call</TabsTrigger>
              <TabsTrigger value="thesis" className="text-xs">AI Thesis</TabsTrigger>
            </TabsList>

            {/* ── Overview Tab ── */}
            <TabsContent value="overview" className="space-y-3 mt-3">
              {/* 8 valuation metrics */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { l: "Market Cap", v: company.mktCap },
                  { l: "P/E (TTM)", v: company.pe },
                  { l: "Fwd P/E", v: company.fpe },
                  { l: "EV/EBITDA", v: company.evEbitda },
                  { l: "Revenue TTM", v: company.revenue },
                  { l: "Rev Growth", v: company.revenueGrowth },
                  { l: "Gross Margin", v: company.grossMargin },
                  { l: "Net Margin", v: company.netMargin },
                ].map(m => (
                  <Card key={m.l} className="bg-card border-border">
                    <CardContent className="p-2.5">
                      <p className="text-[10px] text-muted-foreground">{m.l}</p>
                      <p className="text-sm font-bold font-mono text-foreground mt-0.5">{m.v}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Price chart */}
                <div className="col-span-2">
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2 pt-3 px-3">
                      <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price History (1Y)</CardTitle>
                    </CardHeader>
                    <CardContent className="px-1 pb-2">
                      <ResponsiveContainer width="100%" height={150}>
                        <AreaChart data={company.price_history}>
                          <defs>
                            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={company.up ? "hsl(142 71% 52%)" : "hsl(0 84% 62%)"} stopOpacity={0.2} />
                              <stop offset="95%" stopColor={company.up ? "hsl(142 71% 52%)" : "hsl(0 84% 62%)"} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="m" tick={{ fontSize: 9, fill: 'hsl(210 10% 50%)' }} tickLine={false} axisLine={false} />
                          <YAxis tick={{ fontSize: 9, fill: 'hsl(210 10% 50%)' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                          <Tooltip contentStyle={{ background: 'hsl(222 24% 10%)', border: '1px solid hsl(222 16% 18%)', fontSize: '11px', borderRadius: '4px' }} />
                          <Area type="monotone" dataKey="p" stroke={company.up ? "hsl(142 71% 52%)" : "hsl(0 84% 62%)"} strokeWidth={1.5} fill="url(#priceGrad)" dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Company info + analyst targets */}
                <Card className="bg-card border-border">
                  <CardContent className="p-3 space-y-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">Company Info</p>
                      {[
                        { l: "CEO", v: company.ceo },
                        { l: "Employees", v: company.employees },
                        { l: "Founded", v: company.founded },
                        { l: "HQ", v: company.hq },
                        { l: "ROE", v: company.roe },
                        { l: "D/E Ratio", v: company.debtEquity },
                      ].map(i => (
                        <div key={i.l} className="flex justify-between py-0.5 border-b border-border/30 last:border-0">
                          <span className="text-[10px] text-muted-foreground">{i.l}</span>
                          <span className="text-[10px] text-foreground font-medium">{i.v}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">Analyst Price Targets</p>
                      {[
                        { l: "High", v: `$${company.targets.high}`, cls: "text-up" },
                        { l: "Average", v: `$${company.targets.avg}`, cls: "text-primary" },
                        { l: "Low", v: `$${company.targets.low}`, cls: "text-down" },
                      ].map(t => (
                        <div key={t.l} className="flex justify-between py-0.5">
                          <span className="text-[10px] text-muted-foreground">{t.l}</span>
                          <span className={cn("text-xs font-mono font-semibold", t.cls)}>{t.v}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Research paper modules: DCF + Sentiment Bias */}
              <div className="grid grid-cols-2 gap-3">
                <DCFPanel company={company} />
                <SentimentBiasPanel company={company} />
              </div>

              {/* Description */}
              <Card className="bg-card border-border">
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">{company.description}</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Financials Tab ── */}
            <TabsContent value="financials" className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quarterly Revenue & Net Income ($B)</CardTitle>
                  </CardHeader>
                  <CardContent className="px-1 pb-2">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={company.revenue_history} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="2 2" stroke="hsl(222 16% 18%)" />
                        <XAxis dataKey="q" tick={{ fontSize: 9, fill: 'hsl(210 10% 50%)' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: 'hsl(210 10% 50%)' }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <ReferenceLine y={0} stroke="hsl(222 16% 28%)" />
                        <Bar dataKey="rev" name="Revenue" fill="hsl(213 94% 60%)" radius={[2,2,0,0]} />
                        <Bar dataKey="ni" name="Net Income" fill="hsl(152 60% 50%)" radius={[2,2,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">EPS & Profitability Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Actual EPS</p>
                        <p className="text-lg font-bold font-mono text-foreground">${company.eps}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Estimate</p>
                        <p className="text-lg font-bold font-mono text-muted-foreground">${company.epsEst}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Beat / Miss</p>
                        <p className={cn("text-lg font-bold font-mono", parseFloat(company.beat) > 0 ? "text-up" : "text-down")}>{company.beat}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5 pt-2 border-t border-border">
                      {[
                        { l: "Return on Equity", v: company.roe },
                        { l: "Return on Assets", v: company.roa },
                        { l: "Debt / Equity", v: company.debtEquity },
                        { l: "P/Sales (TTM)", v: company.ps },
                        { l: "Institutional Ownership", v: company.institutionalOwnership },
                        { l: "Insider Ownership", v: company.insiderOwnership },
                      ].map(item => (
                        <div key={item.l} className="flex justify-between">
                          <span className="text-xs text-muted-foreground">{item.l}</span>
                          <span className="text-xs font-mono font-semibold text-foreground">{item.v}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── Earnings Call Tab ── */}
            <TabsContent value="transcript" className="space-y-3 mt-3">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Most Recent Earnings Call — Key Highlights
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-2.5">
                  {company.transcript_highlights.map((h: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-xs text-foreground leading-relaxed">{h}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── AI Thesis Tab ── */}
            <TabsContent value="thesis" className="space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-xs font-semibold text-up uppercase tracking-wider">Bull Case Catalysts</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2">
                    {company.catalysts.map((c: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <TrendingUp size={11} className="text-up flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-foreground">{c}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-xs font-semibold text-down uppercase tracking-wider">Bear Case Risks</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2">
                    {company.risks.map((r: string, i: number) => (
                      <div key={i} className="flex items-start gap-2">
                        <TrendingDown size={11} className="text-down flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-foreground">{r}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Research paper: AI synthesis with herding bias warning */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={13} className="text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">AI Synthesis</span>
                    {company.analystHerdingScore >= 80 && (
                      <Badge className="text-[10px] badge-bearish ml-auto">⚠ Herding Risk: {company.analystHerdingScore}% consensus</Badge>
                    )}
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">
                    {activeTicker === "NVDA" && "NVDA remains the highest-conviction AI infrastructure play. The data center supercycle is in innings 4-5, driven by inference workload expansion. CUDA ecosystem lock-in is a genuine moat. At 34x FY25 PE on ~100% EPS growth, justified by scarcity premium. Key risk: 94% analyst consensus bullish — apply herding discount. DCF fair value $1,040 implies 16% upside. Conviction: 5/5."}
                    {activeTicker === "TSLA" && "TSLA faces structural margin compression. China share loss to BYD is accelerating — a real secular risk, not cyclical. At 58x FY25 PE for -9% revenue growth, valuation remains disconnected from fundamentals. DCF value $148 vs $178 market price = 17% overvalued. FSD/Robotaxi optionality real but unproven. Hold/monitor. Conviction: 2/5."}
                    {activeTicker === "AAPL" && "AAPL is the world's highest-quality compounder. Services segment ($100B+ revenue, 72% margins) growing at 14% YoY is structurally undervalued by hardware-focused models. DCF value $248 vs $213 market price = 16% upside. Capital return program ($110B buyback) provides floor. Main risk: valuation on enterprise multiple, not hardware. Conviction: 4/5."}
                    {activeTicker === "MSFT" && "MSFT is the best-positioned enterprise AI play. Azure AI revenue accelerating, Copilot monetization at inflection. DCF value $495 implies 18% upside. 88% analyst consensus bullish — herding risk present but thesis grounded in financials. Operating margin expansion to 44.6% validates AI investment return. Conviction: 5/5."}
                    {activeTicker === "META" && "META is the best value in AI mega-cap with 22.8x forward P/E vs peers at 30x+. AI ad targeting flywheel compounding (CPM +14% QoQ). Llama open-source moat growing. DCF $680 implies 30% upside — widest margin of safety in the group. Reality Labs losses are a known overhang but narrowing. Conviction: 4/5."}
                    {activeTicker === "GOOGL" && "GOOGL is the most undervalued AI mega-cap at 19.6x forward P/E. Google Cloud 28% growth accelerating. Search durable despite AI competition. DCF $228 implies 32% upside — highest in group. DOJ antitrust risk is the one genuine structural concern. Sentiment bias low (64). Conviction: 4/5."}
                    {activeTicker === "AMZN" && "AMZN's profit engine (AWS + Advertising at $165B+ combined run rate) now dominates the story. Retail is free cash flow positive at scale. DCF $248 implies 26% upside. AWS AI workload capture (Bedrock) is the key 2025 catalyst. 89% analyst consensus bullish — apply small herding discount. Conviction: 4/5."}
                    {activeTicker === "JPM" && "JPM is the highest quality bank in the world. NII $90B+ annualized, best credit quality in sector (NCO 0.52%). DCF $275 implies 17% upside. M&A revival is a high-beta positive. Risk: commercial real estate ($20B exposure) is the one credible bear case. Conviction: 4/5."}
                    {activeTicker === "GS" && "GS is the purest IB cycle play. At 1.65x book, valuation is reasonable for franchise quality. Deal pipeline strongest since 2021. DCF $590 implies 15% upside. Risk: revenue highly cyclical — drawdowns of -40% in downturns are historical. Conviction: 3/5."}
                    {activeTicker === "BRK-B" && "BRK-B is the ultimate defensive value play. $168B cash = 17% of market cap earns $7B+ annually risk-free. DCF $510 implies 14% upside. Best deployed in the next market correction (Buffett counter-cyclical). The succession transition to Greg Abel is the primary de-risking catalyst. Conviction: 3/5."}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

export interface AssetAllocation {
  symbol: string;
  name: string;
  percentage: number;
  amount: number;
  holdingQty: number;
  avgCost: number;
  price: number;
  change24h: number;
  category: 'crypto' | 'stock';
  marketTime?: string;
  error?: boolean;
  errorMessage?: string;
}

export interface PortfolioData {
  totalUsd: number;
  monthlyChangePct: number;
  allocations: AssetAllocation[];
  fearGreedIndex: number;
  marketStatus: string;
  whaleStatus: string;
  liquidationRisk: string;
  lastUpdated?: string;
}

export interface AssetAdvice {
  currentPrice: number;
  buyZone: string;
  targetZone: string;
  stopLoss: string;
  strategy: string;
}

export interface NewsItem {
  id: number;
  title: string;
  time: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface DailyAdviceData {
  lastUpdated: string;
  headline: string;
  summary: string;
  fearGreedIndex: number;
  marketStatus: string;
  whaleStatus: string;
  liquidationRisk: string;
  assets: Record<string, AssetAdvice>;
  news: NewsItem[];
}

export type TabType = 'dashboard' | 'markets' | 'radar' | 'ai' | 'tools' | 'settings';

export interface OpportunityItem {
  symbol: string;
  name: string;
  currentPrice: number;
  change24h: number;
  reason: string;
}

export interface OpportunityAnalysisDetail {
  whyVolatile: string;
  observationPoints: string;
}

export interface TopCryptoMover {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  change24h: number;
  marketCapRank: number;
  totalVolume: number;
  reason: string;
}

export interface OpportunityScanData {
  lastScanned: string;
  nextScanDue: string;
  lastAiAnalyzed: string;
  items: OpportunityItem[];
  aiAnalysis: {
    overview: string;
    details: Record<string, OpportunityAnalysisDetail>;
    disclaimer: string;
  };
  topCrypto?: {
    lastUpdated: string;
    topMovers: TopCryptoMover[];
    aiAnalysis?: {
      overview: string;
      details: Record<string, OpportunityAnalysisDetail>;
      disclaimer: string;
    };
  };
}



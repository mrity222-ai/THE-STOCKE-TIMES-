import { MarketIndex } from '../types';
import { StorageService } from './storageService';

export interface FinnhubNewsArticle {
  id: number;
  category?: string;
  datetime: number;
  headline: string;
  image?: string;
  related?: string;
  source: string;
  summary?: string;
  url?: string;
}

export interface FinnhubQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: string;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  isPositive: boolean;
}

export class MarketDataService {
  private static liveIndices: MarketIndex[] = [
    { symbol: 'NIFTY 50', name: 'Nifty 50 Index', value: '24,850.40', change: '+142.10', changePercent: '+0.58%', isPositive: true },
    { symbol: 'SENSEX', name: 'BSE Sensex', value: '81,420.15', change: '+415.20', changePercent: '+0.51%', isPositive: true },
    { symbol: 'BANK NIFTY', name: 'Nifty Bank Index', value: '52,340.80', change: '+375.40', changePercent: '+0.72%', isPositive: true },
    { symbol: 'S&P 500', name: 'S&P 500 Index', value: '5,620.10', change: '+18.90', changePercent: '+0.34%', isPositive: true },
    { symbol: 'NASDAQ', name: 'Nasdaq Composite', value: '17,680.50', change: '+74.20', changePercent: '+0.42%', isPositive: true }
  ];

  /**
   * Fetch live Yahoo Finance Quotes via Express Proxy or Direct Public API
   * (Checks Admin ON/OFF Toggle first)
   */
  static async fetchLiveQuotes(): Promise<MarketIndex[]> {
    // Admin Panel ON/OFF Check: If Yahoo API is turned OFF by admin, return baseline static indices immediately!
    if (!StorageService.isYahooApiEnabled()) {
      return this.liveIndices;
    }

    try {
      // 1. Try local Express Proxy (which connects to Yahoo Finance API server-side)
      const res = await fetch('http://localhost:5000/api/market-data');
      if (res.ok) {
        const data = await res.json();
        if (data.indices && data.indices.length > 0) {
          const mainIndices = data.indices
            .filter((item: any) => ['NIFTY 50', 'SENSEX', 'BANK NIFTY', 'S&P 500', 'NASDAQ'].includes(item.symbol))
            .map((item: any) => ({
              symbol: item.symbol,
              name: item.symbol,
              value: item.value,
              change: item.change || '0.00',
              changePercent: item.changePercent,
              isPositive: item.isPositive
            }));

          if (mainIndices.length > 0) {
            this.liveIndices = mainIndices;
            return mainIndices;
          }
        }
      }
    } catch (e) {
      console.warn('Backend proxy unavailable, trying public Yahoo endpoint directly...');
    }

    try {
      // 2. Direct client-side fetch from Yahoo Finance Public API
      const symbols = '^NSEI,^BSESN,^NSEBANK,^GSPC,^IXIC';
      const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`;

      const res = await fetch(yahooUrl);
      if (res.ok) {
        const data = await res.json();
        const quotes = data?.quoteResponse?.result || [];
        
        const symbolMap: Record<string, string> = {
          '^NSEI': 'NIFTY 50',
          '^BSESN': 'SENSEX',
          '^NSEBANK': 'BANK NIFTY',
          '^GSPC': 'S&P 500',
          '^IXIC': 'NASDAQ'
        };

        const liveList: MarketIndex[] = quotes.map((q: any) => {
          const price = q.regularMarketPrice || 0;
          const change = q.regularMarketChange || 0;
          const changePercent = q.regularMarketChangePercent || 0;
          const isPositive = change >= 0;
          const symbolName = symbolMap[q.symbol] || q.symbol;

          return {
            symbol: symbolName,
            name: q.shortName || q.longName || symbolName,
            value: price > 100 ? price.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : price.toFixed(2),
            change: change.toFixed(2),
            changePercent: `${isPositive ? '+' : ''}${changePercent.toFixed(2)}%`,
            isPositive
          };
        });

        if (liveList.length > 0) {
          this.liveIndices = liveList;
          return liveList;
        }
      }
    } catch (err) {
      console.warn('Yahoo API client fetch offline, returning cached market indices');
    }

    return this.liveIndices;
  }

  /**
   * Subscribe to real-time periodic updates (every 10 seconds)
   */
  static subscribeToLiveUpdates(callback: (indices: MarketIndex[]) => void, intervalMs: number = 10000): () => void {
    // Initial fetch
    this.fetchLiveQuotes().then(callback);

    // Periodic polling timer
    const timer = setInterval(async () => {
      const data = await this.fetchLiveQuotes();
      callback(data);
    }, intervalMs);

    return () => clearInterval(timer);
  }

  /**
   * Fetch Live US Breaking News from Finnhub.io API
   */
  static async fetchFinnhubNews(): Promise<FinnhubNewsArticle[]> {
    try {
      const res = await fetch('http://localhost:5000/api/finnhub/news');
      if (res.ok) {
        const data = await res.json();
        return data.articles || [];
      }
    } catch (e) {
      console.warn('Finnhub news API error');
    }
    return [];
  }

  /**
   * Fetch Live US Stock Quote (e.g. AAPL, MSFT, TSLA, NVDA) from Finnhub.io API
   */
  static async fetchFinnhubQuote(symbol: string): Promise<FinnhubQuote | null> {
    try {
      const res = await fetch(`http://localhost:5000/api/finnhub/us-quote/${symbol}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn(`Finnhub quote API error for ${symbol}`);
    }
    return null;
  }
}

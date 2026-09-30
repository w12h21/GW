import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, RefreshCw, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface NewsItem {
  id: number;
  title: string;
  time: string;
  url: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface DynamicNewsFeedProps {
  darkMode?: boolean;
  onExplainWithAI?: (headline: string) => void;
}

export const DynamicNewsFeed: React.FC<DynamicNewsFeedProps> = ({ darkMode = false, onExplainWithAI }) => {
  const [selectedTicker, setSelectedTicker] = useState<string>('BTC');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const tickers = [
    { symbol: 'BTC', name: '比特幣 (BTC)' },
    { symbol: 'ETH', name: '以太坊 (ETH)' },
    { symbol: '2330.TW', name: '台積電 (2330)' },
    { symbol: '2317.TW', name: '鴻海 (2317)' },
  ];

  const fetchNews = async (ticker: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ticker-news?symbol=${encodeURIComponent(ticker)}`);
      const data = await res.json();
      if (data.success && data.news) {
        setNews(data.news);
      } else {
        setError('無法取得最新財經新聞');
      }
    } catch (err: any) {
      console.error('Fetch news error:', err);
      setError('連線失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(selectedTicker);
  }, [selectedTicker]);

  return (
    <div className={`p-4 rounded-3xl shadow-sm border space-y-4 ${
      darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
    }`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3 border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <Newspaper className="w-4 h-4 text-emerald-500" />
          <h2 className="text-xs font-black uppercase tracking-wider">AI 聯網即時財金新聞</h2>
          <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>Google Search 驅動</span>
          </span>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Ticker selector tabs */}
          <div className={`flex p-0.5 rounded-xl text-[10px] font-bold ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
            {tickers.map((t) => (
              <button
                key={t.symbol}
                onClick={() => setSelectedTicker(t.symbol)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  selectedTicker === t.symbol
                    ? darkMode ? 'bg-slate-700 text-white shadow-xs' : 'bg-white text-slate-900 shadow-xs'
                    : 'hover:text-emerald-500'
                }`}
              >
                {t.symbol}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchNews(selectedTicker)}
            disabled={loading}
            className={`p-2 rounded-xl border transition flex items-center justify-center ${
              darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="重新搜尋最新新聞"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-500" />
          <div className="text-xs text-slate-400 font-medium">正在透過 Google Search 搜尋 {selectedTicker} 最新財經頭條與深度報導...</div>
        </div>
      ) : error ? (
        <div className="py-6 text-center text-xs text-rose-400">{error}</div>
      ) : (
        <div className="space-y-2.5">
          {news.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => {
                if (item.url) {
                  window.open(item.url, '_blank', 'noopener,noreferrer');
                } else {
                  window.open(`https://www.google.com/search?q=${encodeURIComponent(item.title)}`, '_blank', 'noopener,noreferrer');
                }
              }}
              className={`p-3.5 rounded-2xl border transition cursor-pointer group flex items-start justify-between gap-3 ${
                darkMode
                  ? 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 hover:border-emerald-500/50'
                  : 'bg-slate-50/80 border-slate-100 hover:bg-emerald-50/40 hover:border-emerald-200'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase flex items-center space-x-1 ${
                    item.sentiment === 'positive'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : item.sentiment === 'negative'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {item.sentiment === 'positive' ? <TrendingUp className="w-2.5 h-2.5" /> : item.sentiment === 'negative' ? <TrendingDown className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
                    <span>{item.sentiment === 'positive' ? '利多' : item.sentiment === 'negative' ? '利空' : '中立'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
                </div>

                <div className={`text-xs font-semibold leading-relaxed group-hover:text-emerald-500 transition line-clamp-2 ${
                  darkMode ? 'text-slate-200' : 'text-slate-800'
                }`}>
                  {item.title}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-1 text-[10px] text-emerald-500 opacity-80 group-hover:opacity-100 font-medium">
                    <span>閱讀完整報導</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                  {onExplainWithAI && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onExplainWithAI(item.title);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-emerald-500 text-white text-[10px] font-bold shadow-xs hover:bg-emerald-600 transition flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>讓 AI 導師深度解讀</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

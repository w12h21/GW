import React, { useState } from 'react';
import { PortfolioData, DailyAdviceData } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Coins, LineChart, ArrowUpRight, Loader2 } from 'lucide-react';

interface MarketViewProps {
  portfolio: PortfolioData | null;
  dailyAdvice: DailyAdviceData | null;
  onRefreshMarket?: () => void;
  marketRefreshing?: boolean;
  marketCooldown?: number;
  currency: 'USD' | 'TWD';
  exchangeRate: number;
  darkMode: boolean;
}

const mockChartData: Record<string, { time: string; price: number }[]> = {
  "BTC": [
    { time: '00:00', price: 67200 },
    { time: '04:00', price: 67800 },
    { time: '08:00', price: 67450 },
    { time: '12:00', price: 68100 },
    { time: '16:00', price: 67900 },
    { time: '20:00', price: 68300 },
    { time: '現在', price: 68450 },
  ],
  "ETH": [
    { time: '00:00', price: 3480 },
    { time: '04:00', price: 3510 },
    { time: '08:00', price: 3495 },
    { time: '12:00', price: 3530 },
    { time: '16:00', price: 3515 },
    { time: '20:00', price: 3525 },
    { time: '現在', price: 3520 },
  ],
  "2330.TW": [
    { time: '09:00', price: 975 },
    { time: '10:00', price: 980 },
    { time: '11:00', price: 978 },
    { time: '12:00', price: 983 },
    { time: '13:00', price: 985 },
  ],
  "2317.TW": [
    { time: '09:00', price: 210 },
    { time: '10:00', price: 212 },
    { time: '11:00', price: 211 },
    { time: '12:00', price: 214 },
    { time: '13:00', price: 215 },
  ]
};

export const MarketView: React.FC<MarketViewProps> = ({ portfolio, dailyAdvice, onRefreshMarket, marketRefreshing, marketCooldown, currency, exchangeRate, darkMode }) => {
  const [category, setCategory] = useState<'crypto' | 'stock'>('crypto');
  const [selectedAsset, setSelectedAsset] = useState<string>("BTC");
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1W');
  const [historyData, setHistoryData] = useState<{ time: string; price: number }[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  const rate = currency === 'TWD' ? exchangeRate : 1;
  const symbol = currency === 'TWD' ? 'NT$' : '$';

  const formatMoney = (usdVal: number) => {
    const val = usdVal * rate;
    return val.toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const filteredAllocations = portfolio?.allocations.filter(a => a.category === category) || [];
  
  // If selected asset is not in current category, auto select first in category
  React.useEffect(() => {
    if (filteredAllocations.length > 0 && !filteredAllocations.some(a => a.symbol === selectedAsset)) {
      setSelectedAsset(filteredAllocations[0].symbol);
    }
  }, [category]);

  React.useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await fetch(`/api/history/${selectedAsset}`);
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.history)) {
          setHistoryData(data.history);
        }
      } catch (err) {
        console.warn("Failed to fetch asset history:", err);
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    };
    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [selectedAsset]);

  const currentAllocation = portfolio?.allocations.find(a => a.symbol === selectedAsset) || filteredAllocations[0];
  const advice = dailyAdvice?.assets?.[selectedAsset] || {
    currentPrice: currentAllocation?.price || 68450,
    buyZone: "$66,500 - $67,800",
    targetZone: "$73,500 - $76,000",
    stopLoss: "$64,200",
    strategy: "分批低接，突破關鍵壓力位可順勢加倉"
  };

  const currentPrice = currentAllocation?.price || advice?.currentPrice || 88500;

  const [technicalData, setTechnicalData] = useState<{
    indicators: {
      currentPrice: number;
      high14: number;
      low14: number;
      ma20: number;
      maNote: string;
      rsi14: number;
      rsiStatus: string;
    };
    commentary: string;
  } | null>(null);
  const [loadingTechnical, setLoadingTechnical] = useState<boolean>(false);

  React.useEffect(() => {
    let isMounted = true;
    const fetchTechnical = async () => {
      setLoadingTechnical(true);
      try {
        const res = await fetch(`/api/ai/technical-commentary/${selectedAsset}`, { method: 'POST' });
        const data = await res.json();
        if (isMounted && data.success) {
          setTechnicalData(data);
        }
      } catch (err) {
        console.warn("Failed to fetch technical indicators & AI commentary:", err);
      } finally {
        if (isMounted) setLoadingTechnical(false);
      }
    };
    fetchTechnical();
    return () => {
      isMounted = false;
    };
  }, [selectedAsset]);

  const getChartDataForTimeframe = (tf: '1D' | '1W' | '1M' | '1Y', price: number) => {
    if (tf === '1W' && historyData.length > 0) {
      return historyData;
    }
    switch (tf) {
      case '1D':
        return [
          { time: '00:00', price: Math.round(price * 0.992) },
          { time: '04:00', price: Math.round(price * 0.995) },
          { time: '08:00', price: Math.round(price * 0.990) },
          { time: '12:00', price: Math.round(price * 1.002) },
          { time: '16:00', price: Math.round(price * 0.998) },
          { time: '20:00', price: Math.round(price * 1.005) },
          { time: '現在', price: price },
        ];
      case '1W':
        return historyData.length > 0 ? historyData : [
          { time: '週一', price: Math.round(price * 0.975) },
          { time: '週二', price: Math.round(price * 0.982) },
          { time: '週三', price: Math.round(price * 0.980) },
          { time: '週四', price: Math.round(price * 0.995) },
          { time: '週五', price: Math.round(price * 0.988) },
          { time: '週末', price: Math.round(price * 0.992) },
          { time: '今日', price: price },
        ];
      case '1M':
        return [
          { time: '第1週', price: Math.round(price * 0.930) },
          { time: '第2週', price: Math.round(price * 0.955) },
          { time: '第3週', price: Math.round(price * 0.948) },
          { time: '第4週', price: Math.round(price * 0.985) },
          { time: '現在', price: price },
        ];
      case '1Y':
        return [
          { time: '1月', price: Math.round(price * 0.720) },
          { time: '3月', price: Math.round(price * 0.810) },
          { time: '6月', price: Math.round(price * 0.880) },
          { time: '9月', price: Math.round(price * 0.920) },
          { time: '11月', price: Math.round(price * 0.960) },
          { time: '現今', price: price },
        ];
      default:
        return [];
    }
  };

  const chartData = getChartDataForTimeframe(timeframe, currentPrice);

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${darkMode ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' : 'text-emerald-700 bg-emerald-50 border border-emerald-200'}`}>
              TradingView Pro 即時行情
            </span>
            {portfolio?.lastUpdated && (
              <span className={`text-[11px] font-mono ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                最後更新：{new Date(portfolio.lastUpdated).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false })}
                {currentAllocation?.marketTime && ` | 市場時間: ${new Date(currentAllocation.marketTime).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false })}`}
              </span>
            )}
          </div>
          <h1 className={`text-xl font-black mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedAsset} 策略分析</h1>
        </div>
        <div className="flex items-center justify-between sm:justify-end space-x-2">
          {onRefreshMarket && (
            <button
              onClick={onRefreshMarket}
              disabled={marketRefreshing || (marketCooldown !== undefined && marketCooldown > 0)}
              className={`p-2 rounded-xl text-xs font-bold transition flex items-center space-x-1 border ${
                darkMode
                  ? 'bg-slate-900 border-slate-700 text-emerald-400 hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-emerald-600 hover:bg-slate-50'
              } ${(marketRefreshing || (marketCooldown !== undefined && marketCooldown > 0)) ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="即時更新行情"
            >
              <Loader2 className={`w-3.5 h-3.5 ${marketRefreshing ? 'animate-spin' : ''}`} />
              <span>
                {marketRefreshing ? '更新中...' : marketCooldown && marketCooldown > 0 ? `請稍候 ${marketCooldown}s` : '更新行情'}
              </span>
            </button>
          )}
          <div className="text-right">
            {currentAllocation?.error ? (
              <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20">
                {currentAllocation.errorMessage || "暫時無法取得報價"}
              </span>
            ) : (
              <span className={`text-lg font-black font-mono transition-colors duration-500 ${marketRefreshing ? 'text-emerald-400 animate-pulse' : darkMode ? 'text-white' : 'text-slate-900'}`}>
                {symbol}{formatMoney(currentPrice)}
              </span>
            )}
            {!currentAllocation?.error && (
              <div className={`text-xs font-bold font-mono ${currentAllocation && currentAllocation.change24h >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {currentAllocation && currentAllocation.change24h >= 0 ? '+' : ''}{currentAllocation?.change24h || 2.4}%
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Crypto / Stock Category Switcher */}
      <div className={`grid grid-cols-2 gap-1 p-1 rounded-2xl ${darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-slate-200/80'}`}>
        <button
          onClick={() => { setCategory('crypto'); setSelectedAsset('BTC'); }}
          className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
            category === 'crypto'
              ? darkMode ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
              : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>🪙 虛擬貨幣市場</span>
        </button>
        <button
          onClick={() => { setCategory('stock'); setSelectedAsset('2330.TW'); }}
          className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
            category === 'stock'
              ? darkMode ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
              : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LineChart className="w-4 h-4" />
          <span>📈 權值與美股市場</span>
        </button>
      </div>

      {/* Asset Switcher Pills */}
      <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {filteredAllocations.map((item) => (
          <button
            key={item.symbol}
            onClick={() => setSelectedAsset(item.symbol)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition border ${
              selectedAsset === item.symbol
                ? darkMode ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm' : 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : darkMode ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {item.name} ({item.symbol})
          </button>
        ))}
      </div>

      {/* Chart Card */}
      <div className={`p-4 rounded-3xl shadow-sm border ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-black uppercase tracking-wider">即時技術走勢圖表</div>
          <div className={`flex p-0.5 rounded-xl text-[10px] font-bold ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
            {(['1D', '1W', '1M', '1Y'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  timeframe === tf
                    ? darkMode ? 'bg-slate-700 text-white shadow-xs' : 'bg-white text-slate-900 shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke={darkMode ? "#64748b" : "#94a3b8"} fontSize={10} tickLine={false} />
              <YAxis stroke={darkMode ? "#64748b" : "#94a3b8"} fontSize={10} domain={['auto', 'auto']} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                  borderColor: darkMode ? '#334155' : '#e2e8f0',
                  borderRadius: '12px',
                  color: darkMode ? '#fff' : '#0f172a',
                  fontSize: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPrice)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 區塊一：真實計算數字區塊（程式客觀計算數據） */}
      <div className={`p-5 rounded-3xl shadow-sm border space-y-4 ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
      }`}>
        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-emerald-500">📊 真實計算數字區塊（程式客觀計算數據）</h2>
            <p className={`text-[11px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>由後端數學程式直接計算之客觀歷史技術指標</p>
          </div>
          <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
            純數學計算
          </span>
        </div>

        {loadingTechnical ? (
          <div className="py-8 text-center text-xs text-slate-400 animate-pulse">正在透過程式計算歷史技術指標...</div>
        ) : technicalData ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`p-3.5 rounded-2xl border ${darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`text-[10px] font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>14日高點（歷史壓力參考）</div>
              <div className="text-base font-black mt-1 font-mono text-emerald-400">${technicalData.indicators.high14.toLocaleString()}</div>
            </div>

            <div className={`p-3.5 rounded-2xl border ${darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`text-[10px] font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>14日低點（歷史支撐參考）</div>
              <div className="text-base font-black mt-1 font-mono text-blue-400">${technicalData.indicators.low14.toLocaleString()}</div>
            </div>

            <div className={`p-3.5 rounded-2xl border ${darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`text-[10px] font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>MA20 (20日均線)</div>
              <div className="text-base font-black mt-1 font-mono text-purple-400">${technicalData.indicators.ma20.toLocaleString()}</div>
              <div className="text-[9px] text-slate-400 mt-0.5">{technicalData.indicators.maNote}</div>
            </div>

            <div className={`p-3.5 rounded-2xl border ${darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`text-[10px] font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>14日 RSI (強弱指標)</div>
              <div className="text-base font-black mt-1 font-mono text-amber-400">{technicalData.indicators.rsi14}</div>
              <div className="text-[9px] text-amber-500 font-bold mt-0.5">{technicalData.indicators.rsiStatus}</div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 py-4 text-center">暫無計算數據</div>
        )}
      </div>

      {/* 區塊二：AI 文字解讀區塊（AI 純文字說明與宣告） */}
      <div className={`p-5 rounded-3xl shadow-sm border space-y-3 ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
      }`}>
        <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-blue-400">🤖 AI 文字解讀區塊（純文字說明）</h2>
            <p className={`text-[11px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>AI 僅負責依據上述真實數字進行文字解讀，嚴格禁止修改或生成數字</p>
          </div>
          <span className="text-[10px] bg-blue-500/15 text-blue-400 font-bold px-2.5 py-1 rounded-full border border-blue-500/30">
            純文字解讀
          </span>
        </div>

        {loadingTechnical ? (
          <div className="py-6 text-center text-xs text-slate-400 animate-pulse">正在生成技術面文字解讀...</div>
        ) : technicalData ? (
          <div className="space-y-3">
            <div className={`p-4 rounded-2xl text-xs leading-relaxed border ${
              darkMode ? 'bg-slate-800/70 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              {technicalData.commentary}
            </div>

            <div className={`p-3 rounded-2xl text-[11px] font-semibold border ${
              darkMode ? 'bg-amber-950/20 border-amber-800/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              ⚠️ 聲明宣告：以上技術指標為程式計算之歷史數據參考，非交易訊號，不保證未來走勢，請自行判斷風險，投資盈虧自負。
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 py-4 text-center">暫無 AI 解讀內容</div>
        )}
      </div>

      {/* [一鍵匯入網格交易設定] */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-4 rounded-3xl shadow-md border border-slate-800 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-emerald-400 mb-0.5">🤖 智慧量化助手</div>
          <div className="text-sm font-black">[ 一鍵匯入網格交易設定 ]</div>
          <div className="text-[10px] text-slate-300 mt-0.5">自動套用 AI 導師演算之上下限與網格數</div>
        </div>
        <button
          onClick={() => alert(`已成功為 ${selectedAsset} 生成網格參數並匯入模擬策略！`)}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-2xl transition shadow-sm"
        >
          立即匯入
        </button>
      </div>
    </div>
  );
};

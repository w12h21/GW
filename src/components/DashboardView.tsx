import React, { useState } from 'react';
import { PortfolioData, DailyAdviceData, TabType } from '../types';
import { TrendingUp, Zap, ArrowUpRight, Calculator, BarChart3, Bell, ShieldCheck, Coins, LineChart, Edit3 } from 'lucide-react';

interface DashboardViewProps {
  portfolio: PortfolioData | null;
  dailyAdvice: DailyAdviceData | null;
  currency: 'USD' | 'TWD';
  setCurrency: (c: 'USD' | 'TWD') => void;
  exchangeRate: number;
  setActiveTab: (tab: TabType) => void;
  onOpenEditHoldings: () => void;
  darkMode: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  portfolio,
  dailyAdvice,
  currency,
  setCurrency,
  exchangeRate,
  setActiveTab,
  onOpenEditHoldings,
  darkMode,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'crypto' | 'stock'>('all');

  const rate = currency === 'TWD' ? exchangeRate : 1;
  const symbol = currency === 'TWD' ? 'NT$' : '$';

  const formatMoney = (usdVal: number) => {
    const val = usdVal * rate;
    return val.toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const filteredAllocations = portfolio?.allocations.filter(item => {
    if (categoryFilter === 'crypto') return item.category === 'crypto';
    if (categoryFilter === 'stock') return item.category === 'stock';
    return true;
  }) || [];

  // Overall Portfolio P&L Calculation
  const totalCostUsd = portfolio?.allocations.reduce((sum, item) => sum + (Number(item.holdingQty || 0) * Number(item.avgCost || 0)), 0) || 0;
  const totalMarketUsd = portfolio?.totalUsd || 0;
  const totalPnLUsd = totalMarketUsd - totalCostUsd;
  const totalReturnPct = totalCostUsd > 0 ? (totalPnLUsd / totalCostUsd) * 100 : 0;

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Modern FinTech Header (Revolut/Robinhood Style) */}
      <div className="flex items-center justify-between pt-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Bloomberg Pro Wealth
            </span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            資產總覽
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrency(currency === 'USD' ? 'TWD' : 'USD')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs border ${
              darkMode ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            {currency}
          </button>
          <button
            onClick={onOpenEditHoldings}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition transform hover:scale-105 active:scale-95 flex items-center space-x-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>持倉設定</span>
          </button>
        </div>
      </div>

      {/* Modern Balance Card (Apple Wallet / Revolut Style) */}
      <div className={`p-6 sm:p-8 rounded-3xl shadow-xl border relative overflow-hidden transition-all ${
        darkMode
          ? 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border-slate-800 text-white shadow-emerald-950/30'
          : 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-800 text-white shadow-xl'
      }`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>總淨值 (Total Balance)</span>
            <span>總成本: {symbol}{formatMoney(totalCostUsd)}</span>
          </div>

          <div className="flex items-baseline justify-between flex-wrap gap-2">
            <div className="text-4xl sm:text-5xl font-black tracking-tight font-mono">
              {symbol}{formatMoney(totalMarketUsd)}
            </div>
            <div className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono border ${
              totalPnLUsd >= 0
                ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'
                : 'text-rose-400 bg-rose-500/20 border-rose-500/30'
            }`}>
              {totalPnLUsd >= 0 ? '+' : ''}{symbol}{formatMoney(totalPnLUsd)} ({totalReturnPct >= 0 ? '+' : ''}{totalReturnPct.toFixed(2)}%)
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
            <span>市場風控: <strong className="text-emerald-400 font-semibold">{portfolio?.marketStatus || '🟢 正常 (低風險)'}</strong></span>
            <span>恐懼指數: <strong className="text-amber-400 font-mono font-semibold">{portfolio?.fearGreedIndex || 52} (中立)</strong></span>
          </div>
        </div>
      </div>

      {/* Zero Asset Clean Modern Card */}
      {totalMarketUsd === 0 && (
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm text-center space-y-4 ${
          darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            ✨
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold">目前投資組合淨值為 $0.00</h2>
            <p className={`text-xs max-w-md mx-auto ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              您尚未建立任何持倉部位。點擊下方按鈕輸入您的加密貨幣與台股持倉成本，解鎖實時損益與 AI 導師分析！
            </p>
          </div>
          <div>
            <button
              onClick={onOpenEditHoldings}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition transform hover:scale-105 active:scale-95 inline-flex items-center space-x-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>新增我的第一筆持倉</span>
            </button>
          </div>
        </div>
      )}

      {/* Category Tabs (Revolut/Robinhood Style Pill Navigation) */}
      <div className={`flex p-1.5 rounded-2xl border ${
        darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
      }`}>
        <button
          onClick={() => setCategoryFilter('all')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
            categoryFilter === 'all'
              ? darkMode ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-900 shadow-md'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          全部資產
        </button>
        <button
          onClick={() => setCategoryFilter('crypto')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
            categoryFilter === 'crypto'
              ? darkMode ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-900 shadow-md'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>加密貨幣</span>
        </button>
        <button
          onClick={() => setCategoryFilter('stock')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
            categoryFilter === 'stock'
              ? darkMode ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-900 shadow-md'
              : 'hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <LineChart className="w-3.5 h-3.5" />
          <span>台股投資</span>
        </button>
      </div>

      {/* Exchange Holdings Table / List */}
      <div className={`p-4 rounded-3xl shadow-sm border ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black uppercase tracking-wider font-mono text-emerald-500">
            [ 現貨與持倉清單 (Assets) ]
          </h2>
          <button onClick={() => setActiveTab('markets')} className="text-xs font-semibold text-emerald-500 hover:underline">
            查看行情走勢 &rarr;
          </button>
        </div>

        <div className="space-y-3">
          {filteredAllocations.map((item) => {
            const qty = Number(item.holdingQty || 0);
            const avgCost = Number(item.avgCost || 0);
            const currentPrice = Number(item.price || 0);
            const costVal = qty * avgCost;
            const marketVal = qty * currentPrice;
            const pnlVal = marketVal - costVal;
            const pnlPct = avgCost > 0 ? ((currentPrice - avgCost) / avgCost) * 100 : 0;

            return (
              <div key={item.symbol} className={`p-4 rounded-2xl border transition space-y-2.5 ${
                darkMode ? 'bg-slate-800/40 border-slate-700/80 hover:bg-slate-800/80' : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      item.category === 'crypto' ? 'bg-amber-500/20 text-amber-400 font-mono' : 'bg-blue-500/20 text-blue-400 font-mono'
                    }`}>
                      {item.symbol.slice(0, 3)}
                    </span>
                    <div>
                      <div className="font-bold text-sm flex items-center space-x-1.5">
                        <span>{item.name}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'}`}>
                          {item.symbol}
                        </span>
                      </div>
                      <div className={`text-[11px] font-mono ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        持倉佔比: {item.percentage}%
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-black text-sm">
                      {symbol}{formatMoney(marketVal)}
                    </div>
                    <div className={`text-[11px] font-bold ${pnlVal >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {pnlVal >= 0 ? '+' : ''}{symbol}{formatMoney(pnlVal)} ({pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%)
                    </div>
                  </div>
                </div>

                <div className={`grid grid-cols-3 gap-2 pt-2 border-t text-[11px] font-mono ${
                  darkMode ? 'border-slate-700/60 text-slate-300' : 'border-slate-200 text-slate-600'
                }`}>
                  <div>
                    <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>持有數量:</span> {qty}
                  </div>
                  <div>
                    <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>平均成本:</span> ${avgCost.toLocaleString()}
                  </div>
                  <div className="text-right">
                    <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>標記現價:</span> ${currentPrice.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Tools Section (Exchange Pro Tools) */}
      <div className={`p-4 rounded-3xl shadow-sm border ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
      }`}>
        <h2 className="text-xs font-black uppercase tracking-wider mb-3 font-mono text-emerald-500">[ 專業量化與交易工具 ]</h2>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center space-x-2 p-3 rounded-2xl border transition text-left group ${
              darkMode ? 'bg-slate-800/60 border-slate-700 hover:border-emerald-500' : 'bg-slate-50 border-slate-100 hover:bg-emerald-50/50 hover:border-emerald-200'
            }`}
          >
            <div className="p-2.5 bg-emerald-500/15 text-emerald-500 rounded-xl group-hover:scale-110 transition">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">📈 DCA定投試算</div>
              <div className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>定期定額回測</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center space-x-2 p-3 rounded-2xl border transition text-left group ${
              darkMode ? 'bg-slate-800/60 border-slate-700 hover:border-blue-500' : 'bg-slate-50 border-slate-100 hover:bg-blue-50/50 hover:border-blue-200'
            }`}
          >
            <div className="p-2.5 bg-blue-500/15 text-blue-500 rounded-xl group-hover:scale-110 transition">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">🕸️ 網格參數建議</div>
              <div className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>上下限自動配置</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center space-x-2 p-3 rounded-2xl border transition text-left group ${
              darkMode ? 'bg-slate-800/60 border-slate-700 hover:border-amber-500' : 'bg-slate-50 border-slate-100 hover:bg-amber-50/50 hover:border-amber-200'
            }`}
          >
            <div className="p-2.5 bg-amber-500/15 text-amber-500 rounded-xl group-hover:scale-110 transition">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">🔔 價格警報設定</div>
              <div className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>即時觸發通知</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center space-x-2 p-3 rounded-2xl border transition text-left group ${
              darkMode ? 'bg-slate-800/60 border-slate-700 hover:border-purple-500' : 'bg-slate-50 border-slate-100 hover:bg-purple-50/50 hover:border-purple-200'
            }`}
          >
            <div className="p-2.5 bg-purple-500/15 text-purple-500 rounded-xl group-hover:scale-110 transition">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold">🛡️ 風險評估工具</div>
              <div className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>量身打造資產比</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

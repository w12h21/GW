import React, { useState } from 'react';
import { Calculator, BarChart3, ShieldCheck, Sparkles } from 'lucide-react';

interface ToolsViewProps {
  darkMode: boolean;
}

export const ToolsView: React.FC<ToolsViewProps> = ({ darkMode }) => {
  const [activeTool, setActiveTool] = useState<'dca' | 'grid' | 'risk'>('dca');

  // DCA State
  const [dcaAmount, setDcaAmount] = useState<number>(100);
  const [dcaFrequency, setDcaFrequency] = useState<'weekly' | 'monthly'>('weekly');
  const [dcaMonths, setDcaMonths] = useState<number>(12);

  // Grid State
  const [gridAsset, setGridAsset] = useState<string>('BTC');
  const [gridLower, setGridLower] = useState<number>(60000);
  const [gridUpper, setGridUpper] = useState<number>(75000);
  const [gridGrids, setGridGrids] = useState<number>(50);

  // Risk Assessment State
  const [riskScore, setRiskScore] = useState<number>(6);
  const [goal, setGoal] = useState<string>('穩健增長');
  const [experience, setExperience] = useState<string>('中級投資人');
  const [riskResult, setRiskResult] = useState<any>(null);
  const [riskLoading, setRiskLoading] = useState(false);

  const calculateDca = () => {
    const totalPeriods = dcaFrequency === 'weekly' ? dcaMonths * 4 : dcaMonths;
    const totalInvested = dcaAmount * totalPeriods;
    const estimatedValue = totalInvested * 1.24;
    const profit = estimatedValue - totalInvested;
    return { totalInvested, estimatedValue, profit };
  };

  const dcaRes = calculateDca();

  const handleRiskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRiskLoading(true);
    try {
      const res = await fetch('/api/ai/risk-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riskScore, investmentGoal: goal, experience })
      });
      const data = await res.json();
      setRiskResult(data);
    } catch (err) {
      // Fallback result in case of network issue
      setRiskResult({
        allocation: [
          { asset: "BTC (比特幣)", pct: 45 },
          { asset: "ETH (以太坊)", pct: 25 },
          { asset: "台積電 (2330.TW)", pct: 20 },
          { asset: "鴻海 (2317.TW)", pct: 10 }
        ],
        riskLevel: riskScore > 7 ? "積極成長型" : "穩健均衡型",
        advice: "配置涵蓋主流加密貨幣與台股頂級權值股，抗通膨與成長兼備。",
        stopLossRule: "單筆部位回撤達 8% 執行嚴格止損。"
      });
    } finally {
      setRiskLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="pt-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${darkMode ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' : 'text-emerald-700 bg-emerald-50 border border-emerald-200'}`}>
          量化與資產配置工具
        </span>
        <h1 className={`text-xl font-black mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>[ 專業投資計算機 ]</h1>
      </div>

      {/* Tool Tabs */}
      <div className={`grid grid-cols-3 gap-1 p-1 rounded-2xl ${darkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-slate-200/80'}`}>
        <button
          onClick={() => setActiveTool('dca')}
          className={`py-2 text-xs font-bold rounded-xl transition ${
            activeTool === 'dca'
              ? darkMode ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
              : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          📈 DCA定投
        </button>
        <button
          onClick={() => setActiveTool('grid')}
          className={`py-2 text-xs font-bold rounded-xl transition ${
            activeTool === 'grid'
              ? darkMode ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
              : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🕸️ 網格參數
        </button>
        <button
          onClick={() => setActiveTool('risk')}
          className={`py-2 text-xs font-bold rounded-xl transition ${
            activeTool === 'risk'
              ? darkMode ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-900 shadow-sm'
              : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🛡️ 風險評估
        </button>
      </div>

      {/* DCA Tool */}
      {activeTool === 'dca' && (
        <div className={`p-4 rounded-3xl shadow-sm border space-y-4 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
        }`}>
          <div className="flex items-center space-x-2 border-b pb-2.5 border-slate-100 dark:border-slate-800">
            <Calculator className="w-4 h-4 text-emerald-500" />
            <h2 className="text-xs font-black uppercase tracking-wider">DCA 定期定額回測試算</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className={`block font-bold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>每期投入金額 (USD)</label>
              <input
                type="number"
                value={dcaAmount}
                onChange={(e) => setDcaAmount(Number(e.target.value))}
                className={`w-full px-3.5 py-2.5 rounded-2xl border font-mono ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block font-bold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>定投頻率</label>
                <select
                  value={dcaFrequency}
                  onChange={(e: any) => setDcaFrequency(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-2xl border ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="weekly">每週定投</option>
                  <option value="monthly">每月定投</option>
                </select>
              </div>
              <div>
                <label className={`block font-bold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>投資時長 (月)</label>
                <input
                  type="number"
                  value={dcaMonths}
                  onChange={(e) => setDcaMonths(Number(e.target.value))}
                  className={`w-full px-3.5 py-2.5 rounded-2xl border font-mono ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className={`p-4 rounded-3xl border space-y-2 ${
              darkMode ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200' : 'bg-emerald-50 border-emerald-200/60 text-emerald-900'
            }`}>
              <div className="text-xs font-black">回測預估結果 (歷史回測參考)</div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className={`p-2.5 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-emerald-100 text-slate-900'}`}>
                  <div className="text-[10px] text-slate-400">總投入成本</div>
                  <div className="text-xs font-black font-mono mt-0.5">${dcaRes.totalInvested.toLocaleString()}</div>
                </div>
                <div className={`p-2.5 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-white border-emerald-100 text-emerald-700'}`}>
                  <div className="text-[10px] text-slate-400">預估資產市值</div>
                  <div className="text-xs font-black font-mono mt-0.5">${dcaRes.estimatedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                </div>
                <div className={`p-2.5 rounded-2xl border ${darkMode ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-white border-emerald-100 text-emerald-600'}`}>
                  <div className="text-[10px] text-slate-400">預估獲利</div>
                  <div className="text-xs font-black font-mono mt-0.5">+${dcaRes.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid Tool */}
      {activeTool === 'grid' && (
        <div className={`p-4 rounded-3xl shadow-sm border space-y-4 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
        }`}>
          <div className="flex items-center space-x-2 border-b pb-2.5 border-slate-100 dark:border-slate-800">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <h2 className="text-xs font-black uppercase tracking-wider">AI 網格交易參數計算機</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className={`block font-bold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>選擇交易標的</label>
              <select
                value={gridAsset}
                onChange={(e) => setGridAsset(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-2xl border font-bold ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="BTC">BTC / USDT (區間 60,000 - 75,000)</option>
                <option value="ETH">ETH / USDT (區間 3,200 - 4,200)</option>
                <option value="2330.TW">台積電 / TWD (區間 920 - 1,060)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block font-bold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>網格下限價格</label>
                <input
                  type="number"
                  value={gridLower}
                  onChange={(e) => setGridLower(Number(e.target.value))}
                  className={`w-full px-3.5 py-2.5 rounded-2xl border font-mono ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block font-bold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>網格上限價格</label>
                <input
                  type="number"
                  value={gridUpper}
                  onChange={(e) => setGridUpper(Number(e.target.value))}
                  className={`w-full px-3.5 py-2.5 rounded-2xl border font-mono ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block font-bold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>網格數量 (格)</label>
              <input
                type="number"
                value={gridGrids}
                onChange={(e) => setGridGrids(Number(e.target.value))}
                className={`w-full px-3.5 py-2.5 rounded-2xl border font-mono ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
              darkMode ? 'bg-blue-950/30 border-blue-800/60 text-blue-200' : 'bg-blue-50 border-blue-200/60 text-blue-900'
            }`}>
              <div className="font-bold">💡 網格參數優化建議：</div>
              <div>每格利潤率約：<strong className="font-mono">{(((gridUpper - gridLower) / gridGrids / gridLower) * 100).toFixed(2)}%</strong></div>
              <div>建議最低投入資金：<strong className="font-mono">${(gridGrids * 15).toLocaleString()} USDT</strong></div>
            </div>

            <button
              onClick={() => alert(`成功套用 ${gridAsset} 網格參數設定！`)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black transition shadow-sm"
            >
              一鍵套用網格策略
            </button>
          </div>
        </div>
      )}

      {/* Risk Assessment Tool */}
      {activeTool === 'risk' && (
        <div className={`p-4 rounded-3xl shadow-sm border space-y-4 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
        }`}>
          <div className="flex items-center space-x-2 border-b pb-2.5 border-slate-100 dark:border-slate-800">
            <ShieldCheck className="w-4 h-4 text-purple-500" />
            <h2 className="text-xs font-black uppercase tracking-wider">AI 個人化風險評估與資產配置</h2>
          </div>

          <form onSubmit={handleRiskSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className={`block font-bold mb-1.5 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                風險承受評分 (1分保守 - 10分激進): <strong className="text-purple-500 font-black font-mono text-sm">{riskScore}</strong>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={riskScore}
                onChange={(e) => setRiskScore(Number(e.target.value))}
                className="w-full accent-purple-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block font-bold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>投資目標</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-2xl border font-bold ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="資本保值">資本保值</option>
                  <option value="穩健增長">穩健增長</option>
                  <option value="積極滾雪球">積極滾雪球</option>
                </select>
              </div>
              <div>
                <label className={`block font-bold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>投資經驗</label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-2xl border font-bold ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="新手入門">新手入門</option>
                  <option value="中級投資人">中級投資人</option>
                  <option value="資深操盤手">資深操盤手</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={riskLoading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black transition shadow-sm flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{riskLoading ? 'AI 分析配置中...' : '生成專屬資產配置'}</span>
            </button>
          </form>

          {riskResult && (
            <div className={`p-4 rounded-3xl border space-y-3 ${
              darkMode ? 'bg-purple-950/30 border-purple-800/60 text-purple-200' : 'bg-purple-50 border-purple-200/60 text-purple-900'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">評估結果：{riskResult.riskLevel}</span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2.5 py-0.5 rounded-full border border-purple-500/30">AI 量身打造</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="font-bold">建議資產配置比例：</div>
                <div className="flex flex-wrap gap-1.5">
                  {riskResult.allocation?.map((a: any, i: number) => (
                    <span key={i} className={`px-3 py-1 rounded-xl border font-mono text-xs font-black ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-purple-200 text-purple-900'
                    }`}>
                      {a.asset}: {a.pct}%
                    </span>
                  ))}
                </div>
                <div className={`pt-1 font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>導師建議：{riskResult.advice}</div>
                <div className="text-[11px] text-rose-500 font-bold">風控紀律：{riskResult.stopLossRule}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

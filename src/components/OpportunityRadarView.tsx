import React, { useState, useEffect } from 'react';
import { OpportunityScanData } from '../types';
import { Radar, RefreshCw, AlertTriangle, TrendingUp, TrendingDown, Clock, ShieldAlert, Globe, ListFilter } from 'lucide-react';

interface OpportunityRadarViewProps {
  currency: 'USD' | 'TWD';
  exchangeRate: number;
  darkMode: boolean;
}

export const OpportunityRadarView: React.FC<OpportunityRadarViewProps> = ({
  currency,
  exchangeRate,
  darkMode,
}) => {
  const [data, setData] = useState<OpportunityScanData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);
  const [radarTab, setRadarTab] = useState<'portfolio' | 'marketCrypto'>('portfolio');

  const fetchScan = async (force = false) => {
    if (cooldown > 0 && force) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/opportunities/scan?force=${force}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
        if (force) {
          setNotice('✅ 機會雷達已成功重新掃描！');
          setCooldown(30);
          navigator.vibrate?.(100);
        }
      }
    } catch (err) {
      console.error('Failed to fetch opportunity scan:', err);
      setNotice('⚠️ 掃描市場機會失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScan(false);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown(c => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const formatPrice = (usdPrice: number) => {
    const val = currency === 'TWD' ? usdPrice * exchangeRate : usdPrice;
    const prefix = currency === 'TWD' ? 'NT$' : '$';
    if (val >= 1000) {
      return `${prefix}${val.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`.replace('US$', '$');
    }
    return `${prefix}${val.toFixed(2)}`;
  };

  return (
    <div className="space-y-4 pb-12">
      {/* 1. Prominent Yellow Warning Disclaimer Banner at the Top */}
      <div className={`p-3.5 rounded-2xl border flex items-start space-x-3 shadow-xs ${
        darkMode
          ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
          : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}>
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
        <div className="text-xs font-medium leading-relaxed">
          <span className="font-bold">【免責聲明】</span>
          以下內容由AI自動生成，僅為技術面觀察與公開資訊整理，非投資建議，不保證獲利，請自行判斷風險。
        </div>
      </div>

      {/* Header & Scan Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Radar className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h2 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              市場機會雷達
            </h2>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              自動偵測自選與全市場加密貨幣波動異常標的
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchScan(true)}
          disabled={loading || cooldown > 0}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm ${
            cooldown > 0
              ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-400'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{cooldown > 0 ? `${cooldown}s` : '重新掃描'}</span>
        </button>
      </div>

      {notice && (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium">
          {notice}
        </div>
      )}

      {/* Timestamps */}
      {data && (
        <div className={`text-[11px] flex items-center justify-between px-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <span className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-emerald-500" />
            <span>最後掃描: {new Date(data.lastScanned).toLocaleTimeString()}</span>
          </span>
          <span>下次自動更新: {new Date(data.nextScanDue).toLocaleTimeString()}</span>
        </div>
      )}

      {/* Sub-tabs to separate Portfolio Watchlist vs Market-Wide Top Crypto Radar */}
      <div className={`p-1 rounded-2xl flex border ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-200/70 border-slate-300'
      }`}>
        <button
          onClick={() => setRadarTab('portfolio')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
            radarTab === 'portfolio'
              ? 'bg-emerald-500 text-white shadow-xs'
              : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>自選資產監控</span>
        </button>
        <button
          onClick={() => setRadarTab('marketCrypto')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
            radarTab === 'marketCrypto'
              ? 'bg-emerald-500 text-white shadow-xs'
              : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>全市場加密貨幣雷達</span>
        </button>
      </div>

      {/* TAB 1: Portfolio Watchlist Scan */}
      {radarTab === 'portfolio' && (
        <div className="space-y-4">
          {/* Overview AI Summary */}
          {data?.aiAnalysis?.overview && (
            <div className={`p-4 rounded-2xl border shadow-xs ${
              darkMode ? 'bg-slate-900/80 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">自選資產雷達智能總結</span>
              </div>
              <p className="text-xs leading-relaxed">{data.aiAnalysis.overview}</p>
            </div>
          )}

          <div className="space-y-3">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              自選監控標的掃描 ({data?.items?.length || 0})
            </h3>

            {(!data || !data.items || data.items.length === 0) ? (
              <div className={`p-8 text-center rounded-2xl border ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
              }`}>
                <p className="text-xs">目前自選清單無標的達到 24h 變動 5% 門檻。</p>
              </div>
            ) : (
              data.items.map((item) => {
                const isPos = item.change24h >= 0;
                const detail = data.aiAnalysis.details?.[item.symbol];

                return (
                  <div
                    key={item.symbol}
                    className={`p-4 rounded-2xl border transition shadow-xs ${
                      darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isPos ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {item.symbol.substring(0, 3)}
                        </span>
                        <div>
                          <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            {item.name} <span className="text-xs font-mono text-slate-400">({item.symbol})</span>
                          </h4>
                          <p className="text-[11px] text-amber-500 font-medium">{item.reason}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-sm font-bold font-mono ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          {formatPrice(item.currentPrice)}
                        </div>
                        <div className={`text-xs font-bold flex items-center justify-end space-x-0.5 ${
                          isPos ? 'text-emerald-500' : 'text-rose-500'
                        }`}>
                          {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          <span>{isPos ? '+' : ''}{item.change24h}%</span>
                        </div>
                      </div>
                    </div>

                    {detail ? (
                      <div className={`mt-3 pt-3 border-t space-y-2 text-xs ${
                        darkMode ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-600'
                      }`}>
                        <div>
                          <span className="font-bold text-indigo-400">🔥 波動原因：</span>
                          <span>{detail.whyVolatile}</span>
                        </div>
                        <div>
                          <span className="font-bold text-emerald-400">👁️ 觀察重點：</span>
                          <span>{detail.observationPoints}</span>
                        </div>
                      </div>
                    ) : (
                      <div className={`mt-2 text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        AI 正在生成此標的的深度觀察報告...
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Stock Market Notice */}
          <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
            darkMode ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <span className="font-bold text-slate-300">💡 關於股票市場掃描的技術說明：</span>
            <p>
              目前免費可用的公開資料源（如 Yahoo Finance API / TWSE MIS）未提供「全市場美股/台股漲跌幅排行」的直接公開端點。因此技術上暫時無法做到美股與台股的全市場自動掃描，股票類標的（如台積電 2330.TW、鴻海 2317.TW、AAPL、NVDA）仍維持由使用者自行設定於自選清單中進行即時監控，不會勉強產生不準確的假掃描結果。
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: Market-Wide Top Crypto Radar (Top 250 Top 10 Movers) */}
      {radarTab === 'marketCrypto' && (
        <div className="space-y-4">
          {/* Explicit Required Label */}
          <div className={`p-3 rounded-xl border text-xs font-semibold ${
            darkMode ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
          }`}>
            📊 以下為市值前250大加密貨幣中，24小時波動最劇烈的前10名，非使用者自選清單。
          </div>

          {/* Top Crypto AI Overview */}
          {data?.topCrypto?.aiAnalysis?.overview && (
            <div className={`p-4 rounded-2xl border shadow-xs ${
              darkMode ? 'bg-slate-900/80 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">全市場加密貨幣雷達智能總結</span>
              </div>
              <p className="text-xs leading-relaxed">{data.topCrypto.aiAnalysis.overview}</p>
            </div>
          )}

          <div className="space-y-3">
            {!data?.topCrypto?.topMovers || data.topCrypto.topMovers.length === 0 ? (
              <div className={`p-8 text-center rounded-2xl border ${
                darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
              }`}>
                <p className="text-xs">正在載入全市場加密貨幣排行資料...</p>
              </div>
            ) : (
              data.topCrypto.topMovers.map((coin, index) => {
                const isPos = coin.change24h >= 0;
                const coinDetail = data.topCrypto?.aiAnalysis?.details?.[coin.symbol];
                return (
                  <div
                    key={coin.id}
                    className={`p-4 rounded-2xl border transition shadow-xs ${
                      darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                          index < 3 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          #{index + 1}
                        </span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                              {coin.name} <span className="text-xs font-mono text-slate-400">({coin.symbol})</span>
                            </h4>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                              市值排名 #{coin.marketCapRank}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{coin.reason}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`text-sm font-bold font-mono ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          {formatPrice(coin.currentPrice)}
                        </div>
                        <div className={`text-xs font-bold flex items-center justify-end space-x-0.5 ${
                          isPos ? 'text-emerald-500' : 'text-rose-500'
                        }`}>
                          {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          <span>{isPos ? '+' : ''}{coin.change24h}%</span>
                        </div>
                      </div>
                    </div>

                    {coinDetail ? (
                      <div className={`mt-3 pt-3 border-t space-y-2 text-xs ${
                        darkMode ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-600'
                      }`}>
                        <div>
                          <span className="font-bold text-indigo-400">🔥 波動原因：</span>
                          <span>{coinDetail.whyVolatile}</span>
                        </div>
                        <div>
                          <span className="font-bold text-emerald-400">👁️ 觀察重點：</span>
                          <span>{coinDetail.observationPoints}</span>
                        </div>
                      </div>
                    ) : (
                      <div className={`mt-2 text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        點擊右上角「重新掃描」可觸發 AI 生成此標的的深度觀察報告。
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Mandatory Disclaimer Footer */}
      <div className={`p-3 rounded-xl border text-[11px] text-center ${
        darkMode ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
      }`}>
        {data?.aiAnalysis?.disclaimer || "以上為AI根據公開資訊之自動化分析，僅供參考，不構成投資建議，市場有風險，投資決策請自行判斷並謹慎評估"}
      </div>
    </div>
  );
};

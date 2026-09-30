import React, { useState } from 'react';
import { TabType, PortfolioData, DailyAdviceData } from '../types';
import { DashboardView } from './DashboardView';
import { MarketView } from './MarketView';
import { AiAdvisorView } from './AiAdvisorView';
import { OpportunityRadarView } from './OpportunityRadarView';
import { ToolsView } from './ToolsView';
import { SettingsView } from './SettingsView';
import { LayoutDashboard, TrendingUp, Radar, Bot, Calculator, Settings, Wifi, Battery, Signal, Sun, Moon } from 'lucide-react';


interface IphoneContainerProps {
  portfolio: PortfolioData | null;
  dailyAdvice: DailyAdviceData | null;
  onRefreshDaily: () => void;
  onRefreshMarket: () => void;
  marketRefreshing: boolean;
  loading: boolean;
  aiCacheNotice?: string | null;
  marketCooldown?: number;
  aiCooldown?: number;
  currency: 'USD' | 'TWD';
  setCurrency: (c: 'USD' | 'TWD') => void;
  exchangeRate: number;
  onOpenEditHoldings: () => void;
  darkMode: boolean;
  setDarkMode: (d: boolean) => void;
}

export const IphoneContainer: React.FC<IphoneContainerProps> = ({
  portfolio,
  dailyAdvice,
  onRefreshDaily,
  onRefreshMarket,
  marketRefreshing,
  loading,
  aiCacheNotice,
  marketCooldown,
  aiCooldown,
  currency,
  setCurrency,
  exchangeRate,
  onOpenEditHoldings,
  darkMode,
  setDarkMode,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-2 sm:p-6 font-sans antialiased relative overflow-hidden transition-colors duration-500 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Ambient Glowing Background Gradients / Mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20 transition-all duration-700 ${
          darkMode ? 'bg-emerald-600' : 'bg-emerald-400'
        }`} />
        <div className={`absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-15 transition-all duration-700 ${
          darkMode ? 'bg-indigo-600' : 'bg-blue-400'
        }`} />
        <div className={`absolute -bottom-40 left-1/3 w-[450px] h-[450px] rounded-full blur-3xl opacity-10 transition-all duration-700 ${
          darkMode ? 'bg-teal-600' : 'bg-emerald-300'
        }`} />
      </div>

      {/* Top Controls: Frame Mode & Dark/Light Mode */}
      <div className="mb-4 z-20 flex items-center space-x-3 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 px-5 py-2.5 rounded-full shadow-lg shadow-emerald-500/5 border border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 hover:shadow-emerald-500/10">
        <button
          onClick={() => setIsPhoneFrame(!isPhoneFrame)}
          className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-500 dark:hover:text-emerald-400 transition flex items-center space-x-1.5"
        >
          <span>{isPhoneFrame ? '🖥️ 切換全螢幕檢視' : '📱 切換 iPhone 框'}</span>
        </button>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5 hover:text-emerald-500 dark:hover:text-emerald-400 transition"
        >
          {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
          <span>{darkMode ? '淺色背景' : '深色背景'}</span>
        </button>
      </div>

      {/* Main Container */}
      <div
        className={`z-10 transition-all duration-500 shadow-2xl overflow-hidden relative flex flex-col backdrop-blur-2xl ${
          isPhoneFrame
            ? `w-full max-w-[420px] h-[860px] rounded-[52px] border-[14px] ${
                darkMode ? 'border-slate-900 bg-slate-950/95 shadow-emerald-950/30' : 'border-slate-900 bg-white/95 shadow-2xl'
              } ring-2 ring-emerald-500/20`
            : `w-full max-w-4xl min-h-[860px] rounded-3xl border ${
                darkMode ? 'border-slate-800 bg-slate-950/95 shadow-2xl shadow-indigo-950/20' : 'border-slate-200/80 bg-white/95 shadow-2xl'
              }`
        }`}
      >
        {/* iPhone Status Bar & Dynamic Island */}
        <div className={`px-6 pt-3.5 pb-2.5 flex items-center justify-between text-xs select-none shrink-0 z-50 ${
          darkMode ? 'bg-slate-950/90 text-white backdrop-blur-md' : 'bg-slate-900 text-white'
        }`}>
          <span className="font-semibold font-mono tracking-wider">09:41</span>
          
          {/* Dynamic Island */}
          {isPhoneFrame && (
            <div className="w-28 h-5 bg-black rounded-full flex items-center justify-center px-2.5 space-x-2 shadow-sm border border-slate-800/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-xs shadow-emerald-500" />
              <span className="text-[10px] text-emerald-300 font-semibold tracking-wide">AI 投顧運作中</span>
            </div>
          )}

          <div className="flex items-center space-x-2.5">
            <Signal className="w-3.5 h-3.5 text-slate-300" />
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className={`flex-1 overflow-y-auto px-4 py-3 custom-scrollbar ${darkMode ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-b from-slate-50/80 via-white to-slate-100/60'}`}>
          {activeTab === 'dashboard' && (
            <DashboardView
              portfolio={portfolio}
              dailyAdvice={dailyAdvice}
              currency={currency}
              setCurrency={setCurrency}
              exchangeRate={exchangeRate}
              setActiveTab={setActiveTab}
              onOpenEditHoldings={onOpenEditHoldings}
              darkMode={darkMode}
            />
          )}
          {activeTab === 'markets' && (
            <MarketView
              portfolio={portfolio}
              dailyAdvice={dailyAdvice}
              onRefreshMarket={onRefreshMarket}
              marketRefreshing={marketRefreshing}
              marketCooldown={marketCooldown}
              currency={currency}
              exchangeRate={exchangeRate}
              darkMode={darkMode}
            />
          )}
          {activeTab === 'radar' && (
            <OpportunityRadarView
              currency={currency}
              exchangeRate={exchangeRate}
              darkMode={darkMode}
            />
          )}
          {activeTab === 'ai' && (
            <AiAdvisorView
              dailyAdvice={dailyAdvice}
              onRefresh={onRefreshDaily}
              loading={loading}
              aiCacheNotice={aiCacheNotice}
              aiCooldown={aiCooldown}
              darkMode={darkMode}
            />
          )}
          {activeTab === 'tools' && <ToolsView darkMode={darkMode} />}
          {activeTab === 'settings' && (
            <SettingsView
              currency={currency}
              setCurrency={setCurrency}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          )}
        </div>

        {/* iOS Bottom Navigation Bar */}
        <div className={`border-t px-3 py-2.5 flex items-center justify-around shrink-0 z-50 backdrop-blur-md ${
          darkMode ? 'bg-slate-900/95 border-slate-800 text-white' : 'bg-white/95 border-slate-200 text-slate-800'
        }`}>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center space-y-0.5 transition ${
              activeTab === 'dashboard' ? 'text-emerald-500 font-black' : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px]">總覽</span>
          </button>

          <button
            onClick={() => setActiveTab('markets')}
            className={`flex flex-col items-center space-y-0.5 transition ${
              activeTab === 'markets' ? 'text-emerald-500 font-black' : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px]">行情</span>
          </button>

          <button
            onClick={() => setActiveTab('radar')}
            className={`flex flex-col items-center space-y-0.5 transition ${
              activeTab === 'radar' ? 'text-emerald-500 font-black' : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Radar className="w-5 h-5" />
            <span className="text-[10px]">機會雷達</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex flex-col items-center space-y-0.5 transition ${
              activeTab === 'ai' ? 'text-emerald-500 font-black' : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Bot className="w-5 h-5" />
            <span className="text-[10px]">AI導師</span>
          </button>

          <button
            onClick={() => setActiveTab('tools')}
            className={`flex flex-col items-center space-y-0.5 transition ${
              activeTab === 'tools' ? 'text-emerald-500 font-black' : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Calculator className="w-5 h-5" />
            <span className="text-[10px]">工具</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center space-y-0.5 transition ${
              activeTab === 'settings' ? 'text-emerald-500 font-black' : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px]">設定</span>
          </button>
        </div>

        {/* iPhone Home Indicator bar */}
        {isPhoneFrame && (
          <div className={`pb-1.5 pt-1 flex justify-center shrink-0 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <div className={`w-32 h-1 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-300'}`} />
          </div>
        )}
      </div>
    </div>
  );
};

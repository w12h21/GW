import React from 'react';
import { Bell, Shield, Globe, Smartphone, RefreshCw, Sun, Moon } from 'lucide-react';

interface SettingsViewProps {
  currency: 'USD' | 'TWD';
  setCurrency: (c: 'USD' | 'TWD') => void;
  darkMode: boolean;
  setDarkMode: (d: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ currency, setCurrency, darkMode, setDarkMode }) => {
  return (
    <div className="space-y-4 pb-20">
      <div className="pt-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${darkMode ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' : 'text-emerald-700 bg-emerald-50 border border-emerald-200'}`}>
          個人化設定與系統偏好
        </span>
        <h1 className={`text-xl font-black mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>[ ⚙️ 系統設定 ]</h1>
      </div>

      <div className={`p-4 rounded-3xl shadow-sm border space-y-4 text-xs ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
      }`}>
        <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            {darkMode ? <Moon className="w-4 h-4 text-emerald-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <div>
              <div className="font-bold">介面外觀模式 (深色/淺色)</div>
              <div className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>切換專業深色黑金與簡約淺色模式</div>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-3 py-1.5 font-bold rounded-xl transition ${
              darkMode ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-900 text-white shadow-sm'
            }`}
          >
            {darkMode ? '🌙 深色模式' : '☀️ 淺色模式'}
          </button>
        </div>

        <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Globe className="w-4 h-4 text-emerald-500" />
            <div>
              <div className="font-bold">預設計價貨幣</div>
              <div className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>切換 USD 美元或 TWD 新台幣</div>
            </div>
          </div>
          <button
            onClick={() => setCurrency(currency === 'USD' ? 'TWD' : 'USD')}
            className={`px-3 py-1.5 font-bold rounded-xl transition ${
              darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            {currency}
          </button>
        </div>

        <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Bell className="w-4 h-4 text-amber-500" />
            <div>
              <div className="font-bold">推播通知 (價格與進出場警報)</div>
              <div className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>觸發買入/止盈區時即時推播</div>
            </div>
          </div>
          <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-600 rounded cursor-pointer" />
        </div>

        <div className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <RefreshCw className="w-4 h-4 text-blue-500" />
            <div>
              <div className="font-bold">每日財金新聞自動更新</div>
              <div className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>每天自動聯網更新建議</div>
            </div>
          </div>
          <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-600 rounded cursor-pointer" />
        </div>

        <div className="flex items-center justify-between py-2.5">
          <div className="flex items-center space-x-2.5">
            <Shield className="w-4 h-4 text-purple-500" />
            <div>
              <div className="font-bold">雙重防護與風控鎖</div>
              <div className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>強制執行止損位通知</div>
            </div>
          </div>
          <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-600 rounded cursor-pointer" />
        </div>
      </div>

      <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-sm text-center space-y-1 border border-slate-800">
        <Smartphone className="w-6 h-6 mx-auto text-emerald-400 mb-1" />
        <div className="text-xs font-bold">導師級投資助手 v3.0 (Bloomberg iPhone Edition)</div>
        <div className="text-[10px] text-slate-400">Powered by Google AI Studio & Gemini 3.8 Flash</div>
      </div>
    </div>
  );
};

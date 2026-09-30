import React, { useState } from 'react';
import { DailyAdviceData } from '../types';
import { Zap, RefreshCw, Send, Bot, CheckCircle2, AlertCircle } from 'lucide-react';
import { DynamicNewsFeed } from './DynamicNewsFeed';

interface AiAdvisorViewProps {
  dailyAdvice: DailyAdviceData | null;
  onRefresh: () => void;
  loading: boolean;
  aiCacheNotice?: string | null;
  aiCooldown?: number;
  darkMode: boolean;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

export const AiAdvisorView: React.FC<AiAdvisorViewProps> = ({ dailyAdvice, onRefresh, loading, aiCacheNotice, aiCooldown, darkMode }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: '您好！我是您的導師級投資助手。今天市場動態已更新，您可以詢問我關於比特幣、以太坊或台積電的進出場點、DCA定投策略或網格交易設定。' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const getRemainingCacheHours = () => {
    if (!dailyAdvice?.lastUpdated) return null;
    const elapsedMs = Date.now() - new Date(dailyAdvice.lastUpdated).getTime();
    const sixHoursMs = 6 * 60 * 60 * 1000;
    if (elapsedMs < sixHoursMs) {
      return ((sixHoursMs - elapsedMs) / (60 * 60 * 1000)).toFixed(1);
    }
    return null;
  };

  const remainingCacheHours = getRemainingCacheHours();

  const handleSendMessage = async (eOrText?: React.FormEvent | string) => {
    if (eOrText && typeof eOrText !== 'string') {
      eOrText.preventDefault();
    }
    const userMsg = typeof eOrText === 'string' ? eOrText : inputMessage;
    if (!userMsg.trim() || chatLoading) return;

    if (typeof eOrText !== 'string') {
      setInputMessage('');
    }
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await res.json();
      if (data.reply) {
        setMessages([...newMessages, { role: 'model', content: data.reply }]);
      } else {
        setMessages([...newMessages, { role: 'model', content: '目前 AI 伺服器連線繁忙，請稍後再試。' }]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'model', content: '連線AI導師失敗，請稍後再試。' }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${darkMode ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' : 'text-emerald-700 bg-emerald-50 border border-emerald-200'}`}>
            每日財金新聞與智慧建議
          </span>
          <h1 className={`text-xl font-black mt-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>[ AI導師即時快訊 ]</h1>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading || (aiCooldown !== undefined && aiCooldown > 0)}
          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-2xl text-xs font-bold transition shadow-sm disabled:opacity-50"
          title="更新每日AI分析"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'AI分析中...' : aiCooldown && aiCooldown > 0 ? `請稍候 ${aiCooldown}s` : '更新每日分析'}</span>
        </button>
      </div>

      {/* Cache / Frequency Limit Notification Banner */}
      {(aiCacheNotice || remainingCacheHours) && (
        <div className={`p-3 rounded-2xl text-xs flex items-center justify-between space-x-2 border transition ${
          darkMode 
            ? 'bg-amber-950/40 border-amber-800/60 text-amber-200' 
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span>
              {aiCacheNotice || `AI 分析仍在 6 小時有效期限內，將在 ${remainingCacheHours} 小時後自動更新（目前為快取內容）`}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 whitespace-nowrap">
            6H 快取保護
          </span>
        </div>
      )}

      {/* Daily Headline & Summary */}
      {dailyAdvice && (
        <div className={`p-4 rounded-3xl shadow-sm border space-y-3 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
        }`}>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>最後更新: {new Date(dailyAdvice.lastUpdated).toLocaleTimeString('zh-TW', { hour12: false })}</span>
            <span className={`font-bold px-2.5 py-0.5 rounded-full border ${
              remainingCacheHours 
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' 
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            }`}>
              {remainingCacheHours ? `快取分析中 (${remainingCacheHours}h 後更新)` : 'AI 聯網實時抓取'}
            </span>
          </div>
          <h2 className="text-sm font-black leading-snug">{dailyAdvice.headline}</h2>
          <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{dailyAdvice.summary}</p>
        </div>
      )}

      {/* [緊急警訊監測] */}
      <div className={`p-4 rounded-3xl shadow-sm border space-y-3 ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
      }`}>
        <div className="flex items-center justify-between border-b pb-2.5 border-slate-100 dark:border-slate-800">
          <h2 className="text-xs font-black uppercase tracking-wider">[緊急警訊監測]</h2>
          <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            安全無虞
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className={`p-3 rounded-2xl border ${darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <div className={`text-[10px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>巨鯨鏈上動向</div>
            <div className="text-xs font-bold text-emerald-500 mt-1 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{dailyAdvice?.whaleStatus || '正常 (流入大於流出)'}</span>
            </div>
          </div>

          <div className={`p-3 rounded-2xl border ${darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <div className={`text-[10px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>合約清算風險</div>
            <div className="text-xs font-bold text-emerald-500 mt-1 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{dailyAdvice?.liquidationRisk || '低 (多空槓桿平衡)'}</span>
            </div>
          </div>
        </div>

        <div className={`flex items-center justify-between text-xs p-3 rounded-2xl border ${
          darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-100'
        }`}>
          <span>市場風險狀態: <strong className="text-emerald-500">{dailyAdvice?.marketStatus || '🟢 低風險 (盤整打底期)'}</strong></span>
          <span>恐懼貪婪指數: <strong className="text-amber-500 font-mono">{dailyAdvice?.fearGreedIndex || 52} (中立)</strong></span>
        </div>
      </div>

      {/* Dynamic Google Search News Feed */}
      <DynamicNewsFeed
        darkMode={darkMode}
        onExplainWithAI={(headline) => {
          const prompt = `請幫我深度解讀這則財金新聞："${headline}" 並分析它對我的投資組合（比特幣、以太坊、台積電、鴻海）的具體影響、進場買點與風控建議。`;
          handleSendMessage(prompt);
        }}
      />

      {/* AI Mentor Interactive Q&A */}
      <div className={`p-4 rounded-3xl shadow-sm border space-y-3 ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'
      }`}>
        <div className="flex items-center space-x-2 border-b pb-2.5 border-slate-100 dark:border-slate-800">
          <Bot className="w-4 h-4 text-emerald-500" />
          <h2 className="text-xs font-black uppercase tracking-wider">與 AI 投資導師即時對話</h2>
        </div>

        <div className="h-52 overflow-y-auto space-y-3 pr-1 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed shadow-xs ${
                  m.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-xs font-medium'
                    : darkMode
                      ? 'bg-slate-800 text-slate-200 rounded-bl-xs border border-slate-700'
                      : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className={`p-3.5 rounded-2xl text-xs animate-pulse ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                導師正在精算市場與點位中...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="flex items-center space-x-2 pt-1">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="詢問進出場點、DCA策略或市場看法..."
            className={`flex-1 px-3.5 py-2.5 text-xs rounded-2xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
          <button
            type="submit"
            disabled={chatLoading}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl transition disabled:opacity-50 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PortfolioData, DailyAdviceData, AssetAllocation } from './types';
import { IphoneContainer } from './components/IphoneContainer';
import { EditHoldingsModal } from './components/EditHoldingsModal';

export default function App() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [dailyAdvice, setDailyAdvice] = useState<DailyAdviceData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [marketRefreshing, setMarketRefreshing] = useState<boolean>(false);
  const [currency, setCurrency] = useState<'USD' | 'TWD'>('USD');
  const [darkMode, setDarkMode] = useState<boolean>(true); // Default to professional trading dark theme
  const [aiCacheNotice, setAiCacheNotice] = useState<string | null>(null);
  const [marketCooldown, setMarketCooldown] = useState<number>(0);
  const [aiCooldown, setAiCooldown] = useState<number>(0);
  const [isEditHoldingsOpen, setIsEditHoldingsOpen] = useState<boolean>(false);
  const [exchangeRate, setExchangeRate] = useState<number>(32.5);

  const fetchMarketData = async () => {
    try {
      const res = await fetch('/api/market-data');
      const data = await res.json();
      if (data.portfolio) setPortfolio(data.portfolio);
      if (data.dailyAdvice) setDailyAdvice(data.dailyAdvice);
    } catch (err) {
      console.error('Failed to fetch market data:', err);
    }
  };

  const fetchExchangeRate = async () => {
    try {
      const res = await fetch('/api/exchange-rate');
      const data = await res.json();
      if (data.success && data.rate) {
        setExchangeRate(data.rate);
      }
    } catch (err) {
      console.warn('Failed to fetch live exchange rate, using default 32.5:', err);
    }
  };

  useEffect(() => {
    fetchMarketData();
    fetchExchangeRate();
  }, []);

  // Cooldown countdown interval
  useEffect(() => {
    const timer = setInterval(() => {
      setMarketCooldown(prev => (prev > 0 ? prev - 1 : 0));
      setAiCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 5-minute silent background polling for market data (using background: true to prevent rate-limit conflicts)
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/refresh-market', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ background: true })
        });
        const data = await res.json();
        if (res.ok && data.success && data.portfolio) {
          setPortfolio(data.portfolio);
        }
      } catch (err) {
        // Silent catch for background polling
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(pollInterval);
  }, []);

  const handleRefreshDaily = async () => {
    if (aiCooldown > 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/refresh-daily', { method: 'POST' });
      const data = await res.json();
      if (res.status === 429 || data.success === false) {
        const waitSec = data.retryAfterSeconds || 60;
        setAiCooldown(waitSec);
        setAiCacheNotice(`⚠️ 請求過於頻繁，請稍候 ${waitSec} 秒後再試`);
        return;
      }
      if (!res.ok) {
        throw new Error(`[HTTP_${res.status}] AI 導師更新失敗`);
      }
      if (data.dailyAdvice) {
        setDailyAdvice(data.dailyAdvice);
      }
      if (data.cached) {
        setAiCacheNotice(`ℹ️ AI 分析仍在 6 小時有效期限內（距離下次自動更新尚餘約 ${data.remainingHours} 小時），已使用快取內容。`);
      } else {
        setAiCacheNotice('✅ AI 分析已成功重新聯網生成最新報告！');
        navigator.vibrate?.(100);
      }
    } catch (err: any) {
      console.error('Failed to refresh AI analysis:', err);
      setAiCacheNotice(`⚠️ AI 導師更新失敗：${err.message || err.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshMarket = async () => {
    if (marketCooldown > 0) return;
    setMarketRefreshing(true);
    try {
      const res = await fetch('/api/refresh-market', { method: 'POST' });
      const data = await res.json();
      if (res.status === 429 || data.success === false) {
        const waitSec = data.retryAfterSeconds || 60;
        setMarketCooldown(waitSec);
        setAiCacheNotice(`⚠️ 請稍候 ${waitSec} 秒後再更新行情`);
        return;
      }
      if (!res.ok) {
        throw new Error(`[HTTP_${res.status}] 行情更新失敗`);
      }
      if (data.portfolio) {
        setPortfolio(data.portfolio);
        setAiCacheNotice('✅ 行情已成功更新至最新市場報價！');
        navigator.vibrate?.(100);
      }
    } catch (err: any) {
      console.error('Failed to refresh market prices:', err);
      setAiCacheNotice(`⚠️ 行情更新失敗：${err.message || err.toString()}`);
    } finally {
      setMarketRefreshing(false);
    }
  };

  const handleSaveHoldings = async (updatedAllocations: AssetAllocation[]) => {
    try {
      const res = await fetch('/api/portfolio/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allocations: updatedAllocations })
      });
      const data = await res.json();
      if (res.ok && data.success && data.portfolio) {
        setPortfolio(data.portfolio);
        setAiCacheNotice('✅ 個人持倉與成本已成功更新！');
      } else {
        throw new Error(data.error || '更新持倉失敗');
      }
    } catch (err: any) {
      console.error('Failed to update portfolio holdings:', err);
      setAiCacheNotice(`⚠️ 更新持倉失敗：${err.message || err.toString()}`);
    }
  };

  return (
    <>
      <IphoneContainer
        portfolio={portfolio}
        dailyAdvice={dailyAdvice}
        onRefreshDaily={handleRefreshDaily}
        onRefreshMarket={handleRefreshMarket}
        marketRefreshing={marketRefreshing}
        loading={loading}
        aiCacheNotice={aiCacheNotice}
        marketCooldown={marketCooldown}
        aiCooldown={aiCooldown}
        currency={currency}
        setCurrency={setCurrency}
        exchangeRate={exchangeRate}
        onOpenEditHoldings={() => setIsEditHoldingsOpen(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      <EditHoldingsModal
        portfolio={portfolio}
        isOpen={isEditHoldingsOpen}
        onClose={() => setIsEditHoldingsOpen(false)}
        onSave={handleSaveHoldings}
        darkMode={darkMode}
      />
    </>
  );
}

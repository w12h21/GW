import React, { useState } from 'react';
import { PortfolioData, AssetAllocation } from '../types';
import { X, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface EditHoldingsModalProps {
  portfolio: PortfolioData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedAllocations: AssetAllocation[]) => void;
  darkMode: boolean;
}

export const EditHoldingsModal: React.FC<EditHoldingsModalProps> = ({
  portfolio,
  isOpen,
  onClose,
  onSave,
  darkMode,
}) => {
  const [allocations, setAllocations] = useState<AssetAllocation[]>(
    portfolio?.allocations ? JSON.parse(JSON.stringify(portfolio.allocations)) : []
  );

  // New asset form state
  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<'crypto' | 'stock'>('crypto');
  const [newHoldingQty, setNewHoldingQty] = useState('');
  const [newAvgCost, setNewAvgCost] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQtyChange = (index: number, val: string) => {
    const updated = [...allocations];
    updated[index].holdingQty = val === '' ? 0 : Number(val);
    setAllocations(updated);
  };

  const handleCostChange = (index: number, val: string) => {
    const updated = [...allocations];
    updated[index].avgCost = val === '' ? 0 : Number(val);
    setAllocations(updated);
  };

  const handleRemove = (index: number) => {
    const updated = allocations.filter((_, i) => i !== index);
    setAllocations(updated);
  };

  const handleAddAsset = () => {
    setErrorMsg(null);
    if (!newSymbol.trim()) {
      setErrorMsg('請輸入資產代號 (Symbol)');
      return;
    }
    const qty = Number(newHoldingQty);
    const cost = Number(newAvgCost);
    if (isNaN(qty) || qty < 0) {
      setErrorMsg('持有數量必須為大於或等於 0 的有效數字');
      return;
    }
    if (isNaN(cost) || cost < 0) {
      setErrorMsg('平均成本必須為大於或等於 0 的有效數字');
      return;
    }

    const upperSymbol = newSymbol.trim().toUpperCase();
    if (allocations.some(a => a.symbol === upperSymbol)) {
      setErrorMsg(`資產 ${upperSymbol} 已存在於持倉中`);
      return;
    }

    const newAsset: AssetAllocation = {
      symbol: upperSymbol,
      name: newName.trim() || upperSymbol,
      category: newCategory,
      holdingQty: qty,
      avgCost: cost,
      price: cost > 0 ? cost : 100, // Initial price fallback
      change24h: 0,
      amount: qty * (cost > 0 ? cost : 100),
      percentage: 0
    };

    setAllocations([...allocations, newAsset]);
    setNewSymbol('');
    setNewName('');
    setNewHoldingQty('');
    setNewAvgCost('');
  };

  const handleSaveAll = () => {
    // Validate all
    for (const item of allocations) {
      if (isNaN(item.holdingQty) || item.holdingQty < 0 || isNaN(item.avgCost) || item.avgCost < 0) {
        setErrorMsg('所有持倉數量與平均成本必須為非負數字');
        return;
      }
    }
    onSave(allocations);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl border max-h-[90vh] overflow-y-auto ${
        darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700/40">
          <div>
            <h2 className="text-base font-black">⚙️ 編輯個人持倉與成本</h2>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              自訂持股數量與平均成本，市值將隨即時行情自動計算。
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Existing Assets List */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500">現有資產明細</h3>
          {allocations.map((item, idx) => (
            <div key={item.symbol} className={`p-3 rounded-2xl border space-y-2 ${
              darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    item.category === 'crypto' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {item.category === 'crypto' ? '虛擬貨幣' : '台股'}
                  </span>
                  <span className="font-bold text-sm">{item.name} ({item.symbol})</span>
                </div>
                <button
                  onClick={() => handleRemove(idx)}
                  className="text-rose-400 hover:text-rose-300 p-1 rounded-lg transition"
                  title="刪除此資產"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    持有數量 (Qty)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={item.holdingQty}
                    onChange={(e) => handleQtyChange(idx, e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-xl text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    平均買入成本 (Avg Cost)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={item.avgCost}
                    onChange={(e) => handleCostChange(idx, e.target.value)}
                    className={`w-full px-3 py-1.5 rounded-xl text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Asset Section */}
        <div className={`p-4 rounded-2xl border mb-6 ${
          darkMode ? 'bg-slate-800/40 border-slate-700/80' : 'bg-slate-100/70 border-slate-200'
        }`}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-emerald-500">➕ 新增自訂資產</h3>
          <p className={`text-[11px] mb-3 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            新增清單以外的資產（如 SOL、NVDA 等）。系統會嘗試自動透過 API 抓取即時報價，若無對應 API 則會先以平均成本作為初始參考價。
          </p>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className={`block text-[11px] font-semibold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>代號 (Symbol)</label>
              <input
                type="text"
                placeholder="例如 SOL 或 AAPL"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-xl text-xs font-mono border uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-[11px] font-semibold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>名稱 (Name)</label>
              <input
                type="text"
                placeholder="例如 Solana"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className={`block text-[11px] font-semibold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>類別</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as 'crypto' | 'stock')}
                className={`w-full px-2 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              >
                <option value="crypto">虛擬貨幣</option>
                <option value="stock">台股/美股</option>
              </select>
            </div>
            <div>
              <label className={`block text-[11px] font-semibold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>持有數量</label>
              <input
                type="number"
                step="any"
                placeholder="0.0"
                value={newHoldingQty}
                onChange={(e) => setNewHoldingQty(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-xl text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-[11px] font-semibold mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>平均成本</label>
              <input
                type="number"
                step="any"
                placeholder="0.0"
                value={newAvgCost}
                onChange={(e) => setNewAvgCost(e.target.value)}
                className={`w-full px-3 py-1.5 rounded-xl text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <button
            onClick={handleAddAsset}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>加入資產清單</span>
          </button>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-700/40">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            取消
          </button>
          <button
            onClick={handleSaveAll}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            儲存變更
          </button>
        </div>
      </div>
    </div>
  );
};

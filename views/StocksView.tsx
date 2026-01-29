
import React, { useState } from 'react';
import { StockRecord } from '../types';
import { Plus, TrendingUp, TrendingDown, Activity, X, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Props {
  stocks: StockRecord[];
  setStocks: React.Dispatch<React.SetStateAction<StockRecord[]>>;
}

const StocksView: React.FC<Props> = ({ stocks, setStocks }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', buy: '', sell: '', fee: '' });

  const handleNumeric = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    if (val.split('.').length > 2) return;
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const addStock = () => {
    const buy = parseFloat(form.buy);
    const sell = parseFloat(form.sell);
    if (!form.name.trim() || isNaN(buy) || isNaN(sell)) {
      alert("请填写有效的股票名称及金额");
      return;
    }
    const newStock: StockRecord = {
      id: Date.now().toString(),
      name: form.name.trim(),
      code: form.code.trim(),
      buyPrice: buy,
      sellPrice: sell,
      fee: parseFloat(form.fee) || 0
    };
    setStocks([...stocks, newStock]);
    setShowAdd(false);
    setForm({ name: '', code: '', buy: '', sell: '', fee: '' });
  };

  const deleteStock = (id: string) => {
    if (confirm("确定要删除这条交易记录吗？")) {
      setStocks(stocks.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-4 md:space-y-8">
      <header className="flex flex-row justify-between items-center">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">股票复盘</h2>
          <p className="text-xs md:text-sm text-slate-500">记录投资收益，总结交易得失</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-indigo-600 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-700 shadow-lg active:scale-95 transition-all text-sm md:text-base font-medium"
        >
          <Plus size={18} />
          <span className="hidden xs:inline">添加记录</span>
          <span className="xs:hidden">添加</span>
        </button>
      </header>

      {/* Desktop View Table */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-5">股票</th>
                <th className="px-8 py-5">成本 (含费)</th>
                <th className="px-8 py-5">成交</th>
                <th className="px-8 py-5">收益额</th>
                <th className="px-8 py-5">收益率</th>
                <th className="px-8 py-5 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stocks.length > 0 ? stocks.map(stock => {
                const profit = stock.sellPrice - stock.buyPrice - stock.fee;
                const roi = stock.buyPrice !== 0 ? (profit / stock.buyPrice) * 100 : 0;
                const isProfit = profit >= 0;

                return (
                  <tr key={stock.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isProfit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          <Activity size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{stock.name}</p>
                          <p className="text-xs text-slate-400">{stock.code || '--'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-slate-600">
                      ¥ {(stock.buyPrice + stock.fee).toLocaleString()}
                    </td>
                    <td className="px-8 py-6 text-sm font-medium text-slate-600">
                      ¥ {stock.sellPrice.toLocaleString()}
                    </td>
                    <td className={`px-8 py-6 font-bold ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {isProfit ? '+' : ''} ¥ {profit.toLocaleString()}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${isProfit ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {isProfit ? '↑' : '↓'} {roi.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button onClick={() => deleteStock(stock.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-2">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-300">
                    <div className="flex flex-col items-center gap-3">
                      <TrendingUp size={40} className="text-slate-100" />
                      <p>尚无股票交易记录</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View Cards */}
      <div className="md:hidden space-y-3">
        {stocks.length > 0 ? stocks.map(stock => {
          const profit = stock.sellPrice - stock.buyPrice - stock.fee;
          const roi = stock.buyPrice !== 0 ? (profit / stock.buyPrice) * 100 : 0;
          const isProfit = profit >= 0;

          return (
            <div key={stock.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isProfit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    <Activity size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{stock.name}</p>
                    <p className="text-[10px] text-slate-400">{stock.code || '--'}</p>
                  </div>
                </div>
                <button onClick={() => deleteStock(stock.id)} className="text-slate-300 p-1">
                  <Trash2 size={14} />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <p className="text-slate-400 font-medium mb-0.5 tracking-tighter uppercase text-[9px]">买入成本</p>
                  <p className="font-semibold text-slate-700">¥{(stock.buyPrice + stock.fee).toLocaleString()}</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <p className="text-slate-400 font-medium mb-0.5 tracking-tighter uppercase text-[9px]">卖出成交</p>
                  <p className="font-semibold text-slate-700">¥{stock.sellPrice.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <span className={`text-base font-bold ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isProfit ? '+' : ''}¥{profit.toLocaleString()}
                  </span>
                </div>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isProfit ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {isProfit ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {roi.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="py-20 text-center text-slate-300 bg-white rounded-2xl border border-slate-100">
            <TrendingUp size={32} className="mx-auto opacity-10 mb-2" />
            <p className="text-xs">尚无股票交易记录</p>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-md shadow-2xl p-6 md:p-8 animate-in slide-in-from-bottom md:zoom-in duration-300">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-bold text-slate-800">新增交易记录</h3>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 p-2"><X size={24}/></button>
            </div>
            <div className="space-y-4 md:space-y-5">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">股票名称</label>
                  <input type="text" placeholder="如: 贵州茅台" autoComplete="off" className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs md:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">股票代码</label>
                  <input type="text" placeholder="如: 600519" autoComplete="off" className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs md:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium" value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">买入总额 (成本)</label>
                <input type="text" inputMode="decimal" placeholder="0.00" autoComplete="off" className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs md:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium" value={form.buy} onChange={handleNumeric('buy')} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">卖出总额 (成交)</label>
                <input type="text" inputMode="decimal" placeholder="0.00" autoComplete="off" className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs md:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium" value={form.sell} onChange={handleNumeric('sell')} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">手续费</label>
                <input type="text" inputMode="decimal" placeholder="0.00" autoComplete="off" className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs md:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium" value={form.fee} onChange={handleNumeric('fee')} />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={addStock} className="flex-1 bg-indigo-600 text-white py-3.5 md:py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 active:scale-95 transition-all text-sm md:text-base">确认添加</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StocksView;

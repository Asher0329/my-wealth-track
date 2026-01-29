
import React, { useState } from 'react';
import { FixedDeposit, Account } from '../types';
import { Plus, PiggyBank, Calendar, ArrowRight, CheckCircle2, X } from 'lucide-react';

interface Props {
  deposits: FixedDeposit[];
  setDeposits: React.Dispatch<React.SetStateAction<FixedDeposit[]>>;
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
}

const DepositsView: React.FC<Props> = ({ deposits, setDeposits, accounts, setAccounts }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [principal, setPrincipal] = useState('');
  const [apr, setApr] = useState('');
  const [start, setStart] = useState(new Date().toISOString().split('T')[0]);
  const [end, setEnd] = useState('');

  const handleNumeric = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    if (val.split('.').length > 2) return;
    setter(val);
  };

  const calculateInterest = (p: number, r: number, s: string, e: string) => {
    const startDate = new Date(s);
    const endDate = new Date(e);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (isNaN(diffDays)) return 0;
    const annualInterest = p * (r / 100);
    return (annualInterest * diffDays) / 365;
  };

  const handleSettle = (deposit: FixedDeposit, accountId: string) => {
    const interest = calculateInterest(deposit.principal, deposit.apr, deposit.startDate, deposit.endDate);
    const total = deposit.principal + interest;

    setAccounts(prev => prev.map(acc => {
      if (acc.id === accountId) return { ...acc, balance: acc.balance + total };
      return acc;
    }));

    setDeposits(prev => prev.map(d => {
      if (d.id === deposit.id) return { ...d, status: 'EXPIRED', settledToAccountId: accountId };
      return d;
    }));
  };

  const addDeposit = () => {
    const p = parseFloat(principal);
    const r = parseFloat(apr);
    if (!name.trim() || isNaN(p) || isNaN(r) || !end) {
      alert("请填写完整定存信息");
      return;
    }
    const newDeposit: FixedDeposit = {
      id: Date.now().toString(),
      name: name.trim(),
      principal: p,
      apr: r,
      startDate: start,
      endDate: end,
      status: 'ONGOING'
    };
    setDeposits([...deposits, newDeposit]);
    setShowAdd(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setPrincipal('');
    setApr('');
    setEnd('');
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">定存管理</h2>
          <p className="text-slate-500">追踪您的定期存款及利息收益</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-700 shadow-lg active:scale-95 transition-all"
        >
          <Plus size={18} />
          <span>新增定存</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {deposits.map(dep => {
          const interest = calculateInterest(dep.principal, dep.apr, dep.startDate, dep.endDate);
          return (
            <div key={dep.id} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${dep.status === 'ONGOING' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    <PiggyBank size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{dep.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">年化利率: {dep.apr}%</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${dep.status === 'ONGOING' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {dep.status === 'ONGOING' ? '进行中' : '已到期'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">本金</p>
                  <p className="text-xl font-bold text-slate-900">¥ {dep.principal.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">预计利息</p>
                  <p className="text-xl font-bold text-emerald-500">¥ {interest.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-500 mb-8 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Calendar size={16} />
                <span>{dep.startDate}</span>
                <ArrowRight size={14} className="mx-1 text-slate-300" />
                <span>{dep.endDate}</span>
              </div>

              {dep.status === 'ONGOING' ? (
                <div className="pt-6 border-t border-slate-100 flex items-center gap-3">
                  <select 
                    className="flex-1 p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    onChange={(e) => e.target.value && handleSettle(dep, e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>到期结算至账户...</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              ) : (
                <div className="pt-6 border-t border-slate-100 flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                  <CheckCircle2 size={16} />
                  已结算至: {accounts.find(a => a.id === dep.settledToAccountId)?.name}
                </div>
              )}
            </div>
          );
        })}
        {deposits.length === 0 && !showAdd && (
          <div className="lg:col-span-2 py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
             <PiggyBank size={48} className="mb-4 opacity-20" />
             <p>暂无定存记录</p>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">新增定期存款</h3>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600 p-2"><X size={24}/></button>
            </div>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">存款名称</label>
                <input type="text" placeholder="如: 浦发三年存单" autoComplete="off" className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">本金金额</label>
                  <input type="text" inputMode="decimal" placeholder="0.00" autoComplete="off" className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium" value={principal} onChange={handleNumeric(setPrincipal)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">年化利率 (%)</label>
                  <input type="text" inputMode="decimal" placeholder="3.5" autoComplete="off" className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium" value={apr} onChange={handleNumeric(setApr)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 px-1 uppercase">开始时间</label>
                  <input type="date" className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={start} onChange={e => setStart(e.target.value)} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1 px-1 uppercase">结束时间</label>
                  <input type="date" className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none" value={end} onChange={e => setEnd(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={addDeposit} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">确认添加</button>
                <button onClick={() => setShowAdd(false)} className="px-6 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all">取消</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositsView;

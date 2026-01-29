
import React, { useState, useMemo, useEffect } from 'react';
import { LedgerEntry, Category, Account, RecordType } from '../types';
import { Plus, Search, Calendar, Filter, Trash2, ArrowUpCircle, ArrowDownCircle, X, Settings, RotateCcw, History, Clock, AlertCircle } from 'lucide-react';

interface Props {
  ledger: LedgerEntry[];
  categories: Category[];
  accounts: Account[];
  onAddEntry: (entry: Omit<LedgerEntry, 'id'>) => void;
  onDeleteEntry: (id: string) => void;
}

const Ledger: React.FC<Props> = ({ ledger, categories, accounts, onAddEntry, onDeleteEntry }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // 用于点击确认时触发抖动的临时状态
  const [clickShake, setClickShake] = useState(false);
  
  // Form State
  const [type, setType] = useState<RecordType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [primaryCat, setPrimaryCat] = useState(categories[0]?.name || '');
  const [secondaryCat, setSecondaryCat] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [remark, setRemark] = useState('');

  // 深度监听账户变化，确保 accountId 始终有效
  useEffect(() => {
    if (accounts.length > 0) {
      const currentValid = accounts.find(a => String(a.id) === String(accountId));
      if (!currentValid) {
        setAccountId(String(accounts[0].id));
      }
    } else {
      setAccountId('');
    }
  }, [accounts, accountId]);

  // 当前选中账户的实时数据
  const selectedAccount = useMemo(() => 
    accounts.find(a => String(a.id) === String(accountId)),
    [accounts, accountId]
  );

  const isBalanceCritical = selectedAccount ? selectedAccount.balance <= 0 : false;

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrimary, setFilterPrimary] = useState('ALL');
  const [filterSecondary, setFilterSecondary] = useState('ALL');
  const [filterYear, setFilterYear] = useState('ALL');
  const [filterMonth, setFilterMonth] = useState('ALL');

  const activeCategory = categories.find(c => c.name === primaryCat);
  const filterActiveCategory = categories.find(c => c.name === filterPrimary);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    ledger.forEach(entry => {
      const year = new Date(entry.date).getFullYear().toString();
      years.add(year);
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [ledger]);

  const handleNumericInput = (val: string) => {
    const filtered = val.replace(/[^0-9.]/g, '');
    const parts = filtered.split('.');
    if (parts.length > 2) return; 
    setAmount(filtered);
  };

  const filteredLedger = useMemo(() => {
    return ledger
      .filter(entry => {
        const entryDate = new Date(entry.date);
        const matchSearch = entry.remark?.toLowerCase().includes(searchTerm.toLowerCase()) ?? true;
        const matchPrimary = filterPrimary === 'ALL' || entry.primaryCategory === filterPrimary;
        const matchSecondary = filterSecondary === 'ALL' || entry.secondaryCategory === filterSecondary;
        const matchYear = filterYear === 'ALL' || entryDate.getFullYear().toString() === filterYear;
        const matchMonth = filterMonth === 'ALL' || (entryDate.getMonth() + 1).toString() === filterMonth;
        
        return matchSearch && matchPrimary && matchSecondary && matchYear && matchMonth;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [ledger, searchTerm, filterPrimary, filterSecondary, filterYear, filterMonth]);

  const getDailySummary = (dateStr: string) => {
    const dayEntries = filteredLedger.filter(e => e.date.split('T')[0] === dateStr);
    const income = dayEntries.filter(e => e.type === 'INCOME').reduce((s, e) => s + e.amount, 0);
    const expense = dayEntries.filter(e => e.type === 'EXPENSE').reduce((s, e) => s + e.amount, 0);
    return { income, expense };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("请输入有效的金额");
      return;
    }

    if (!accountId) {
      alert("请先选择或创建一个账户");
      return;
    }

    if (selectedAccount) {
      const currentBalance = Number(selectedAccount.balance);
      
      // 如果余额为0，或者当前是支出且余额不足，点击确认时触发抖动效果
      const isInsufficient = type === 'EXPENSE' && parsedAmount > currentBalance;
      if (currentBalance <= 0 || isInsufficient) {
        setClickShake(true);
        // 500ms 后移除类，以便下次点击时能再次触发动画
        setTimeout(() => setClickShake(false), 500); 

        if (isInsufficient) {
          const confirmMsg = `⚠️ 账户余额不足！\n\n当前账户 [${selectedAccount.name}] 余额为 ¥${currentBalance.toLocaleString()}。\n本次支出金额为 ¥${parsedAmount.toLocaleString()}。\n\n确定要继续记录吗？`;
          if (!window.confirm(confirmMsg)) {
            return;
          }
        } else if (currentBalance <= 0 && type === 'EXPENSE') {
          // 如果余额恰好为0且在记支出，强制给个提示
          if (!window.confirm(`⚠️ 该账户 [${selectedAccount.name}] 目前余额为 0，确定要记录这笔支出吗？`)) {
            return;
          }
        }
      }
    }

    onAddEntry({
      amount: parsedAmount,
      type,
      accountId,
      primaryCategory: primaryCat,
      secondaryCategory: secondaryCat || (activeCategory?.subCategories[0] || ''),
      date: new Date(date).toISOString(),
      remark: remark.trim()
    });
    
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setAmount('');
    setRemark('');
    setSecondaryCat('');
    setType('EXPENSE');
  };

  const resetFilters = () => {
    setFilterPrimary('ALL');
    setFilterSecondary('ALL');
    setFilterYear('ALL');
    setFilterMonth('ALL');
    setSearchTerm('');
  };

  const isFiltered = searchTerm !== '' || filterPrimary !== 'ALL' || filterSecondary !== 'ALL' || filterYear !== 'ALL' || filterMonth !== 'ALL';

  let lastRenderedDate = '';

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">记账历史</h2>
          <p className="text-xs md:text-sm text-slate-500">记录您的每一笔收支细节</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-xl hover:bg-indigo-700 shadow-lg active:scale-95 transition-all text-sm md:text-base font-medium"
        >
          <Plus size={18} />
          <span className="hidden xs:inline">记一笔</span>
          <span className="xs:hidden">记账</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full max-sm:max-w-none max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="搜索账目备注..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-medium transition-all ${showFilters || isFiltered ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
              >
                <Filter size={16}/>
                <span>筛选</span>
              </button>
              {isFiltered && (
                <button 
                  onClick={resetFilters}
                  className="flex-shrink-0 p-1.5 md:p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-all"
                  title="重置所有筛选"
                >
                  <RotateCcw size={16} />
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">一级类目</label>
                  <select 
                    value={filterPrimary}
                    onChange={(e) => {
                      setFilterPrimary(e.target.value);
                      setFilterSecondary('ALL');
                    }}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs md:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ALL">全部一级</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">二级类目</label>
                  <select 
                    value={filterSecondary}
                    onChange={(e) => setFilterSecondary(e.target.value)}
                    disabled={filterPrimary === 'ALL'}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs md:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    <option value="ALL">全部二级</option>
                    {filterActiveCategory?.subCategories.map(sc => (
                      <option key={sc} value={sc}>{sc}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/50">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">年份</label>
                  <select 
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs md:text-sm text-slate-900 focus:outline-none"
                  >
                    <option value="ALL">所有年份</option>
                    {availableYears.map(year => <option key={year} value={year}>{year}年</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">月份</label>
                  <select 
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="w-full px-2 py-2 bg-white border border-slate-200 rounded-lg text-xs md:text-sm text-slate-900 focus:outline-none"
                  >
                    <option value="ALL">所有月份</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month.toString()}>{month}月</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop View (Hidden on mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">类目</th>
                <th className="px-6 py-4">账户</th>
                <th className="px-6 py-4">备注</th>
                <th className="px-6 py-4 text-right">金额</th>
                <th className="px-6 py-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLedger.length > 0 ? filteredLedger.map(entry => {
                const currentDate = entry.date.split('T')[0];
                const showDateHeader = currentDate !== lastRenderedDate;
                lastRenderedDate = currentDate;
                const dailySummary = showDateHeader ? getDailySummary(currentDate) : null;

                return (
                  <React.Fragment key={entry.id}>
                    {showDateHeader && (
                      <tr className="bg-slate-50/80 border-y border-slate-200/60 sticky top-0 z-10 backdrop-blur-sm">
                        <td colSpan={5} className="px-6 py-2.5">
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-indigo-500" />
                              <span className="text-slate-900">{currentDate}</span>
                            </div>
                            <div className="flex gap-4">
                              <span className="text-rose-500">支: ¥{dailySummary?.expense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                              <span className="text-emerald-600">收: ¥{dailySummary?.income.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    <tr className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-800">{entry.primaryCategory}</span>
                          <span className="text-xs text-slate-400">{entry.secondaryCategory}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md whitespace-nowrap uppercase">
                          {accounts.find(a => String(a.id) === String(entry.accountId))?.name || '未知账户'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                        {entry.remark || '-'}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${entry.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {entry.type === 'INCOME' ? '+' : '-'} ¥ {entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => onDeleteEntry(entry.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <History size={40} className="opacity-20 mb-2" />
                      <p className="italic font-medium">没有找到记录</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Card List) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredLedger.length > 0 ? filteredLedger.map(entry => {
            const currentDate = entry.date.split('T')[0];
            const showDateHeader = currentDate !== lastRenderedDate;
            lastRenderedDate = currentDate;
            const dailySummary = showDateHeader ? getDailySummary(currentDate) : null;

            return (
              <React.Fragment key={entry.id}>
                {showDateHeader && (
                  <div className="bg-slate-50 px-4 py-2 flex items-center justify-between text-[10px] font-bold sticky top-0 z-10 border-y border-slate-200/50 backdrop-blur-md">
                    <span className="text-slate-900">{currentDate}</span>
                    <div className="flex gap-2">
                      <span className="text-rose-500">支{dailySummary?.expense.toFixed(0)}</span>
                      <span className="text-emerald-600">收{dailySummary?.income.toFixed(0)}</span>
                    </div>
                  </div>
                )}
                <div className="p-4 flex items-center justify-between active:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${entry.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {entry.type === 'INCOME' ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-800">{entry.primaryCategory}</span>
                        <span className="text-[10px] text-slate-400">• {entry.secondaryCategory}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span className="font-bold bg-slate-100 px-1 rounded uppercase tracking-tighter">
                          {accounts.find(a => String(a.id) === String(entry.accountId))?.name || '账户'}
                        </span>
                        {entry.remark && <span className="truncate max-w-[120px]">{entry.remark}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold whitespace-nowrap ${entry.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {entry.type === 'INCOME' ? '+' : '-'}¥{entry.amount.toLocaleString()}
                    </span>
                    <button onClick={() => onDeleteEntry(entry.id)} className="text-slate-300 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </React.Fragment>
            );
          }) : (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center">
              <History size={40} className="opacity-20 mb-2" />
              <p className="text-xs italic">没有找到记录</p>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom md:zoom-in duration-300">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-bold text-slate-800">记一笔</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-2"><X size={24}/></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                <div className="flex p-1 bg-slate-100 rounded-xl">
                  <button type="button" onClick={() => setType('EXPENSE')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${type === 'EXPENSE' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>
                    <ArrowDownCircle size={16} className="text-rose-500" /> 支出
                  </button>
                  <button type="button" onClick={() => setType('INCOME')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${type === 'INCOME' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>
                    <ArrowUpCircle size={16} className="text-emerald-500" /> 收入
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">金额</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">¥</span>
                    <input type="text" inputMode="decimal" value={amount} onChange={e => handleNumericInput(e.target.value)} placeholder="0.00" autoComplete="off" className={`w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${type === 'EXPENSE' ? 'text-rose-500' : 'text-emerald-500'}`} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">一级类目</label>
                    <select value={primaryCat} onChange={e => { setPrimaryCat(e.target.value); setSecondaryCat(''); }} className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs md:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">二级类目</label>
                    <select value={secondaryCat} onChange={e => setSecondaryCat(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs md:text-sm text-slate-900 focus:outline-none">
                      <option value="">选择子类</option>
                      {activeCategory?.subCategories.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1">
                    <div className="mb-0.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">账户</label>
                    </div>
                    {/* 
                      重点修改：
                      1. 移除了顶部的“实时余额”文本。
                      2. 在 option 内直接显示余额。
                      3. 如果当前选中的账户余额为 0，则将 select 的文字颜色设为红色 (text-rose-600)。
                    */}
                    <select 
                      value={accountId} 
                      onChange={e => setAccountId(e.target.value)} 
                      className={`w-full px-3 py-2.5 bg-white border rounded-xl text-xs md:text-sm transition-all focus:outline-none ${
                        isBalanceCritical ? 'text-rose-600 font-bold' : 'text-slate-900'
                      } ${
                        clickShake 
                          ? 'animate-shake border-rose-500 ring-2 ring-rose-100' 
                          : 'border-slate-300 focus:ring-2 focus:ring-indigo-500'
                      }`}
                    >
                      {accounts.map(a => (
                        <option 
                          key={a.id} 
                          value={String(a.id)}
                          className={a.balance <= 0 ? 'text-rose-600 font-bold' : 'text-slate-900'}
                        >
                          {a.name} (余额: ¥{a.balance.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">日期</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs md:text-sm text-slate-900 focus:outline-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">备注</label>
                  <input type="text" value={remark} onChange={e => setRemark(e.target.value)} placeholder="记录一下用途..." autoComplete="off" className="w-full px-4 py-2.5 md:py-3 bg-white border border-slate-300 rounded-xl text-xs md:text-sm text-slate-900 focus:outline-none" />
                </div>

                <button type="submit" className="w-full py-3 md:py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 active:scale-[0.98] transition-all">确认记录</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ledger;

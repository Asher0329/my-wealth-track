import { supabase } from './supabaseClient'  //自添加
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  History, 
  PiggyBank, 
  TrendingUp, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { ViewType, Account, LedgerEntry, Category, FixedDeposit, StockRecord } from './types';
import { DEFAULT_CATEGORIES } from './constants';
import Dashboard from './views/Dashboard';
import Ledger from './views/Ledger';
import AccountsView from './views/AccountsView';
import DepositsView from './views/DepositsView';
import StocksView from './views/StocksView';
import SettingsView from './views/SettingsView';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 就是这一行！把它加在这里
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const getStoredItem = <T,>(key: string, defaultValue: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      console.error(`Error loading ${key}:`, e);
      return defaultValue;
    }
  };
  // 将数据同步到 Supabase 的函数
const syncToSupabase = async (data: any) => {
  try {
    // 假设你目前只是想测试连接，把所有的 ledger 记录存入 posts 表
    const { error } = await supabase
      .from('posts')
      .insert([{ content: JSON.stringify(data) }]);
    
    if (error) console.error('Supabase 同步失败:', error.message);
  } catch (e) {
    console.error('网络错误:', e);
  }
};//自添加

  const [accounts, setAccounts] = useState<Account[]>(() => 
    getStoredItem('wt_accounts', [
      { id: '1', name: '现金', balance: 0 },
      { id: '2', name: '银行卡', balance: 0 }
    ])
  );

  const [ledger, setLedger] = useState<LedgerEntry[]>(() => 
    getStoredItem('wt_ledger', [])
  );

  const [categories, setCategories] = useState<Category[]>(() => 
    getStoredItem('wt_categories', DEFAULT_CATEGORIES)
  );

  const [deposits, setDeposits] = useState<FixedDeposit[]>(() => 
    getStoredItem('wt_deposits', [])
  );

  const [stocks, setStocks] = useState<StockRecord[]>(() => 
    getStoredItem('wt_stocks', [])
  );

  //隔断
// 1. 【读取逻辑】仅在页面首次加载时运行，从云端获取最新账目
useEffect(() => {
  const fetchLedger = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('content')
      .order('created_at', { ascending: false })
      .limit(1);

    if (!error && data && data.length > 0) {
      try {
        const remoteLedger = JSON.parse(data[0].content);
        if (Array.isArray(remoteLedger) && remoteLedger.length > 0) {
          setLedger(remoteLedger); // 将云端数据同步到本地状态
        }
      } catch (e) {
        console.error("解析云端数据失败:", e);
      }
    }
    setIsInitialLoad(false);//记录点自添加
  };
  fetchLedger();
}, []); // 保持空数组，确保只在刷新页面时执行一次

  //隔断

  // 2. 只有当数据发生变化且初始加载完成后，才同步
  useEffect(() => {
    // 保存到本地
    localStorage.setItem('wt_accounts', JSON.stringify(accounts));
    localStorage.setItem('wt_ledger', JSON.stringify(ledger));
    localStorage.setItem('wt_categories', JSON.stringify(categories));
    localStorage.setItem('wt_deposits', JSON.stringify(deposits));
    localStorage.setItem('wt_stocks', JSON.stringify(stocks));  

    // 只有在【非初始加载】状态下，才同步到 Supabase
    if (!isInitialLoad && ledger.length > 0) {
      syncToSupabase(ledger);
    }
    // 依赖数组必须紧跟在大括号后面
  }, [accounts, ledger, categories, deposits, stocks, isInitialLoad]);

  const totalAccountBalance = useMemo(() => accounts.reduce((sum, a) => sum + Number(a.balance), 0), [accounts]);
  const totalDeposits = useMemo(() => deposits.reduce((sum, d) => sum + Number(d.principal), 0), [deposits]);
  const totalStockProfit = useMemo(() => stocks.reduce((sum, s) => sum + (Number(s.sellPrice) - Number(s.buyPrice) - Number(s.fee)), 0), [stocks]);
  const netWorth = totalAccountBalance + totalDeposits + totalStockProfit;

  const handleAddEntry = (entry: Omit<LedgerEntry, 'id'>) => {
    const newEntry = { ...entry, id: Date.now().toString() };
    setLedger(prev => [newEntry, ...prev]);
    
    setAccounts(prev => prev.map(acc => {
      if (String(acc.id) === String(entry.accountId)) {
        return { 
          ...acc, 
          balance: entry.type === 'INCOME' ? acc.balance + entry.amount : acc.balance - entry.amount 
        };
      }
      return acc;
    }));
  };

  const handleDeleteEntry = (id: string) => {
    const entry = ledger.find(e => e.id === id);
    if (!entry) return;
    
    if (window.confirm('确定要删除这条账目吗？账户余额将自动回退。')) {
      setLedger(prev => prev.filter(e => e.id !== id));
      setAccounts(prev => prev.map(acc => {
        if (String(acc.id) === String(entry.accountId)) {
          return { 
            ...acc, 
            balance: entry.type === 'INCOME' ? acc.balance - entry.amount : acc.balance + entry.amount 
          };
        }
        return acc;
      }));
    }
  };

  // 纯粹的状态更新函数，不再负责交互，由子组件调用
  const handleDeleteAccount = (id: string) => {
    setAccounts(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter(a => String(a.id) !== String(id));
    });
  };

  const navItems = [
    { id: 'DASHBOARD', label: '总览', icon: <LayoutDashboard size={18} /> },
    { id: 'LEDGER', label: '记账', icon: <History size={18} /> },
    { id: 'ACCOUNTS', label: '账户', icon: <Wallet size={18} /> },
    { id: 'DEPOSITS', label: '定存', icon: <PiggyBank size={18} /> },
    { id: 'STOCKS', label: '股票', icon: <TrendingUp size={18} /> },
    { id: 'SETTINGS', label: '设置', icon: <Settings size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden transition-all"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Mobile Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 active:scale-90 transition-all border-4 border-white"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full shadow-none'}
      `}>
        <div className="h-full flex flex-col p-5">
          <div className="flex items-center gap-3 px-2 mb-10 mt-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <PiggyBank size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">WealthTrack</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Financial Suite</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveView(item.id as ViewType); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeView === item.id 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto p-5 bg-slate-900 rounded-2xl text-white shadow-xl">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">净资产总额</p>
            <p className="text-xl font-bold truncate">¥ {netWorth.toLocaleString()}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="w-full max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-10 pb-28 md:pb-10">
          {activeView === 'DASHBOARD' && (
            <Dashboard 
              totalAccountBalance={totalAccountBalance}
              totalDeposits={totalDeposits}
              totalStockProfit={totalStockProfit}
              netWorth={netWorth}
              ledger={ledger}
              accounts={accounts}
            />
          )}
          {activeView === 'LEDGER' && (
            <Ledger 
              ledger={ledger} 
              categories={categories} 
              accounts={accounts} 
              onAddEntry={handleAddEntry}
              onDeleteEntry={handleDeleteEntry}
            />
          )}
          {activeView === 'ACCOUNTS' && (
            <AccountsView 
              accounts={accounts} 
              ledger={ledger}
              setAccounts={setAccounts} 
              onDeleteAccount={handleDeleteAccount}
            />
          )}
          {activeView === 'DEPOSITS' && (
            <DepositsView 
              deposits={deposits} 
              setDeposits={setDeposits} 
              accounts={accounts}
              setAccounts={setAccounts}
            />
          )}
          {activeView === 'STOCKS' && (
            <StocksView 
              stocks={stocks} 
              setStocks={setStocks} 
            />
          )}
          {activeView === 'SETTINGS' && (
            <SettingsView 
              categories={categories} 
              setCategories={setCategories} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;

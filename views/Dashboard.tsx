
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { LedgerEntry, Account } from '../types';
import { TrendingUp, TrendingDown, CreditCard, Banknote, Landmark } from 'lucide-react';

interface Props {
  totalAccountBalance: number;
  totalDeposits: number;
  totalStockProfit: number;
  netWorth: number;
  ledger: LedgerEntry[];
  accounts: Account[];
}

const Dashboard: React.FC<Props> = ({ 
  totalAccountBalance, 
  totalDeposits, 
  totalStockProfit, 
  netWorth, 
  ledger,
  accounts 
}) => {
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const spendingData = React.useMemo(() => {
    const map: Record<string, number> = {};
    ledger.filter(e => e.type === 'EXPENSE').forEach(e => {
      map[e.primaryCategory] = (map[e.primaryCategory] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [ledger]);

  const trendData = React.useMemo(() => {
    const dates: string[] = Array.from(new Set<string>(ledger.map(e => e.date.split('T')[0]))).sort().slice(-7);
    return dates.map(date => {
      const dayEntries = ledger.filter(e => e.date.startsWith(date));
      return {
        date: date.slice(5),
        income: dayEntries.filter(e => e.type === 'INCOME').reduce((s, e) => s + e.amount, 0),
        expense: dayEntries.filter(e => e.type === 'EXPENSE').reduce((s, e) => s + e.amount, 0),
      };
    });
  }, [ledger]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">资产总览</h2>
        <p className="text-xs md:text-sm text-slate-500">欢迎回来，您的财富增长一切尽在掌握</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-indigo-600 rounded-2xl md:rounded-3xl p-4 md:p-6 text-white shadow-xl shadow-indigo-100 col-span-2 sm:col-span-1">
          <div className="flex justify-between items-start mb-2 md:mb-4">
            <div className="p-1.5 md:p-2 bg-indigo-500/50 rounded-lg">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-indigo-100 text-[10px] md:text-xs font-bold uppercase tracking-widest">净资产估值</p>
          <p className="text-xl md:text-3xl font-bold mt-0.5 truncate">¥{netWorth.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-2 md:mb-4">
            <div className="p-1.5 md:p-2 bg-slate-50 text-slate-500 rounded-lg">
              <CreditCard size={16} />
            </div>
          </div>
          <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">账户余额</p>
          <p className="text-lg md:text-2xl font-bold text-slate-800 mt-0.5 truncate">¥{totalAccountBalance.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-2 md:mb-4">
            <div className="p-1.5 md:p-2 bg-slate-50 text-slate-500 rounded-lg">
              <Landmark size={16} />
            </div>
          </div>
          <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">定存资产</p>
          <p className="text-lg md:text-2xl font-bold text-slate-800 mt-0.5 truncate">¥{totalDeposits.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-2 md:mb-4">
            <div className={`p-1.5 md:p-2 rounded-lg ${totalStockProfit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <TrendingDown size={16} className={totalStockProfit >= 0 ? 'rotate-180' : ''} />
            </div>
          </div>
          <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">股票盈亏</p>
          <p className={`text-lg md:text-2xl font-bold mt-0.5 truncate ${totalStockProfit >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
            ¥{totalStockProfit.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Spending Analysis */}
        <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 border border-slate-100 shadow-sm">
          <h3 className="text-base md:text-lg font-bold text-slate-800 mb-6">支出分布</h3>
          <div className="h-56 md:h-64">
            {spendingData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {spendingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <p className="text-sm italic">暂无支出数据</p>
              </div>
            )}
          </div>
        </div>

        {/* Cash Flow Trend */}
        <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 border border-slate-100 shadow-sm">
          <h3 className="text-base md:text-lg font-bold text-slate-800 mb-6">收支趋势 (近7日)</h3>
          <div className="h-56 md:h-64">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="收入" />
                  <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="支出" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <p className="text-sm italic">暂无历史数据</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 border border-slate-100 shadow-sm">
        <h3 className="text-base md:text-lg font-bold text-slate-800 mb-6">资产分布</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {accounts.map(acc => (
            <div key={acc.id} className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-white shadow-sm rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xs md:text-sm">
                  {acc.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs md:text-sm font-bold text-slate-800">{acc.name}</p>
                  <p className="text-[9px] md:text-[10px] text-slate-400 font-medium uppercase tracking-tighter">可用资金</p>
                </div>
              </div>
              <p className="text-sm md:text-lg font-bold text-slate-900">¥{acc.balance.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

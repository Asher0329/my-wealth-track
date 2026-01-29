
import React, { useState } from 'react';
import { Account, LedgerEntry } from '../types';
import { Plus, Wallet, Trash2, Pencil, Check, X, AlertTriangle, Info } from 'lucide-react';

interface Props {
  accounts: Account[];
  ledger: LedgerEntry[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  onDeleteAccount: (id: string) => void;
}

const AccountsView: React.FC<Props> = ({ accounts, ledger, setAccounts, onDeleteAccount }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  
  // 删除确认专用状态
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);
  
  // 编辑余额专用状态
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleNumericInput = (val: string, setter: (v: string) => void) => {
    const filtered = val.replace(/[^0-9.]/g, '');
    const parts = filtered.split('.');
    if (parts.length > 2) return;
    setter(filtered);
  };

  const addAccount = () => {
    if (!name.trim()) {
      alert("请输入账户名称");
      return;
    }
    const parsedBalance = parseFloat(balance);
    const newAccount: Account = {
      id: Date.now().toString(),
      name: name.trim(),
      balance: isNaN(parsedBalance) ? 0 : parsedBalance
    };
    
    setAccounts(prev => [...prev, newAccount]);
    
    setName('');
    setBalance('');
    setShowAdd(false);
  };

  const startEditing = (account: Account) => {
    setEditingId(account.id);
    setEditValue(account.balance.toString());
  };

  const saveEdit = () => {
    const newValue = parseFloat(editValue);
    if (isNaN(newValue)) {
      alert("请输入有效的金额");
      return;
    }
    setAccounts(prev => prev.map(a => 
      a.id === editingId ? { ...a, balance: newValue } : a
    ));
    setEditingId(null);
  };

  const confirmDeletion = () => {
    if (deleteTarget) {
      onDeleteAccount(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">资产账户</h2>
          <p className="text-slate-500">管理您的各类虚拟及现实账户</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-700 shadow-lg active:scale-95 transition-transform font-bold"
        >
          <Plus size={18} />
          <span>添加账户</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(acc => {
          const isOnlyOne = accounts.length <= 1;
          return (
            <div key={acc.id} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative group transition-all hover:border-indigo-200">
              {/* 操作按钮区 */}
              <div className="absolute top-4 right-4 flex gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); startEditing(acc); }}
                  className="p-3 text-slate-400 hover:text-indigo-600 transition-colors"
                  title="修改余额"
                >
                  <Pencil size={18} />
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (isOnlyOne) {
                      alert("系统需要至少一个账户来运作，无法删除最后一个账户。");
                    } else {
                      setDeleteTarget(acc); 
                    }
                  }}
                  className={`p-3 transition-colors ${isOnlyOne ? 'text-slate-200 cursor-not-allowed' : 'text-slate-400 hover:text-rose-500'}`}
                  title={isOnlyOne ? "无法删除最后一个账户" : "删除账户"}
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Wallet size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">{acc.name}</h3>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-4">当前可用余额</p>
              
              {editingId === acc.id ? (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">¥</span>
                    <input 
                      type="text"
                      inputMode="decimal"
                      value={editValue}
                      onChange={(e) => handleNumericInput(e.target.value, setEditValue)}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-indigo-200 rounded-lg text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                    />
                  </div>
                  <button onClick={saveEdit} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
                    <Check size={20} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300">
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <p className="text-3xl font-bold text-slate-900 truncate">
                  ¥ {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>
          );
        })}

        {showAdd && (
          <div className="bg-white rounded-3xl p-8 border-2 border-indigo-100 flex flex-col justify-center animate-in fade-in duration-300">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">账户名称</label>
                <input 
                  type="text" 
                  placeholder="如: 支付宝" 
                  autoComplete="off"
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">初始余额</label>
                <input 
                  type="text" 
                  inputMode="decimal"
                  placeholder="0.00" 
                  autoComplete="off"
                  className="w-full p-3 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  value={balance}
                  onChange={e => handleNumericInput(e.target.value, setBalance)}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={addAccount}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all"
                >
                  创建
                </button>
                <button 
                  onClick={() => setShowAdd(false)}
                  className="px-5 bg-slate-50 border border-slate-300 text-slate-500 py-3 rounded-xl hover:bg-slate-100 transition-all"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 自定义删除确认模态框 */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">删除账户？</h3>
              <p className="text-sm text-slate-500 mb-6 px-2">
                您确定要删除账户 <span className="font-bold text-slate-800">[{deleteTarget.name}]</span> 吗？此操作不可撤销。
              </p>
              
              {/* 显示账目关联警告 */}
              {ledger.filter(e => String(e.accountId) === String(deleteTarget.id)).length > 0 && (
                <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-left flex gap-3">
                   <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
                   <p className="text-xs text-amber-700 leading-relaxed">
                     注意：该账户下有关联的账目记录。删除账户后，这些记录将保留但显示为“未知账户”。
                   </p>
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={confirmDeletion}
                  className="flex-1 bg-rose-500 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-rose-100 hover:bg-rose-600 active:scale-95 transition-all"
                >
                  确认删除
                </button>
                <button 
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 bg-slate-100 text-slate-600 py-3.5 rounded-2xl font-bold hover:bg-slate-200 active:scale-95 transition-all"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsView;

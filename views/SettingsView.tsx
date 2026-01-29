
import React, { useState } from 'react';
import { Category } from '../types';
import { Plus, Trash2, FolderOpen, Tags } from 'lucide-react';

interface Props {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

const SettingsView: React.FC<Props> = ({ categories, setCategories }) => {
  const [newPrimary, setNewPrimary] = useState('');
  const [selectedCat, setSelectedCat] = useState<Category | null>(null);
  const [newSecondary, setNewSecondary] = useState('');

  const addPrimary = () => {
    const name = newPrimary.trim();
    if (!name) return;
    if (categories.some(c => c.name === name)) {
      alert("该一级类目已存在");
      return;
    }
    setCategories([...categories, { id: Date.now().toString(), name, subCategories: [] }]);
    setNewPrimary('');
  };

  const addSecondary = () => {
    const subName = newSecondary.trim();
    if (!selectedCat || !subName) return;
    if (selectedCat.subCategories.includes(subName)) {
      alert("该二级类目已存在");
      return;
    }
    setCategories(categories.map(c => {
      if (c.id === selectedCat.id) {
        const updated = { ...c, subCategories: [...c.subCategories, subName] };
        setSelectedCat(updated);
        return updated;
      }
      return c;
    }));
    setNewSecondary('');
  };

  const deletePrimary = (id: string) => {
    if (confirm('确认删除该一级类目及其下所有二级类目吗？这将导致以此类目记账的历史记录显示为已删除。')) {
      setCategories(categories.filter(c => c.id !== id));
      if (selectedCat?.id === id) setSelectedCat(null);
    }
  };

  const deleteSecondary = (catId: string, sub: string) => {
    setCategories(categories.map(c => {
      if (c.id === catId) {
        const updated = { ...c, subCategories: c.subCategories.filter(s => s !== sub) };
        if (selectedCat?.id === catId) setSelectedCat(updated);
        return updated;
      }
      return c;
    }));
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">系统设置</h2>
        <p className="text-slate-500">自定义您的记账类目与偏好</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Primary Categories */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <FolderOpen size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">一级类目</h3>
          </div>

          <div className="space-y-3 mb-6 flex-1 overflow-y-auto max-h-[400px] pr-2">
            {categories.map(cat => (
              <div 
                key={cat.id} 
                onClick={() => setSelectedCat(cat)}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${selectedCat?.id === cat.id ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-50' : 'bg-white border-slate-200 hover:border-slate-300'}`}
              >
                <span className={`text-sm font-semibold ${selectedCat?.id === cat.id ? 'text-indigo-600' : 'text-slate-700'}`}>{cat.name}</span>
                <button onClick={(e) => { e.stopPropagation(); deletePrimary(cat.id); }} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="新一级类目..." 
              autoComplete="off"
              className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={newPrimary}
              onChange={e => setNewPrimary(e.target.value)}
            />
            <button onClick={addPrimary} className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 active:scale-95 transition-all">
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Secondary Categories */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <Tags size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              {selectedCat ? `${selectedCat.name} 的二级类目` : '选择一个一级类目'}
            </h3>
          </div>

          {!selectedCat ? (
            <div className="flex-1 flex items-center justify-center text-slate-300 italic text-sm py-20 border-2 border-dashed border-slate-100 rounded-2xl">
              点击左侧类目以管理二级子类
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-8 min-h-[120px] flex-1 align-start content-start">
                {selectedCat.subCategories.length > 0 ? selectedCat.subCategories.map(sub => (
                  <div key={sub} className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 group hover:border-sky-300 transition-all shadow-sm">
                    <span className="text-sm text-slate-600 font-medium">{sub}</span>
                    <button onClick={() => deleteSecondary(selectedCat.id, sub)} className="text-slate-300 hover:text-rose-500 group-hover:scale-110 transition-transform">
                      <Trash2 size={12} />
                    </button>
                  </div>
                )) : (
                  <p className="text-slate-400 text-sm italic py-4">暂无二级类目</p>
                )}
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder={`添加在 ${selectedCat.name} 下...`}
                  autoComplete="off"
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  value={newSecondary}
                  onChange={e => setNewSecondary(e.target.value)}
                />
                <button onClick={addSecondary} className="p-2.5 bg-sky-600 text-white rounded-xl shadow-md hover:bg-sky-700 active:scale-95 transition-all">
                  <Plus size={20} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;

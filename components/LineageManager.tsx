import React, { useState } from 'react';
import { Lineage } from '../types';
import { COLOR_PALETTES } from '../constants';
import { TrashIcon, PencilSquareIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface LineageManagerProps {
  isOpen: boolean;
  onClose: () => void;
  lineages: Lineage[];
  booksCountByLineage: Record<string, number>;
  onAdd: (l: Lineage) => void;
  onUpdate: (l: Lineage) => void;
  onDelete: (id: string) => void;
}

const LineageManager: React.FC<LineageManagerProps> = ({ 
    isOpen, onClose, lineages, booksCountByLineage, onAdd, onUpdate, onDelete 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Lineage>>({});
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const startEdit = (l: Lineage) => {
    setEditingId(l.id);
    setIsAdding(false);
    setFormData({ ...l });
  };

  const startAdd = () => {
    setEditingId(null);
    setIsAdding(true);
    setFormData({ 
        name: '', 
        colorKey: 'slate', 
        description: '',
        id: Math.random().toString(36).substr(2, 9) 
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.colorKey) return;
    
    if (isAdding) {
        onAdd(formData as Lineage);
    } else {
        onUpdate(formData as Lineage);
    }
    
    // Reset
    setEditingId(null);
    setIsAdding(false);
    setFormData({});
  };

  const renderForm = () => (
      <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 mb-4 animate-fade-in ring-1 ring-stone-200 shadow-inner">
          <div className="space-y-3">
              <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">族系名称 (可直接修改)</label>
                  <input 
                    value={formData.name || ''} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white text-sm border-stone-300 rounded px-2 py-1.5 focus:ring-stone-500 focus:border-stone-500"
                    placeholder="请输入族系名称"
                    autoFocus
                  />
              </div>
              <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">代表色系</label>
                  <div className="flex flex-wrap gap-2">
                      {Object.keys(COLOR_PALETTES).map(key => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setFormData({...formData, colorKey: key})}
                            className={`w-6 h-6 rounded-full border-2 transition-all shadow-sm ${
                                formData.colorKey === key 
                                ? 'border-stone-800 scale-125 ring-2 ring-stone-200' 
                                : 'border-white hover:scale-110'
                            } ${COLOR_PALETTES[key].bg}`}
                            title={key}
                          />
                      ))}
                  </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-xs text-stone-500 px-3 py-1.5 hover:bg-stone-200 rounded">取消</button>
                  <button onClick={handleSave} className="text-xs bg-stone-800 text-white px-3 py-1.5 rounded hover:bg-stone-700 font-medium">保存更改</button>
              </div>
          </div>
      </div>
  );

  return (
    // Z-Index increased to 60 to overlay the Modal (which is usually 50)
    <div className="fixed inset-0 bg-stone-900/60 flex items-center justify-center z-[60] backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[85vh] border border-stone-200 transform transition-all scale-100">
        <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50 rounded-t-xl">
          <div className="flex flex-col">
            <h2 className="text-lg font-serif font-bold text-stone-900">学术族系管理</h2>
            <p className="text-[10px] text-stone-500">在此处增加、删除或重命名族系</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1 rounded-full hover:bg-stone-200/50 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1 bg-white">
            
            {/* List */}
            <div className="space-y-2">
                {lineages.map(lineage => (
                    <div key={lineage.id}>
                        {editingId === lineage.id ? renderForm() : (
                            <div className="flex items-center justify-between p-3 bg-white border border-stone-100 rounded hover:border-stone-300 transition-colors group shadow-sm hover:shadow">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full shadow-sm ${COLOR_PALETTES[lineage.colorKey]?.bg || 'bg-gray-500'}`} />
                                    <div>
                                        <div className="text-sm font-bold text-stone-800">{lineage.name}</div>
                                        <div className="text-[10px] text-stone-400">
                                            关联书籍: {booksCountByLineage[lineage.id] || 0} 本
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => startEdit(lineage)} 
                                        className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors"
                                        title="修改名称或颜色"
                                    >
                                        <PencilSquareIcon className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => onDelete(lineage.id)} 
                                        disabled={(booksCountByLineage[lineage.id] || 0) > 0}
                                        className={`p-1.5 rounded transition-colors ${
                                            (booksCountByLineage[lineage.id] || 0) > 0
                                            ? 'text-stone-200 cursor-not-allowed'
                                            : 'text-stone-400 hover:text-red-600 hover:bg-red-50'
                                        }`}
                                        title={(booksCountByLineage[lineage.id] || 0) > 0 ? "无法删除：该族系下仍有书籍" : "删除族系"}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {isAdding && renderForm()}

            {!isAdding && !editingId && (
                <button 
                    onClick={startAdd}
                    className="w-full mt-4 py-3 border border-dashed border-stone-300 text-stone-500 text-sm rounded hover:border-stone-500 hover:text-stone-700 hover:bg-stone-50 flex items-center justify-center gap-2 transition-all"
                >
                    <PlusIcon className="w-4 h-4" /> 创建新族系 (手动输入)
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default LineageManager;
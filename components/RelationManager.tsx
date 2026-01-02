import React, { useState } from 'react';
import { RelationDef } from '../types';
import { TrashIcon, PencilSquareIcon, PlusIcon, XMarkIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface RelationManagerProps {
  isOpen: boolean;
  onClose: () => void;
  relationDefs: RelationDef[];
  booksCountByRelation: Record<string, number>;
  onAdd: (r: RelationDef) => void;
  onUpdate: (r: RelationDef) => void;
  onDelete: (id: string) => void;
}

const RelationManager: React.FC<RelationManagerProps> = ({ 
    isOpen, onClose, relationDefs, booksCountByRelation, onAdd, onUpdate, onDelete 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<RelationDef>>({});
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const startEdit = (r: RelationDef) => {
    setEditingId(r.id);
    setIsAdding(false);
    setFormData({ ...r });
  };

  const startAdd = () => {
    setEditingId(null);
    setIsAdding(true);
    setFormData({ 
        name: '', 
        style: 'solid',
        id: Math.random().toString(36).substr(2, 9) 
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.style) return;
    
    if (isAdding) {
        onAdd(formData as RelationDef);
    } else {
        onUpdate(formData as RelationDef);
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
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">关系名称</label>
                  <input 
                    value={formData.name || ''} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white text-sm border-stone-300 rounded px-2 py-1.5 focus:ring-stone-500 focus:border-stone-500"
                    placeholder="例如：增补重印"
                    autoFocus
                  />
              </div>
              <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">连线样式 (可视化效果)</label>
                  <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer group bg-white px-3 py-2 rounded border border-stone-200 hover:border-stone-400 transition-all">
                          <input 
                            type="radio" 
                            name="style" 
                            checked={formData.style === 'solid'}
                            onChange={() => setFormData({...formData, style: 'solid'})}
                            className="text-stone-800 focus:ring-stone-500" 
                          />
                          <span className="text-sm text-stone-700 font-medium">实线</span>
                          <div className="w-8 h-0.5 bg-stone-800 ml-2"></div>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group bg-white px-3 py-2 rounded border border-stone-200 hover:border-stone-400 transition-all">
                          <input 
                            type="radio" 
                            name="style" 
                            checked={formData.style === 'none'}
                            onChange={() => setFormData({...formData, style: 'none'})}
                            className="text-stone-800 focus:ring-stone-500" 
                          />
                          <span className="text-sm text-stone-700 font-medium">无线条</span>
                          <div className="w-8 flex justify-center ml-2">
                             <EyeSlashIcon className="w-4 h-4 text-stone-400" />
                          </div>
                      </label>
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
    // Z-Index increased to 60 to overlay the Modal
    <div className="fixed inset-0 bg-stone-900/60 flex items-center justify-center z-[60] backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[85vh] border border-stone-200 transform transition-all scale-100">
        <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50 rounded-t-xl">
          <div className="flex flex-col">
            <h2 className="text-lg font-serif font-bold text-stone-900">关系类型管理</h2>
            <p className="text-[10px] text-stone-500">定义父子节点之间的继承或参考关系</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1 rounded-full hover:bg-stone-200/50 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1 bg-white">
            
            {/* List */}
            <div className="space-y-2">
                {relationDefs.map(def => (
                    <div key={def.id}>
                        {editingId === def.id ? renderForm() : (
                            <div className="flex items-center justify-between p-3 bg-white border border-stone-100 rounded hover:border-stone-300 transition-colors group shadow-sm hover:shadow">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-8 flex justify-center items-center"
                                        title={def.style === 'solid' ? '实线' : '无线条 (隐式关系)'}
                                    >
                                        {def.style === 'solid' ? (
                                            <div className="w-full h-0.5 bg-stone-800" />
                                        ) : (
                                            <EyeSlashIcon className="w-4 h-4 text-stone-300" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-stone-800">{def.name}</div>
                                        <div className="text-[10px] text-stone-400">
                                            使用次数: {booksCountByRelation[def.id] || 0}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => startEdit(def)} 
                                        className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded transition-colors"
                                        title="修改"
                                    >
                                        <PencilSquareIcon className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => onDelete(def.id)} 
                                        disabled={(booksCountByRelation[def.id] || 0) > 0}
                                        className={`p-1.5 rounded transition-colors ${
                                            (booksCountByRelation[def.id] || 0) > 0
                                            ? 'text-stone-200 cursor-not-allowed'
                                            : 'text-stone-400 hover:text-red-600 hover:bg-red-50'
                                        }`}
                                        title={(booksCountByRelation[def.id] || 0) > 0 ? "无法删除：该类型正被使用" : "删除"}
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
                    <PlusIcon className="w-4 h-4" /> 新增关系类型
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default RelationManager;
import React, { useState, useEffect, useRef } from 'react';
import { Lineage, Generation } from '../types';
import { COLOR_PALETTES } from '../constants';
import { TrashIcon, PencilSquareIcon, PlusIcon, XMarkIcon, ListBulletIcon, Bars3Icon, CheckIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';

interface LineageManagerProps {
  isOpen: boolean;
  onClose: () => void;
  lineages: Lineage[];
  booksCountByLineage: Record<string, number>;
  onAdd: (l: Lineage) => void;
  onUpdate: (l: Lineage) => void;
  onDelete: (id: string) => void;
  onReorder: (newLineages: Lineage[]) => void;
}

const LineageManager: React.FC<LineageManagerProps> = ({ 
    isOpen, onClose, lineages, booksCountByLineage, onAdd, onUpdate, onDelete, onReorder
}) => {
  // Use local state for drag operations to prevent parent re-renders from killing the drag event
  const [localLineages, setLocalLineages] = useState<Lineage[]>(lineages);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Lineage>>({});
  const [isAdding, setIsAdding] = useState(false);
  
  // Drag State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Sync props to local state when not dragging
  useEffect(() => {
      if (draggedIndex === null) {
          setLocalLineages(lineages);
      }
  }, [lineages, draggedIndex]);

  if (!isOpen) return null;

  // --- Optimized Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = index;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Important: styling needed to indicate drag
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    dragOverItem.current = index;
    
    if (dragItem.current === null || dragItem.current === index) return;
    
    // Reorder locally
    const newList = [...localLineages];
    const draggedItemContent = newList[dragItem.current];
    newList.splice(dragItem.current, 1);
    newList.splice(index, 0, draggedItemContent);
    
    // Update ref pointers to match new positions
    dragItem.current = index;
    setLocalLineages(newList);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
      setDraggedIndex(null);
      dragItem.current = null;
      dragOverItem.current = null;
      // Commit changes to parent
      onReorder(localLineages);
  };

  // --- Form Handlers ---
  const startEdit = (l: Lineage) => {
    setEditingId(l.id);
    setIsAdding(false);
    setFormData({ ...l, generations: l.generations || [] });
  };

  const startAdd = () => {
    setEditingId(null);
    setIsAdding(true);
    setFormData({ 
        name: '', 
        colorKey: 'slate', 
        description: '',
        id: Math.random().toString(36).substr(2, 9),
        generations: [] 
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.colorKey) {
        alert("请填写族系名称并选择颜色");
        return;
    }
    
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

  // --- Sequential Generation Logic ---
  const handleAddNextGeneration = () => {
      const currentGens = formData.generations || [];
      const nextNum = currentGens.length + 1;
      
      const newGen: Generation = {
          id: Math.random().toString(36).substr(2, 9),
          name: `第 ${nextNum} 代`
      };
      
      setFormData(prev => ({
          ...prev,
          generations: [...(prev.generations || []), newGen]
      }));
  };

  const handleDeleteLastGeneration = () => {
      const currentGens = formData.generations || [];
      if (currentGens.length === 0) return;
      
      setFormData(prev => ({
          ...prev,
          generations: currentGens.slice(0, -1) // Remove last one to keep sequence
      }));
  };

  // Form Render Helper
  const isFormVisible = isAdding || editingId !== null;

  return (
    <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center z-[60] backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white w-full max-w-md flex flex-col max-h-[85vh] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
        
        {/* Header */}
        <div className="p-4 border-b-2 border-black flex justify-between items-center bg-stone-100">
          <div className="flex flex-col">
            <h2 className="text-lg font-serif font-bold text-black tracking-tight">学术族系谱系管理</h2>
            <p className="text-[10px] text-stone-600 font-mono mt-0.5 uppercase tracking-wider">Lineage Configuration</p>
          </div>
          <button onClick={onClose} className="text-black hover:bg-black hover:text-white p-1 transition-colors border border-transparent hover:border-black">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto flex-1 bg-white">
            
            {/* List of Lineages */}
            <div className="space-y-3">
                {localLineages.map((lineage, index) => {
                    const isEditingThis = editingId === lineage.id;

                    if (isEditingThis) {
                        return (
                             <div key={lineage.id} className="border-2 border-black p-4 bg-stone-50 space-y-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                                <div>
                                    <label className="block text-xs font-bold text-black uppercase mb-1">族系名称</label>
                                    <input 
                                        value={formData.name || ''} 
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-white text-sm border-2 border-black px-3 py-2 focus:outline-none focus:bg-yellow-50 font-serif font-bold"
                                        placeholder="例如：苏俄译介系"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-black uppercase mb-2">代表色谱</label>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.keys(COLOR_PALETTES).map(key => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setFormData({...formData, colorKey: key})}
                                                className={`w-6 h-6 border-2 transition-all ${
                                                    formData.colorKey === key 
                                                    ? 'border-black ring-1 ring-black scale-110' 
                                                    : 'border-transparent hover:scale-110'
                                                } ${COLOR_PALETTES[key].bg}`}
                                                title={key}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Automatic Generation Manager */}
                                <div className="bg-white border-2 border-black p-3">
                                    <label className="block text-xs font-bold text-black uppercase mb-2 flex items-center gap-1">
                                        <ListBulletIcon className="w-4 h-4" /> 族系分代结构
                                    </label>
                                    
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {formData.generations?.length === 0 && (
                                            <span className="text-xs text-stone-400 italic py-1">暂无分代</span>
                                        )}
                                        {formData.generations?.map((gen, idx) => (
                                            <div key={gen.id} className="px-2 py-1 bg-stone-100 border border-black text-xs font-bold font-mono">
                                                {gen.name}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <button 
                                            type="button"
                                            onClick={handleAddNextGeneration}
                                            className="flex-1 py-2 bg-black text-white text-xs font-bold hover:bg-stone-800 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <PlusIcon className="w-3 h-3" />
                                            添加：第 {(formData.generations?.length || 0) + 1} 代
                                        </button>
                                        
                                        <button 
                                            type="button"
                                            onClick={handleDeleteLastGeneration}
                                            disabled={!formData.generations || formData.generations.length === 0}
                                            className="px-3 py-2 border-2 border-black text-xs font-bold hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            title="撤销最后一代"
                                        >
                                            <ArrowUturnLeftIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t border-stone-200 mt-2">
                                    <button onClick={() => { setEditingId(null); setFormData({}); }} className="text-xs font-bold text-stone-500 px-4 py-2 hover:bg-stone-200 border border-transparent">取消</button>
                                    <button onClick={handleSave} className="text-xs font-bold bg-black text-white px-4 py-2 hover:bg-stone-800 flex items-center gap-1">
                                        <CheckIcon className="w-4 h-4" /> 保存
                                    </button>
                                </div>
                             </div>
                        );
                    }

                    return (
                        <div 
                            key={lineage.id}
                            draggable={!isFormVisible} 
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()} // Essential to allow drop
                            className={`flex items-center justify-between p-3 border-b border-stone-200 bg-white hover:bg-stone-50 transition-colors group cursor-grab active:cursor-grabbing ${draggedIndex === index ? 'opacity-30 border-dashed border-black bg-stone-100' : 'opacity-100'}`}
                        >
                            <div className="flex items-center gap-4 flex-1 pointer-events-none">
                                <div className="text-stone-300 group-hover:text-black p-1">
                                    <Bars3Icon className="w-5 h-5" />
                                </div>
                                
                                <div className={`w-4 h-4 border border-black ${COLOR_PALETTES[lineage.colorKey]?.bg || 'bg-gray-500'}`} />
                                
                                <div>
                                    <div className="font-serif font-bold text-black text-base">{lineage.name}</div>
                                    <div className="flex gap-2 text-[10px] text-stone-500 font-mono mt-0.5">
                                        <span className="bg-stone-100 px-1 border border-stone-200">
                                            {lineage.generations ? lineage.generations.length : 0} GENERATIONS
                                        </span>
                                        {booksCountByLineage[lineage.id] > 0 && (
                                             <span className="bg-stone-100 px-1 border border-stone-200">
                                                {booksCountByLineage[lineage.id]} BOOKS
                                             </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); startEdit(lineage); }} 
                                    disabled={isFormVisible}
                                    className="p-2 text-stone-400 hover:text-black hover:bg-stone-100 border border-transparent hover:border-stone-200"
                                >
                                    <PencilSquareIcon className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDelete(lineage.id); }} 
                                    disabled={isFormVisible || (booksCountByLineage[lineage.id] || 0) > 0}
                                    className={`p-2 border border-transparent ${
                                        (booksCountByLineage[lineage.id] || 0) > 0
                                        ? 'text-stone-200 cursor-not-allowed'
                                        : 'text-stone-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100'
                                    }`}
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add New Section */}
            {isAdding && (
                 <div className="border-2 border-black p-4 bg-stone-50 space-y-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] mt-4">
                    <div>
                        <label className="block text-xs font-bold text-black uppercase mb-1">新族系名称</label>
                        <input 
                            value={formData.name || ''} 
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-white text-sm border-2 border-black px-3 py-2 focus:outline-none focus:bg-yellow-50 font-serif font-bold"
                            placeholder="例如：新文化运动系"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-black uppercase mb-2">代表色谱</label>
                        <div className="flex flex-wrap gap-2">
                            {Object.keys(COLOR_PALETTES).map(key => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setFormData({...formData, colorKey: key})}
                                    className={`w-6 h-6 border-2 transition-all ${
                                        formData.colorKey === key 
                                        ? 'border-black ring-1 ring-black scale-110' 
                                        : 'border-transparent hover:scale-110'
                                    } ${COLOR_PALETTES[key].bg}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Automatic Generation Manager for New Lineage */}
                    <div className="bg-white border-2 border-black p-3">
                        <label className="block text-xs font-bold text-black uppercase mb-2 flex items-center gap-1">
                            <ListBulletIcon className="w-4 h-4" /> 族系分代结构
                        </label>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                            {(!formData.generations || formData.generations.length === 0) && (
                                <span className="text-xs text-stone-400 italic py-1">暂无分代</span>
                            )}
                            {formData.generations?.map((gen, idx) => (
                                <div key={gen.id} className="px-2 py-1 bg-stone-100 border border-black text-xs font-bold font-mono">
                                    {gen.name}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <button 
                                type="button"
                                onClick={handleAddNextGeneration}
                                className="flex-1 py-2 bg-black text-white text-xs font-bold hover:bg-stone-800 transition-colors flex items-center justify-center gap-1"
                            >
                                <PlusIcon className="w-3 h-3" />
                                添加：第 {(formData.generations?.length || 0) + 1} 代
                            </button>
                            
                            <button 
                                type="button"
                                onClick={handleDeleteLastGeneration}
                                disabled={!formData.generations || formData.generations.length === 0}
                                className="px-3 py-2 border-2 border-black text-xs font-bold hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ArrowUturnLeftIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-stone-200 mt-2">
                        <button onClick={() => { setIsAdding(false); setFormData({}); }} className="text-xs font-bold text-stone-500 px-4 py-2 hover:bg-stone-200 border border-transparent">取消</button>
                        <button onClick={handleSave} className="text-xs font-bold bg-black text-white px-4 py-2 hover:bg-stone-800 flex items-center gap-1">
                            <CheckIcon className="w-4 h-4" /> 创建
                        </button>
                    </div>
                 </div>
            )}

            {!isAdding && !editingId && (
                <button 
                    onClick={startAdd}
                    className="w-full mt-6 py-4 border-2 border-dashed border-stone-300 text-stone-500 font-bold text-sm hover:border-black hover:text-black hover:bg-stone-50 flex items-center justify-center gap-2 transition-all uppercase tracking-widest"
                >
                    <PlusIcon className="w-5 h-5" /> 创建新族系 / CREATE NEW LINEAGE
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default LineageManager;
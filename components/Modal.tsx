import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Book, Lineage, RelationDef } from '../types';
import { Cog6ToothIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (book: Book) => void;
  initialData?: Book | null;
  allBooks: Book[];
  lineages: Lineage[];
  relationDefs: RelationDef[];
  onManageLineages: () => void;
  onManageRelations: () => void;
}

const Modal: React.FC<ModalProps> = ({ 
    isOpen, onClose, onSave, initialData, allBooks, lineages, relationDefs, 
    onManageLineages, onManageRelations 
}) => {
  const [formData, setFormData] = useState<Partial<Book>>({
    title: '',
    year: new Date().getFullYear(),
    publisher: '',
    lineageId: '',
    generationId: '',
    parentId: '',
    relationId: '',
    description: '',
    tocUrl: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived state: Get generations for currently selected lineage
  const currentLineage = useMemo(() => 
    lineages.find(l => l.id === formData.lineageId), 
    [lineages, formData.lineageId]
  );

  // Only reset form when modal opens or switch between add/edit modes.
  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                title: '',
                year: new Date().getFullYear(),
                publisher: '',
                // Use current props for defaults
                lineageId: lineages[0]?.id || '',
                generationId: '',
                parentId: '',
                relationId: relationDefs[0]?.id || '',
                description: '',
                tocUrl: '',
                id: Math.random().toString(36).substr(2, 9)
            });
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]); 

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Explicit Validation with Alerts
    const missingFields: string[] = [];
    if (!formData.title) missingFields.push("书名");
    if (!formData.year) missingFields.push("出版年份");
    if (!formData.publisher) missingFields.push("出版社");
    
    if (missingFields.length > 0) {
        alert(`无法保存，请完善以下必填信息：\n${missingFields.join('、')}`);
        return;
    }

    if (!formData.lineageId) {
        alert("无法保存：请选择【所属族系】。\n\n如果您尚未创建任何族系，请点击下拉框旁边的“齿轮”图标进行添加。");
        return;
    }

    if (!formData.relationId) {
        alert("无法保存：请选择【与底本关系】。\n\n例如“直接翻印”或“增补参考”。如果选项为空，请点击下拉框旁边的“齿轮”图标进行添加。");
        return;
    }

    // All checks passed
    onSave(formData as Book);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          // Size check (e.g. 500KB limit to protect localStorage)
          if (file.size > 500 * 1024) {
              alert("图片大小超过 500KB。为了防止浏览器缓存溢出，建议使用图片链接，或先压缩图片。");
              return;
          }

          const reader = new FileReader();
          reader.onloadend = () => {
              setFormData({ ...formData, tocUrl: reader.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] border border-stone-200">
        <div className="p-6 border-b border-stone-100 flex justify-between items-center">
          <h2 className="text-xl font-serif font-bold text-stone-900">
            {initialData ? '编辑文献档案' : '录入新文献'}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form id="bookForm" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">书名 <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="请输入完整书名"
                className="w-full bg-white rounded-md border border-stone-300 px-3 py-2 text-stone-900 placeholder-stone-400 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-shadow"
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">出版年份 <span className="text-red-500">*</span></label>
                <input
                  required
                  type="number"
                  value={formData.year}
                  onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
                  className="w-full bg-white rounded-md border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-shadow"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">出版社 <span className="text-red-500">*</span></label>
                <input
                  required
                  type="text"
                  value={formData.publisher}
                  onChange={e => setFormData({...formData, publisher: e.target.value})}
                  className="w-full bg-white rounded-md border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-shadow"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">所属族系 <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <select
                        required
                        value={formData.lineageId}
                        onChange={e => setFormData({
                            ...formData, 
                            lineageId: e.target.value,
                            generationId: '' // Reset generation when lineage changes
                        })}
                        className={`w-full rounded-md border px-3 py-2 text-stone-900 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 bg-white appearance-none ${!formData.lineageId ? 'border-red-300' : 'border-stone-300'}`}
                        >
                        {lineages.length === 0 && <option value="">(空) 请先添加族系 →</option>}
                        {lineages.length > 0 && <option value="">请选择...</option>}
                        {lineages.map(l => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-500">
                             <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                    
                    <button
                        type="button"
                        onClick={onManageLineages}
                        className="px-3 py-2 bg-stone-100 border border-stone-200 rounded-md text-stone-600 hover:bg-stone-200 hover:text-stone-900 transition-colors flex items-center justify-center group"
                        title="增加、删除或修改族系"
                    >
                        <Cog6ToothIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                    </button>
                </div>
              </div>

              {/* Generation (Sub-Lineage) Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">族系分代 (可选)</label>
                <div className="relative">
                    <select
                        value={formData.generationId || ''}
                        onChange={e => setFormData({...formData, generationId: e.target.value || null})}
                        disabled={!currentLineage || !currentLineage.generations?.length}
                        className="w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 bg-white appearance-none disabled:bg-stone-100 disabled:text-stone-400"
                    >
                        <option value="">(无分代)</option>
                        {currentLineage?.generations?.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-500">
                         <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
                 <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">与底本关系 <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <select
                            required
                            value={formData.relationId}
                            onChange={e => setFormData({...formData, relationId: e.target.value})}
                            className={`w-full rounded-md border px-3 py-2 text-stone-900 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 bg-white appearance-none ${!formData.relationId ? 'border-red-300' : 'border-stone-300'}`}
                            >
                            {relationDefs.length === 0 && <option value="">(空) 请先添加关系 →</option>}
                            {relationDefs.length > 0 && <option value="">请选择...</option>}
                            {relationDefs.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-500">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                        
                        <button
                            type="button"
                            onClick={onManageRelations}
                            className="px-3 py-2 bg-stone-100 border border-stone-200 rounded-md text-stone-600 hover:bg-stone-200 hover:text-stone-900 transition-colors flex items-center justify-center group"
                            title="增加、删除或修改关系类型"
                        >
                            <Cog6ToothIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">底本来源 (父节点)</label>
                    <select
                        value={formData.parentId || ''}
                        onChange={e => setFormData({...formData, parentId: e.target.value || null})}
                        className="w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 bg-white"
                    >
                        <option value="">(无 - 设为该族系开创者)</option>
                        {allBooks
                        .filter(b => b.id !== formData.id) // Prevent self-reference
                        .sort((a,b) => a.year - b.year)
                        .map(book => (
                        <option key={book.id} value={book.id}>
                            {book.year} - {book.title}
                        </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table of Contents Image Upload */}
            <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">目录页 / 封面图</label>
                <div className="space-y-2">
                    {/* URL Input */}
                    <input
                        type="text"
                        value={formData.tocUrl || ''}
                        onChange={e => setFormData({...formData, tocUrl: e.target.value})}
                        placeholder="粘贴图片链接 (URL)"
                        className="w-full bg-white rounded-md border border-stone-300 px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-shadow"
                    />
                    
                    {/* File Upload & Preview */}
                    <div className="flex gap-4 items-start">
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-3 py-2 bg-stone-50 border border-stone-200 rounded hover:bg-stone-100 text-xs text-stone-600 transition-colors"
                        >
                            <PhotoIcon className="w-4 h-4" /> 选择本地图片
                        </button>
                        <input 
                            type="file" 
                            accept="image/*" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                        />
                        
                        {formData.tocUrl && (
                            <div className="relative group">
                                <div className="h-16 w-16 border border-stone-200 rounded overflow-hidden bg-stone-100">
                                    <img 
                                        src={formData.tocUrl} 
                                        alt="Preview" 
                                        className="h-full w-full object-cover" 
                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({...formData, tocUrl: ''})}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <XMarkIcon className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                        <span className="text-[10px] text-stone-400 pt-2">
                            推荐使用链接。本地上传请小于500KB。
                        </span>
                    </div>
                </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">学术备注</label>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="关于该版本的学术价值、删改情况或历史背景的简要说明..."
                className="w-full bg-white rounded-md border border-stone-300 px-3 py-2 text-stone-900 placeholder-stone-400 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-shadow resize-none"
              />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-stone-100 bg-stone-50 rounded-b-xl flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-600 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 hover:text-stone-800 transition-colors shadow-sm"
          >
            取消
          </button>
          <button
            type="submit"
            form="bookForm"
            className="px-4 py-2 text-sm font-medium text-white bg-stone-800 rounded-lg hover:bg-stone-900 shadow-md transition-all hover:shadow-lg"
          >
            保存档案
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
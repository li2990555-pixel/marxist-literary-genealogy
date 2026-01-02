import React, { useState, useEffect } from 'react';
import { Book, Lineage, RelationDef } from '../types';
import { Cog6ToothIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

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
    parentId: '',
    relationId: '',
    description: ''
  });

  // Only reset form when modal opens or switch between add/edit modes.
  // We explicitly exclude 'lineages' and 'relationDefs' from dependencies to prevent
  // form reset when user adds/modifies lineages while keeping the book modal open.
  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                title: '',
                year: new Date().getFullYear(),
                publisher: '',
                // Use current props for defaults, but don't track them in dependency array
                lineageId: lineages[0]?.id || '',
                parentId: '',
                relationId: relationDefs[0]?.id || '',
                description: '',
                id: Math.random().toString(36).substr(2, 9)
            });
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData]); 

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.year && formData.publisher && formData.lineageId && formData.relationId) {
      onSave(formData as Book);
      onClose();
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
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">书名</label>
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
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">出版年份</label>
                <input
                  required
                  type="number"
                  value={formData.year}
                  onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
                  className="w-full bg-white rounded-md border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-shadow"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">出版社</label>
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
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">所属族系</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <select
                        required
                        value={formData.lineageId}
                        onChange={e => setFormData({...formData, lineageId: e.target.value})}
                        className="w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 bg-white appearance-none"
                        >
                        {lineages.length === 0 && <option value="">请先添加族系</option>}
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
              <div>
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">与底本关系</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <select
                        required
                        value={formData.relationId}
                        onChange={e => setFormData({...formData, relationId: e.target.value})}
                        className="w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 bg-white appearance-none"
                        >
                        {relationDefs.length === 0 && <option value="">请先添加关系</option>}
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
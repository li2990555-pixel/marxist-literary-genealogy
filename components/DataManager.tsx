import React, { useRef } from 'react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, TrashIcon, XMarkIcon, ArchiveBoxIcon, TableCellsIcon } from '@heroicons/react/24/outline';

interface DataManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
  onExportExcel: () => void;
}

const DataManager: React.FC<DataManagerProps> = ({ 
    isOpen, onClose, onExport, onImport, onReset, onExportExcel
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImport(e.target.files[0]);
    }
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 flex items-center justify-center z-[70] backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50 flex-none">
          <div className="flex items-center gap-2">
            <div className="bg-stone-200 p-1.5 rounded-md">
                <ArchiveBoxIcon className="w-5 h-5 text-stone-700" />
            </div>
            <div>
                <h2 className="text-lg font-serif font-bold text-stone-900">数据与发表</h2>
                <p className="text-[10px] text-stone-500">导出表格 · 备份数据 · 迁移</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1 rounded-full hover:bg-stone-200/50 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-8 bg-white overflow-y-auto flex-1">
            
            {/* Section 1: Publication Export */}
            <div>
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1 h-3 bg-stone-400 rounded-full"></span>
                    成果发表 (导出)
                </h3>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={onExportExcel}
                        className="flex items-center gap-4 p-4 bg-white border border-stone-200 rounded-xl hover:border-stone-800 hover:shadow-lg transition-all group text-left"
                    >
                        <div className="p-3 bg-stone-50 rounded-full group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <TableCellsIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="font-bold text-stone-800 text-sm">下载 Excel 表格 (.xlsx)</div>
                            <div className="text-[10px] text-stone-500 mt-1">包含所有书籍、族系及底本关系元数据</div>
                        </div>
                    </button>
                </div>
            </div>

            <hr className="border-stone-100" />

            {/* Section 2: System Backup */}
            <div>
                 <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1 h-3 bg-stone-400 rounded-full"></span>
                    系统备份与恢复
                </h3>
                
                <div className="space-y-3">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-start gap-3 mb-4">
                        <div className="mt-0.5 text-emerald-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-emerald-800">自动保存已开启</h3>
                            <p className="text-[10px] text-emerald-600 leading-tight">数据实时保存在浏览器中。</p>
                        </div>
                    </div>

                    {/* JSON Export */}
                    <button 
                        onClick={onExport}
                        className="w-full flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-lg hover:bg-white hover:border-stone-400 transition-all group text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-white rounded-md border border-stone-200 group-hover:border-stone-300">
                                <ArrowDownTrayIcon className="w-4 h-4 text-stone-500" />
                            </div>
                            <div>
                                <div className="font-bold text-stone-700 text-xs">备份原始数据 (.json)</div>
                            </div>
                        </div>
                    </button>

                    {/* JSON Import */}
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-lg hover:bg-white hover:border-stone-400 transition-all group text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-white rounded-md border border-stone-200 group-hover:border-stone-300">
                                <ArrowUpTrayIcon className="w-4 h-4 text-stone-500" />
                            </div>
                            <div>
                                <div className="font-bold text-stone-700 text-xs">恢复数据备份</div>
                            </div>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept=".json" 
                            className="hidden" 
                        />
                    </button>
                </div>
            </div>

             {/* Danger Zone */}
             <div className="pt-4 mt-2 border-t border-stone-100">
                 <button 
                    onClick={() => {
                        if(window.confirm('确定要清空所有数据并重置为初始状态吗？此操作不可撤销！')) {
                            onReset();
                        }
                    }}
                    className="flex items-center gap-2 text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                    <TrashIcon className="w-4 h-4" /> 清空并重置应用
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DataManager;
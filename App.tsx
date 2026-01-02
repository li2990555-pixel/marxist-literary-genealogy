import React, { useState, useMemo, useEffect } from 'react';
import { Book, Lineage, RelationDef } from './types';
import { INITIAL_BOOKS, INITIAL_LINEAGES, INITIAL_RELATION_DEFS } from './constants';
import GenealogyView from './components/GenealogyView';
import TableView from './components/TableView';
import Modal from './components/Modal';
import LineageManager from './components/LineageManager';
import RelationManager from './components/RelationManager';
import DataManager from './components/DataManager';
import { PlusIcon, TableCellsIcon, ShareIcon, SwatchIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
// @ts-ignore
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'marxist_genealogy_data_v1';

const App: React.FC = () => {
  // --- Data Initialization (Load from LocalStorage or use Constants) ---
  const loadInitialData = () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        return {
          books: parsed.data.books || INITIAL_BOOKS,
          lineages: parsed.data.lineages || INITIAL_LINEAGES,
          relationDefs: parsed.data.relationDefs || INITIAL_RELATION_DEFS
        };
      }
    } catch (e) {
      console.error("Failed to load local data", e);
    }
    return {
      books: INITIAL_BOOKS,
      lineages: INITIAL_LINEAGES,
      relationDefs: INITIAL_RELATION_DEFS
    };
  };

  const initialData = loadInitialData();

  // Data State
  const [books, setBooks] = useState<Book[]>(initialData.books);
  const [lineages, setLineages] = useState<Lineage[]>(initialData.lineages);
  const [relationDefs, setRelationDefs] = useState<RelationDef[]>(initialData.relationDefs);
  
  // UI State
  const [viewMode, setViewMode] = useState<'graph' | 'table'>('graph');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLineageManagerOpen, setIsLineageManagerOpen] = useState(false);
  const [isRelationManagerOpen, setIsRelationManagerOpen] = useState(false);
  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // --- Auto-Save Effect ---
  useEffect(() => {
    const dataToSave = {
      meta: {
        version: "1.0",
        updatedAt: new Date().toISOString(),
        appName: "Marxist Literary Genealogy"
      },
      data: {
        books,
        lineages,
        relationDefs
      }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [books, lineages, relationDefs]);

  // --- Import/Export Logic ---
  const handleExportData = () => {
    const dataToExport = {
      meta: {
        version: "1.0",
        exportDate: new Date().toISOString(),
        appName: "Marxist Literary Genealogy"
      },
      data: { books, lineages, relationDefs }
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `genealogy-backup-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.data && Array.isArray(json.data.books)) {
           // Basic validation passed
           setBooks(json.data.books);
           setLineages(json.data.lineages || []);
           setRelationDefs(json.data.relationDefs || []);
           setIsDataManagerOpen(false);
           alert('数据导入成功！');
        } else {
            alert('文件格式错误：无法识别的数据结构。');
        }
      } catch (error) {
        alert('文件解析失败：不是有效的 JSON 文件。');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setBooks(INITIAL_BOOKS);
    setLineages(INITIAL_LINEAGES);
    setRelationDefs(INITIAL_RELATION_DEFS);
    setIsDataManagerOpen(false);
  };

  // 2. Export Excel
  const handleExportExcel = () => {
      // Flatten data for Excel
      const excelData = books.map(book => {
        const lineage = lineages.find(l => l.id === book.lineageId);
        const parent = books.find(b => b.id === book.parentId);
        const relation = relationDefs.find(r => r.id === book.relationId);
    
        return {
          "ID": book.id,
          "年份": book.year,
          "书名": book.title,
          "出版社": book.publisher,
          "所属族系": lineage ? lineage.name : '未知',
          "底本来源": parent ? parent.title : '(族长/源头)',
          "底本关系": relation ? relation.name : '-',
          "学术备注": book.description || ''
        };
      });

      // Sort by Year
      excelData.sort((a, b) => a.年份 - b.年份);

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "文献谱系表");
      
      try {
          XLSX.writeFile(wb, `marxist-genealogy-data-${new Date().toISOString().split('T')[0]}.xlsx`);
      } catch (err) {
          console.error('Excel export failed', err);
          alert('Excel 导出失败。');
      }
  };

  // Helper: Count books per lineage for safety checks
  const booksCountByLineage = useMemo(() => {
      const counts: Record<string, number> = {};
      books.forEach(b => {
          counts[b.lineageId] = (counts[b.lineageId] || 0) + 1;
      });
      return counts;
  }, [books]);

  // Helper: Count books per relation for safety checks
  const booksCountByRelation = useMemo(() => {
    const counts: Record<string, number> = {};
    books.forEach(b => {
        if (b.relationId) {
            counts[b.relationId] = (counts[b.relationId] || 0) + 1;
        }
    });
    return counts;
  }, [books]);

  // --- Book Handlers ---
  const handleAddBook = () => {
    setEditingBook(null);
    setIsModalOpen(true);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setIsModalOpen(true);
  };

  const handleDeleteBook = (id: string) => {
    setBooks(prev => {
      const remainingBooks = prev.filter(b => b.id !== id);
      return remainingBooks.map(b => {
        if (b.parentId === id) {
          return { ...b, parentId: null };
        }
        return b;
      });
    });
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  const handleSaveBook = (book: Book) => {
    if (editingBook) {
      setBooks(prev => prev.map(b => b.id === book.id ? book : b));
    } else {
      setBooks(prev => [...prev, book]);
    }
  };

  // --- Lineage Handlers ---
  const handleAddLineage = (lineage: Lineage) => {
      setLineages(prev => [...prev, lineage]);
  };

  const handleUpdateLineage = (lineage: Lineage) => {
      setLineages(prev => prev.map(l => l.id === lineage.id ? lineage : l));
  };

  const handleDeleteLineage = (id: string) => {
      if (booksCountByLineage[id] && booksCountByLineage[id] > 0) {
          alert('无法删除：该族系下仍有书籍数据。请先删除或迁移相关书籍。');
          return;
      }
      setLineages(prev => prev.filter(l => l.id !== id));
  };

  // --- Relation Handlers ---
  const handleAddRelation = (rel: RelationDef) => {
    setRelationDefs(prev => [...prev, rel]);
  };

  const handleUpdateRelation = (rel: RelationDef) => {
    setRelationDefs(prev => prev.map(r => r.id === rel.id ? rel : r));
  };

  const handleDeleteRelation = (id: string) => {
    if (booksCountByRelation[id] && booksCountByRelation[id] > 0) {
        alert('无法删除：该关系类型正被使用。');
        return;
    }
    setRelationDefs(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="h-screen w-screen bg-stone-100 text-stone-800 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 flex-none z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
              马克思主义文艺论著选本族谱图
            </h1>
            <span className="text-xs text-stone-500 uppercase tracking-widest">Genealogy of Marxist Literary Anthologies</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
               onClick={() => setIsDataManagerOpen(true)}
               className="text-stone-500 hover:text-stone-800 hover:bg-stone-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 border border-transparent hover:border-stone-200"
               title="数据备份与发表"
            >
                <ArchiveBoxIcon className="w-4 h-4" /> 数据与发表
            </button>

            <button
               onClick={() => setIsLineageManagerOpen(true)}
               className="text-stone-500 hover:text-stone-800 hover:bg-stone-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 border border-transparent hover:border-stone-200"
            >
                <SwatchIcon className="w-4 h-4" /> 管理族系
            </button>

            <div className="h-6 w-px bg-stone-200 mx-1"></div>

            <div className="bg-stone-100 p-1 rounded-lg flex gap-1">
              <button
                onClick={() => setViewMode('graph')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'graph' 
                    ? 'bg-white text-stone-800 shadow-sm' 
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <ShareIcon className="w-4 h-4" /> 谱系视图
                </span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'table' 
                    ? 'bg-white text-stone-800 shadow-sm' 
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <TableCellsIcon className="w-4 h-4" /> 数据表格
                </span>
              </button>
            </div>

            <button
              onClick={handleAddBook}
              className="bg-stone-800 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-stone-700 transition-colors shadow-sm"
            >
              <PlusIcon className="w-4 h-4" />
              添加节点
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col min-h-0">
        {viewMode === 'graph' ? (
          <div className="flex-1 flex flex-col min-h-0">
             <div className="mb-4 text-sm text-stone-500 flex justify-between items-center flex-none">
                <p>点击节点高亮其家族遗传链。横轴为时间线，纵轴为族系。</p>
                {selectedNodeId && (
                    <button 
                        onClick={() => setSelectedNodeId(null)}
                        className="text-stone-400 hover:text-stone-600 underline"
                    >
                        清除高亮
                    </button>
                )}
             </div>
             <div className="flex-1 border border-stone-200 rounded-xl overflow-hidden shadow-sm bg-stone-50 relative min-h-[500px]">
                 <GenealogyView 
                    books={books} 
                    lineages={lineages}
                    relationDefs={relationDefs}
                    onNodeClick={setSelectedNodeId}
                    selectedNodeId={selectedNodeId}
                 />
             </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <TableView 
                data={books} 
                lineages={lineages}
                relationDefs={relationDefs}
                onEdit={handleEditBook} 
                onDelete={handleDeleteBook} 
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-4 flex-none">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-stone-400">
          <p>© 2023 Digital Humanities Lab. 数据仅供学术演示。</p>
        </div>
      </footer>

      {/* Modals */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBook}
        initialData={editingBook}
        allBooks={books}
        lineages={lineages}
        relationDefs={relationDefs}
        onManageLineages={() => setIsLineageManagerOpen(true)}
        onManageRelations={() => setIsRelationManagerOpen(true)}
      />

      <LineageManager 
         isOpen={isLineageManagerOpen}
         onClose={() => setIsLineageManagerOpen(false)}
         lineages={lineages}
         booksCountByLineage={booksCountByLineage}
         onAdd={handleAddLineage}
         onUpdate={handleUpdateLineage}
         onDelete={handleDeleteLineage}
      />

      <RelationManager
         isOpen={isRelationManagerOpen}
         onClose={() => setIsRelationManagerOpen(false)}
         relationDefs={relationDefs}
         booksCountByRelation={booksCountByRelation}
         onAdd={handleAddRelation}
         onUpdate={handleUpdateRelation}
         onDelete={handleDeleteRelation}
      />

      <DataManager
        isOpen={isDataManagerOpen}
        onClose={() => setIsDataManagerOpen(false)}
        onExport={handleExportData}
        onImport={handleImportData}
        onReset={handleResetData}
        onExportExcel={handleExportExcel}
      />
    </div>
  );
};

export default App;
import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  GroupingState,
  ExpandedState,
} from '@tanstack/react-table';
import { Book, Lineage, RelationDef } from '../types';
import { COLOR_PALETTES } from '../constants';
import { 
  PencilSquareIcon, 
  TrashIcon, 
  MagnifyingGlassIcon, 
  ChevronRightIcon, 
  ChevronDownIcon,
  RectangleGroupIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface TableViewProps {
  data: Book[];
  lineages: Lineage[];
  relationDefs: RelationDef[];
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
}

const TableView: React.FC<TableViewProps> = ({ data, lineages, relationDefs, onEdit, onDelete }) => {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'year', desc: false }]);
  const [globalFilter, setGlobalFilter] = useState('');
  // Grouping & Expansion State
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  // Lookups
  const lineageMap = useMemo(() => {
    return lineages.reduce((acc, l) => {
        acc[l.id] = l;
        return acc;
    }, {} as Record<string, Lineage>);
  }, [lineages]);

  const relationMap = useMemo(() => {
    return relationDefs.reduce((acc, r) => {
        acc[r.id] = r;
        return acc;
    }, {} as Record<string, RelationDef>);
  }, [relationDefs]);

  const bookTitleMap = useMemo(() => {
      return data.reduce((acc, b) => {
          acc[b.id] = b.title;
          return acc;
      }, {} as Record<string, string>);
  }, [data]);

  const columnHelper = createColumnHelper<Book>();

  const columns = useMemo(() => [
    columnHelper.accessor('year', {
      header: '年份',
      enableGrouping: true,
      cell: info => <span className="font-mono text-stone-600 font-medium select-all">{info.getValue()}</span>,
    }),
    columnHelper.accessor('title', {
      header: '书名',
      enableGrouping: false, // Usually don't group by title unless exact duplicates
      cell: info => <span className="font-serif font-bold text-stone-800 text-base">{info.getValue()}</span>,
    }),
    columnHelper.accessor('publisher', {
      header: '出版社',
      enableGrouping: true,
      cell: info => <span className="text-stone-600">{info.getValue()}</span>,
    }),
    columnHelper.accessor('lineageId', {
      header: '族系',
      enableGrouping: true,
      cell: info => {
        const val = info.getValue();
        if (!val) return null;
        const lineage = lineageMap[val];
        const style = lineage ? COLOR_PALETTES[lineage.colorKey] : COLOR_PALETTES['stone'];
        const label = lineage ? lineage.name : '未知族系';
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style?.badge || ''}`}>
            {label}
          </span>
        );
      },
    }),
    columnHelper.accessor('parentId', {
      header: '底本来源',
      enableGrouping: true,
      cell: info => {
        const parentId = info.getValue();
        // If grouped, we don't render the usual cell here, the group header handles it. 
        // But for leaf rows:
        const parent = data.find(d => d.id === parentId);
        
        if (!parent) return <span className="text-xs text-stone-400 italic bg-stone-50 px-2 py-1 rounded inline-block">★ 族长/源头</span>;

        const relation = relationMap[info.row.original.relationId];
        const relationName = relation ? relation.name : '未知关系';

        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs text-stone-400">{parent.year}</span>
                <span className="text-xs font-serif text-stone-700 font-medium truncate max-w-[120px]" title={parent.title}>{parent.title}</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mt-0.5 ml-0.5">
                ↳ {relationName}
            </span>
          </div>
        );
      }
    }),
    columnHelper.accessor('description', {
        header: '备注',
        enableGrouping: false,
        cell: info => (
            <div className="text-xs text-stone-500 max-w-[200px] truncate" title={info.getValue() || ''}>
                {info.getValue() || <span className="text-stone-300">-</span>}
            </div>
        )
    }),
    columnHelper.display({
      id: 'actions',
      header: '操作',
      enableGrouping: false,
      cell: info => (
        <div className="flex gap-2 justify-end">
          <button 
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(info.row.original);
            }}
            className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-200 rounded-lg transition-all"
            title="编辑详情"
          >
            <PencilSquareIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(info.row.original.id);
            }}
            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="删除档案 (慎点)"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      )
    })
  ], [data, lineageMap, relationMap, bookTitleMap, onEdit, onDelete]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      grouping,
      expanded,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  // Toggle helper
  const toggleGrouping = (field: string) => {
      setGrouping(prev => {
          if (prev.includes(field)) {
              return prev.filter(f => f !== field);
          } else {
              // Optional: Clear others if we only want one level of grouping for simplicity
              // return [field]; 
              return [...prev, field]; // Allow multi-level
          }
      });
  };

  // Helper to render readable group headers
  const renderGroupHeader = (columnId: string, value: any) => {
      if (columnId === 'lineageId') {
          const l = lineageMap[value];
          return l ? l.name : '未知族系';
      }
      if (columnId === 'parentId') {
          if (!value) return '★ 族长/源头 (无上级)';
          return bookTitleMap[value] ? `源于：${bookTitleMap[value]}` : '未知来源';
      }
      if (columnId === 'year') {
          return `${value} 年`;
      }
      return value; // Publisher and others
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-3 rounded-lg border border-stone-200 shadow-sm flex-none">
        
        {/* Search */}
        <div className="relative w-full max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-stone-400" />
            </div>
            <input
                type="text"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="全表搜索..."
                className="block w-full pl-10 pr-3 py-1.5 border border-stone-200 rounded-md leading-5 bg-stone-50 placeholder-stone-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-stone-500 focus:border-stone-500 sm:text-sm transition-colors"
            />
        </div>

        {/* Grouping Controls */}
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                <RectangleGroupIcon className="w-4 h-4" /> 分组模式:
            </span>
            {[
                { id: 'year', label: '年份' },
                { id: 'publisher', label: '出版社' },
                { id: 'lineageId', label: '族系' },
                { id: 'parentId', label: '底本来源' }
            ].map(g => {
                const isActive = grouping.includes(g.id);
                return (
                    <button
                        key={g.id}
                        onClick={() => toggleGrouping(g.id)}
                        className={`px-3 py-1 text-xs rounded-full border transition-all ${
                            isActive 
                            ? 'bg-stone-800 text-white border-stone-800 shadow-md' 
                            : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                        }`}
                    >
                        {g.label}
                        {isActive && <XMarkIcon className="w-3 h-3 inline ml-1 opacity-70" />}
                    </button>
                );
            })}
            {grouping.length > 0 && (
                <button 
                    onClick={() => setGrouping([])}
                    className="text-xs text-stone-400 hover:text-stone-600 underline ml-2"
                >
                    重置
                </button>
            )}
        </div>
      </div>

      {/* Table */}
      <div className="w-full bg-white border border-stone-200 shadow-sm rounded-lg overflow-hidden flex-1 relative flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 z-10 shadow-sm">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-stone-50 border-b border-stone-200 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="p-4 bg-stone-50 cursor-pointer hover:bg-stone-100 transition-colors select-none group whitespace-nowrap" onClick={header.column.getToggleSortingHandler()}>
                      <div className="flex items-center gap-1">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                            <span className="text-stone-300 group-hover:text-stone-500 transition-colors">
                            {{
                                asc: ' ↑',
                                desc: ' ↓',
                            }[header.column.getIsSorted() as string] ?? ' ↕'}
                            </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-stone-100">
              {table.getRowModel().rows.length === 0 ? (
                  <tr>
                      <td colSpan={columns.length} className="p-8 text-center text-stone-400">
                          暂无数据或未找到匹配项
                      </td>
                  </tr>
              ) : (
                table.getRowModel().rows.map(row => {
                    return (
                        <tr key={row.id} className={`transition-colors ${row.getIsGrouped() ? 'bg-stone-100/50' : 'hover:bg-stone-50/80 bg-white'}`}>
                        {row.getVisibleCells().map(cell => {
                            if (cell.getIsGrouped()) {
                                return (
                                    <td key={cell.id} colSpan={row.getVisibleCells().length} className="p-3 bg-stone-100 border-b border-stone-200">
                                        <button
                                            {...{
                                                onClick: row.getToggleExpandedHandler(),
                                                style: {
                                                    cursor: 'pointer',
                                                },
                                            }}
                                            className="flex items-center gap-2 font-serif font-bold text-stone-800 text-sm hover:text-stone-600 transition-colors"
                                        >
                                            <div className="w-5 h-5 flex items-center justify-center bg-white border border-stone-300 rounded text-stone-500 shadow-sm">
                                                {row.getIsExpanded() ? (
                                                    <ChevronDownIcon className="w-3 h-3" />
                                                ) : (
                                                    <ChevronRightIcon className="w-3 h-3" />
                                                )}
                                            </div>
                                            
                                            <span>
                                                {renderGroupHeader(cell.column.id, cell.getValue())} 
                                            </span>
                                            <span className="text-xs font-sans font-normal text-stone-400 bg-white px-2 py-0.5 rounded-full border border-stone-200">
                                                {row.subRows.length} 本
                                            </span>
                                        </button>
                                    </td>
                                );
                            }

                            if (cell.getIsAggregated()) {
                                return null; // We don't render aggregated cells in this layout
                            }

                            if (cell.getIsPlaceholder()) {
                                return <td key={cell.id} className="p-0 border-none bg-stone-100/50" />; 
                            }

                            return (
                                <td key={cell.id} className="p-4 text-sm text-stone-700 whitespace-nowrap border-b border-stone-50">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            );
                        })}
                        </tr>
                    );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="p-2 border-t border-stone-200 bg-stone-50 text-xs text-stone-400 flex justify-between items-center flex-none">
            <div>共 {table.getFilteredRowModel().rows.length} 条记录</div>
            {grouping.length > 0 && <div>当前分组: {grouping.map(g => 
                g === 'year' ? '年份' : g === 'publisher' ? '出版社' : g === 'lineageId' ? '族系' : '底本'
            ).join(' > ')}</div>}
        </div>
      </div>
    </div>
  );
};

export default TableView;
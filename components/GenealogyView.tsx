import React, { useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Position,
  Handle,
  MarkerType,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  NodeProps,
  ReactFlowInstance,
  BackgroundVariant,
} from 'reactflow';
import { Book, Lineage, RelationDef } from '../types';
import { COLOR_PALETTES } from '../constants';

// --- Node 1: Book Card ---
const CustomBookNode = ({ data }: NodeProps) => {
  const { book, lineage, isRoot, isHighlighted, isDimmed } = data;
  const colors = lineage ? COLOR_PALETTES[lineage.colorKey] : COLOR_PALETTES['stone'];

  let containerClass = `px-3 py-2 rounded shadow-sm border transition-all duration-300 w-[180px] cursor-grab active:cursor-grabbing `;
  
  if (isHighlighted) {
    containerClass += `${colors.bg} ${colors.border} shadow-lg ring-2 ring-offset-2 ring-stone-400 z-50`;
  } else if (isDimmed) {
    containerClass += `bg-white border-stone-200 opacity-30 grayscale`;
  } else {
    containerClass += `bg-white border-stone-300 hover:border-stone-500 hover:shadow-md`;
  }

  return (
    <div className={containerClass}>
      <Handle type="target" position={Position.Left} className="!bg-stone-400 !w-1 !h-1" />
      
      <div className="flex flex-col h-full justify-between">
        <div className="flex justify-between items-start mb-1">
            <span className={`text-xs font-mono font-bold ${isHighlighted ? 'text-white/80' : 'text-stone-500'}`}>
                {book.year}
            </span>
            {isRoot && (
                <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1 rounded border border-yellow-200">
                    族长
                </span>
            )}
        </div>
        
        <div className={`font-serif text-sm font-bold leading-tight mb-1 ${isHighlighted ? 'text-white' : 'text-stone-800'}`}>
          {book.title}
        </div>
        
        <div className={`text-[10px] truncate ${isHighlighted ? 'text-white/70' : 'text-stone-500'}`}>
          {book.publisher}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-stone-400 !w-1 !h-1" />
    </div>
  );
};

// --- Node 2: Timeline Tick (The Axis) ---
const TimelineTickNode = ({ data }: NodeProps) => {
  return (
    <div className="flex flex-col items-center select-none pointer-events-none w-0 overflow-visible">
        {/* Vertical Guide Line */}
        <div className="w-px h-[2000px] bg-stone-300 border-r border-dashed border-stone-300 absolute bottom-6 opacity-20"></div>
        
        {/* Tick Mark on the Axis */}
        <div className="w-px h-3 bg-stone-500 mb-1"></div>
        
        {/* Year Label */}
        <div className="text-xs font-mono font-bold text-stone-600">
            {data.year}
        </div>
    </div>
  );
};

// --- Node 3: Swimlane Background ---
const SwimlaneNode = ({ data }: NodeProps) => {
    const colors = COLOR_PALETTES[data.colorKey] || COLOR_PALETTES['stone'];
    return (
        <div className={`w-full h-full flex items-start pt-4 pl-4 border-t border-b ${colors.laneBg} ${colors.laneBorder}`}>
             <div className="writing-mode-vertical text-xs font-bold uppercase tracking-[0.2em] text-stone-400/80 sticky left-4 top-4">
                {data.label}
             </div>
        </div>
    );
};

const nodeTypes = {
  bookNode: CustomBookNode,
  timelineTick: TimelineTickNode,
  swimlane: SwimlaneNode
};

interface GenealogyViewProps {
  books: Book[];
  lineages: Lineage[];
  relationDefs: RelationDef[];
  onNodeClick: (nodeId: string | null) => void;
  selectedNodeId: string | null;
}

const GenealogyView: React.FC<GenealogyViewProps> = ({ books, lineages, relationDefs, onNodeClick, selectedNodeId }) => {
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Memoize maps
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

  const descendantsSet = useMemo(() => {
    const set = new Set<string>();
    if (!selectedNodeId) return set;
    const findChildren = (id: string) => {
      books.forEach(b => {
        if (b.parentId === id) {
          set.add(b.id);
          findChildren(b.id);
        }
      });
    };
    set.add(selectedNodeId);
    findChildren(selectedNodeId);
    return set;
  }, [books, selectedNodeId]);

  // Layout Calculation
  useEffect(() => {
    if (books.length === 0 && lineages.length === 0) {
        setNodes([]);
        setEdges([]);
        return;
    }

    const years = books.length > 0 ? books.map(b => b.year) : [1940, 2020];
    const minBookYear = Math.min(...years);
    const maxBookYear = Math.max(...years);

    // Timeline Conf - More Compact (35px per year)
    const PIXELS_PER_YEAR = 35; 
    const startDecade = Math.floor(minBookYear / 10) * 10;
    const endDecade = Math.ceil((maxBookYear + 5) / 10) * 10;
    const totalWidth = (endDecade - startDecade) * PIXELS_PER_YEAR + 400; 
    
    const getX = (year: number) => (year - startDecade) * PIXELS_PER_YEAR + 150; 
    
    // Dynamic Swimlane Conf
    const LANE_HEIGHT = 450;
    
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    // --- A. Generate Swimlanes based on Lineages ---
    lineages.forEach((lineage, index) => {
        const topY = index * LANE_HEIGHT;
        flowNodes.push({
            id: `lane-${lineage.id}`,
            type: 'swimlane',
            position: { x: -200, y: topY },
            data: { 
                label: lineage.name, 
                colorKey: lineage.colorKey 
            },
            style: { width: totalWidth + 400, height: LANE_HEIGHT },
            zIndex: -10,
            selectable: false,
            draggable: false,
        });
    });

    // --- B. Timeline Axis ---
    const AXIS_Y = lineages.length * LANE_HEIGHT + 50; // Position below all lanes
    
    for (let y = startDecade; y <= endDecade; y += 10) {
      flowNodes.push({
        id: `tick-${y}`,
        type: 'timelineTick',
        position: { x: getX(y), y: AXIS_Y }, 
        data: { year: y },
        zIndex: -5,
        selectable: false,
        draggable: false,
      });
    }

    // --- C. Book Nodes ---
    const positionMap: Record<string, number> = {}; 

    books.forEach((book) => {
      const lineageIndex = lineages.findIndex(l => l.id === book.lineageId);
      // Fallback if lineage deleted but book exists
      const safeIndex = lineageIndex === -1 ? 0 : lineageIndex; 
      
      const baseY = (safeIndex * LANE_HEIGHT) + 80; // Top padding inside lane
        
      const key = `${book.year}-${book.lineageId}`;
      const verticalShift = (positionMap[key] || 0) * 110; // Tighter vertical stacking
      positionMap[key] = (positionMap[key] || 0) + 1;

      const finalX = getX(book.year);
      const finalY = baseY + verticalShift;

      const isHighlighted = descendantsSet.has(book.id);
      const isDimmed = selectedNodeId !== null && !isHighlighted;

      flowNodes.push({
        id: book.id,
        type: 'bookNode',
        position: { x: finalX, y: finalY },
        data: { 
          book, 
          lineage: lineageMap[book.lineageId],
          isRoot: book.parentId === null,
          isHighlighted, 
          isDimmed 
        },
      });

      if (book.parentId) {
        // Look up relation definition
        const relationDef = relationMap[book.relationId];
        const isSolid = relationDef ? relationDef.style === 'solid' : true; // Default to solid if missing
        const isEdgeHighlighted = descendantsSet.has(book.parentId) && descendantsSet.has(book.id);

        flowEdges.push({
          id: `e-${book.parentId}-${book.id}`,
          source: book.parentId,
          target: book.id,
          type: 'smoothstep', 
          animated: !isSolid, // Animate dashed lines
          style: {
            stroke: isEdgeHighlighted ? '#44403c' : '#d6d3d1', 
            strokeWidth: isSolid ? 3 : 1.5,
            strokeDasharray: isSolid ? '0' : '4,4',
            opacity: (selectedNodeId && !isEdgeHighlighted) ? 0.2 : 1,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isEdgeHighlighted ? '#44403c' : '#d6d3d1',
          },
        });
      }
    });

    // --- D. Axis Line ---
    flowNodes.push({
        id: 'axis-line',
        type: 'default',
        position: { x: -200, y: AXIS_Y },
        data: { label: '' },
        style: { 
            width: totalWidth + 400, 
            height: 2, 
            backgroundColor: '#78716c', 
            border: 'none',
            borderRadius: 0,
            padding: 0
        },
        draggable: false,
        selectable: false,
        zIndex: -4
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
    
    // Fit view with delay to ensure nodes are rendered
    if (rfInstance) {
        setTimeout(() => rfInstance.fitView({ padding: 0.1, duration: 800 }), 100);
    }
  }, [books, lineages, relationDefs]); 

  // Selection Effect without layout reset
  useEffect(() => {
      setNodes((nds) => nds.map((node) => {
          if (node.type !== 'bookNode') return node;
          
          const isHighlighted = descendantsSet.has(node.id);
          const isDimmed = selectedNodeId !== null && !isHighlighted;
          
          if (node.data.isHighlighted === isHighlighted && node.data.isDimmed === isDimmed) {
              return node;
          }
          
          return {
              ...node,
              data: {
                  ...node.data,
                  isHighlighted,
                  isDimmed
              }
          };
      }));

      setEdges((eds) => eds.map((edge) => {
           const isHighlighted = descendantsSet.has(edge.source) && descendantsSet.has(edge.target);
           
           return { 
               ...edge, 
               style: { 
                   ...edge.style, 
                   stroke: isHighlighted ? '#44403c' : '#d6d3d1',
                   opacity: (selectedNodeId && !isHighlighted) ? 0.2 : 1,
               },
               markerEnd: {
                 type: MarkerType.ArrowClosed,
                 color: isHighlighted ? '#44403c' : '#d6d3d1',
               },
            };
      }));
  }, [selectedNodeId, descendantsSet]);

  return (
    <div id="genealogy-graph-root" className="w-full h-full relative bg-stone-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => {
            if (node.type === 'bookNode') onNodeClick(node.id);
        }}
        onPaneClick={() => onNodeClick(null)}
        onInit={setRfInstance}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        nodesDraggable={true} 
        attributionPosition="bottom-right"
        minZoom={0.05} // Increased zoom out capability to fit all
        maxZoom={1.5}
      >
        <Background color="#a8a29e" gap={40} size={1} variant={BackgroundVariant.Dots} className="opacity-10" />
        <Controls className="bg-white border-stone-200 shadow-sm" />
      </ReactFlow>

      {/* Dynamic Legend */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur p-4 rounded shadow-sm border border-stone-200 z-10 pointer-events-none max-h-[80vh] overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">谱系图例</h3>
          <div className="space-y-2 text-xs">
             {lineages.map(l => (
                 <div key={l.id} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-sm ${COLOR_PALETTES[l.colorKey]?.bg || 'bg-gray-500'}`}></div>
                    <span className="text-stone-600 font-medium">{l.name}</span>
                 </div>
             ))}
             
             <div className="h-px bg-stone-100 my-2"></div>
             
             {/* Relation Legend (Dynamic) */}
             {relationDefs.map(r => (
                 <div key={r.id} className="flex items-center gap-2">
                    <div className={`w-8 h-[2px] ${r.style === 'solid' ? 'bg-stone-400' : 'border-t border-dashed border-stone-400'}`}></div>
                    <span className="text-stone-500">{r.name}</span>
                 </div>
             ))}
          </div>
      </div>
    </div>
  );
};

export default GenealogyView;
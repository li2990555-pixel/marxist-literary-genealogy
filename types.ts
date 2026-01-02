
// Dynamic Lineage Definition
export interface Lineage {
  id: string;
  name: string;
  colorKey: string; // References a palette key (e.g., 'stone', 'red', 'blue')
  description?: string;
}

// New: Dynamic Relation Definition
export type RelationStyle = 'solid' | 'dashed';

export interface RelationDef {
  id: string;
  name: string;
  style: RelationStyle; // Determines how the edge is drawn
  description?: string;
}

export interface Book {
  id: string;
  title: string;
  year: number;
  publisher: string;
  lineageId: string; // Referencing Lineage.id
  parentId: string | null;
  relationId: string; // Changed from enum RelationType to referencing RelationDef.id
  description?: string;
}

// For React Flow
export interface GenealogyNodeData {
  label: string;
  book: Book;
  lineage?: Lineage;
  relationDef?: RelationDef; // Pass relation definition for edge styling context if needed
  isRoot: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
}

export interface SwimlaneData {
    label: string;
    colorKey: string;
}


// Dynamic Lineage Definition
export interface Generation {
  id: string;
  name: string; // e.g. "第一代", "延安时期", "建国初期"
}

export interface Lineage {
  id: string;
  name: string;
  colorKey: string; // References a palette key (e.g., 'stone', 'red', 'blue')
  description?: string;
  generations: Generation[]; // New: List of sub-lineages/generations
}

// New: Dynamic Relation Definition
export type RelationStyle = 'solid' | 'none'; // Changed 'dashed' to 'none'

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
  generationId?: string | null; // New: Referencing Generation.id within that lineage
  parentId: string | null;
  relationId: string; // Changed from enum RelationType to referencing RelationDef.id
  description?: string;
  tocUrl?: string; // New: Table of Contents Image URL or Base64
}

// For React Flow
export interface GenealogyNodeData {
  label: string;
  book: Book;
  lineage?: Lineage;
  generation?: Generation; // Pass generation info
  relationDef?: RelationDef; // Pass relation definition for edge styling context if needed
  isRoot: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
}

export interface SwimlaneData {
    label: string;
    colorKey: string;
}
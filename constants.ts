import { Book, Lineage, RelationDef } from './types';

// Vivid Color Palettes for distinct, bright visualization
// Backgrounds are chosen to be vivid (500/600) but readable with white text when highlighted.
// Lane backgrounds are very light to keep the UI clean.
export const COLOR_PALETTES: Record<string, { bg: string, border: string, text: string, laneBg: string, laneBorder: string, badge: string }> = {
  vermilion: {
    bg: 'bg-red-500', border: 'border-red-400', text: 'text-white',
    laneBg: 'bg-red-50', laneBorder: 'border-red-100', badge: 'bg-red-50 text-red-700 border-red-200'
  },
  orange: {
    bg: 'bg-orange-500', border: 'border-orange-400', text: 'text-white',
    laneBg: 'bg-orange-50', laneBorder: 'border-orange-100', badge: 'bg-orange-50 text-orange-700 border-orange-200'
  },
  amber: {
    bg: 'bg-amber-500', border: 'border-amber-400', text: 'text-white',
    laneBg: 'bg-amber-50', laneBorder: 'border-amber-100', badge: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  emerald: {
    bg: 'bg-emerald-500', border: 'border-emerald-400', text: 'text-white',
    laneBg: 'bg-emerald-50', laneBorder: 'border-emerald-100', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  teal: {
    bg: 'bg-teal-500', border: 'border-teal-400', text: 'text-white',
    laneBg: 'bg-teal-50', laneBorder: 'border-teal-100', badge: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  cyan: {
    bg: 'bg-cyan-600', border: 'border-cyan-400', text: 'text-white',
    laneBg: 'bg-cyan-50', laneBorder: 'border-cyan-100', badge: 'bg-cyan-50 text-cyan-700 border-cyan-200'
  },
  blue: {
    bg: 'bg-blue-500', border: 'border-blue-400', text: 'text-white',
    laneBg: 'bg-blue-50', laneBorder: 'border-blue-100', badge: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  indigo: {
    bg: 'bg-indigo-500', border: 'border-indigo-400', text: 'text-white',
    laneBg: 'bg-indigo-50', laneBorder: 'border-indigo-100', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  violet: {
    bg: 'bg-violet-500', border: 'border-violet-400', text: 'text-white',
    laneBg: 'bg-violet-50', laneBorder: 'border-violet-100', badge: 'bg-violet-50 text-violet-700 border-violet-200'
  },
  fuchsia: {
    bg: 'bg-fuchsia-500', border: 'border-fuchsia-400', text: 'text-white',
    laneBg: 'bg-fuchsia-50', laneBorder: 'border-fuchsia-100', badge: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200'
  },
  rose: {
    bg: 'bg-rose-500', border: 'border-rose-400', text: 'text-white',
    laneBg: 'bg-rose-50', laneBorder: 'border-rose-100', badge: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  slate: {
    bg: 'bg-slate-600', border: 'border-slate-400', text: 'text-white',
    laneBg: 'bg-slate-100', laneBorder: 'border-slate-200', badge: 'bg-slate-100 text-slate-700 border-slate-200'
  }
};

export const INITIAL_LINEAGES: Lineage[] = [];

// Default relations are now empty as requested
export const INITIAL_RELATION_DEFS: RelationDef[] = [];

export const INITIAL_BOOKS: Book[] = [];
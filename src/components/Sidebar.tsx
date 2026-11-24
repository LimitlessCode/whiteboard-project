import React from 'react';
import {
  MousePointer,
  Pencil,
  Paintbrush,
  Highlighter,
  Eraser,
  Square,
  Circle as CircleIcon,
  Minus,
  ArrowRight,
  Type,
  StickyNote,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { ToolType } from '../types';

interface SidebarProps {
  currentTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  onImageUploadClick: () => void;
}

const TOOLS: { id: ToolType; label: string; icon: React.ReactNode; shortcut: string }[] = [
  { id: 'select', label: 'Select & Move', icon: <MousePointer className="w-5 h-5" />, shortcut: 'V' },
  { id: 'pencil', label: 'Pencil', icon: <Pencil className="w-5 h-5" />, shortcut: 'P' },
  { id: 'brush', label: 'Smooth Brush', icon: <Paintbrush className="w-5 h-5" />, shortcut: 'B' },
  { id: 'highlighter', label: 'Highlighter', icon: <Highlighter className="w-5 h-5" />, shortcut: 'H' },
  { id: 'eraser', label: 'Eraser', icon: <Eraser className="w-5 h-5" />, shortcut: 'E' },
  { id: 'rectangle', label: 'Rectangle', icon: <Square className="w-5 h-5" />, shortcut: 'R' },
  { id: 'circle', label: 'Circle', icon: <CircleIcon className="w-5 h-5" />, shortcut: 'C' },
  { id: 'line', label: 'Line', icon: <Minus className="w-5 h-5" />, shortcut: 'L' },
  { id: 'arrow', label: 'Arrow', icon: <ArrowRight className="w-5 h-5" />, shortcut: 'A' },
  { id: 'text', label: 'Text', icon: <Type className="w-5 h-5" />, shortcut: 'T' },
  { id: 'sticky', label: 'Sticky Note', icon: <StickyNote className="w-5 h-5" />, shortcut: 'S' },
  { id: 'image', label: 'Insert Image', icon: <ImageIcon className="w-5 h-5" />, shortcut: 'I' },
  { id: 'laser', label: 'Laser Pointer', icon: <Sparkles className="w-5 h-5" />, shortcut: 'X' },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentTool, onSelectTool, onImageUploadClick }) => {
  return (
    <aside className="absolute left-4 top-20 flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-30 gap-1.5 transition-all">
      {TOOLS.map((tool) => {
        const isActive = currentTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => {
              if (tool.id === 'image') {
                onImageUploadClick();
              } else {
                onSelectTool(tool.id);
              }
            }}
            title={`${tool.label} (${tool.shortcut})`}
            className={`relative group flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
              isActive
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-105'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tool.icon}
            {/* Tooltip */}
            <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 flex items-center gap-2">
              <span>{tool.label}</span>
              <kbd className="px-1.5 py-0.5 bg-slate-800 dark:bg-slate-700 text-[10px] rounded text-slate-300">
                {tool.shortcut}
              </kbd>
            </div>
          </button>
        );
      })}
    </aside>
  );
};

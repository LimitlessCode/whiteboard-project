import React from 'react';
import { X, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'V', desc: 'Select & Move tool' },
  { key: 'P', desc: 'Pencil tool' },
  { key: 'B', desc: 'Smooth brush' },
  { key: 'H', desc: 'Highlighter' },
  { key: 'E', desc: 'Eraser tool' },
  { key: 'R', desc: 'Rectangle shape' },
  { key: 'C', desc: 'Circle shape' },
  { key: 'L', desc: 'Line tool' },
  { key: 'A', desc: 'Arrow tool' },
  { key: 'T', desc: 'Text tool' },
  { key: 'S', desc: 'Sticky note' },
  { key: 'I', desc: 'Insert image' },
  { key: 'Ctrl + Z', desc: 'Undo' },
  { key: 'Ctrl + Y', desc: 'Redo' },
  { key: 'Space + Drag', desc: 'Pan canvas' },
  { key: 'Scroll', desc: 'Zoom in / out' },
  { key: 'Del / Backspace', desc: 'Delete selected element' },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Command className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Keyboard Shortcuts</h2>
              <p className="text-xs text-slate-500">Speed up your workflow with quick keys</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
          {SHORTCUTS.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800"
            >
              <span className="text-xs text-slate-600 dark:text-slate-300">{item.desc}</span>
              <kbd className="px-2 py-1 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-xs font-mono rounded shadow-sm border border-slate-200 dark:border-slate-600">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

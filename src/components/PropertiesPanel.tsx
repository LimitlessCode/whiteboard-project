import React from 'react';
import { WhiteboardElement } from '../types';
import { Trash2, Copy, Layers } from 'lucide-react';

interface PropertiesPanelProps {
  selectedElement: WhiteboardElement | null;
  onUpdateElement: (el: WhiteboardElement) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (el: WhiteboardElement) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
}) => {
  if (!selectedElement) return null;

  return (
    <div className="absolute right-4 top-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl p-4 z-30 w-72 flex flex-col gap-4 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Properties ({selectedElement.type})
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDuplicateElement(selectedElement)}
            title="Duplicate"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteElement(selectedElement.id)}
            title="Delete"
            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Color */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Stroke Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={selectedElement.color}
            onChange={(e) => onUpdateElement({ ...selectedElement, color: e.target.value })}
            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
          />
          <span className="text-xs font-mono text-slate-700 dark:text-slate-300 uppercase">
            {selectedElement.color}
          </span>
        </div>
      </div>

      {/* Stroke Width */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Stroke Width</label>
          <span className="text-xs font-mono text-slate-500">{selectedElement.strokeWidth}px</span>
        </div>
        <input
          type="range"
          min="1"
          max="36"
          value={selectedElement.strokeWidth}
          onChange={(e) => onUpdateElement({ ...selectedElement, strokeWidth: Number(e.target.value) })}
          className="w-full accent-indigo-600 cursor-pointer"
        />
      </div>

      {/* Text / Sticky Note content editor */}
      {(selectedElement.type === 'text' || selectedElement.type === 'sticky') && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Content</label>
          <textarea
            value={selectedElement.text || ''}
            onChange={(e) => onUpdateElement({ ...selectedElement, text: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 resize-none"
          />
        </div>
      )}

      {/* Sticky Note background color */}
      {selectedElement.type === 'sticky' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Sticky Color</label>
          <div className="flex items-center gap-2">
            {['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#fed7aa'].map((bg) => (
              <button
                key={bg}
                onClick={() => onUpdateElement({ ...selectedElement, backgroundColor: bg })}
                className={`w-7 h-7 rounded-lg border transition-transform ${
                  selectedElement.backgroundColor === bg ? 'ring-2 ring-indigo-600 scale-110' : 'border-slate-300'
                }`}
                style={{ backgroundColor: bg }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

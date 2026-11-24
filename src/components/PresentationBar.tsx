import React from 'react';
import { Minimize2 } from 'lucide-react';

interface PresentationBarProps {
  onExitPresentation: () => void;
  boardTitle: string;
}

export const PresentationBar: React.FC<PresentationBarProps> = ({ onExitPresentation, boardTitle }) => {
  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-full px-6 py-2.5 shadow-2xl flex items-center gap-6 z-50 text-white animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-semibold tracking-wide uppercase text-slate-300">Presentation Mode</span>
      </div>
      <div className="h-4 w-[1px] bg-slate-700" />
      <span className="text-sm font-medium text-white max-w-[200px] truncate">{boardTitle}</span>
      <button
        onClick={onExitPresentation}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-xs font-medium transition-colors"
      >
        <Minimize2 className="w-3.5 h-3.5" />
        <span>Exit</span>
      </button>
    </div>
  );
};

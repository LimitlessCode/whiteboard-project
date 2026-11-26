import React, { useState } from 'react';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  FolderOpen,
  Grid,
  Trash2,
  Palette,
  Check,
} from 'lucide-react';
import { StrokeStyle } from '../types';

interface TopToolbarProps {
  boardTitle: string;
  onUpdateTitle: (title: string) => void;
  currentColor: string;
  onSelectColor: (color: string) => void;
  currentStrokeWidth: number;
  onSelectStrokeWidth: (width: number) => void;
  currentStrokeStyle: StrokeStyle;
  onSelectStrokeStyle: (style: StrokeStyle) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  backgroundType: 'dots' | 'grid' | 'lines' | 'blank';
  onToggleBackground: () => void;
  onOpenDrafts: () => void;
  onTogglePresentation: () => void;
  onClearCanvas: () => void;
}

const PRESET_COLORS = [
  '#0f172a', // Slate dark
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#ffffff', // White
];

export const TopToolbar: React.FC<TopToolbarProps> = ({
  boardTitle,
  onUpdateTitle,
  currentColor,
  onSelectColor,
  currentStrokeWidth,
  onSelectStrokeWidth,
  currentStrokeStyle,
  onSelectStrokeStyle,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  backgroundType,
  onToggleBackground,
  onOpenDrafts,
  onTogglePresentation,
  onClearCanvas,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(boardTitle);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showStrokeMenu, setShowStrokeMenu] = useState(false);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      onUpdateTitle(titleInput.trim());
    } else {
      setTitleInput(boardTitle);
    }
  };

  return (
    <header className="absolute top-4 left-4 right-4 h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl px-4 flex items-center justify-between z-30">
      {/* Left: Brand / Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/30">
            W
          </div>
          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              autoFocus
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              className="px-2 py-1 text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg outline-none ring-2 ring-indigo-500"
            />
          ) : (
            <button
              onClick={() => {
                setTitleInput(boardTitle);
                setIsEditingTitle(true);
              }}
              className="text-sm font-semibold text-slate-800 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate max-w-[180px] text-left"
              title="Click to rename board"
            >
              {boardTitle}
            </button>
          )}
        </div>

        <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        {/* Undo / Redo */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center: Color Palette & Stroke Width */}
      <div className="hidden md:flex items-center gap-3">
        {/* Colors */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          {PRESET_COLORS.slice(0, 7).map((color) => (
            <button
              key={color}
              onClick={() => onSelectColor(color)}
              className={`w-6 h-6 rounded-full border transition-all ${
                currentColor === color
                  ? 'ring-2 ring-indigo-600 scale-110 border-white shadow-sm'
                  : 'border-slate-300 dark:border-slate-700 hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}

          {/* Color Picker Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-sm hover:scale-105 transition-all"
              title="Custom color"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>

            {showColorPicker && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 flex flex-col gap-2">
                <div className="grid grid-cols-5 gap-1.5">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        onSelectColor(color);
                        setShowColorPicker(false);
                      }}
                      className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => onSelectColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400 uppercase">
                    {currentColor}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stroke Width Selector */}
        <div className="relative">
          <button
            onClick={() => setShowStrokeMenu(!showStrokeMenu)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
          >
            <div
              className="rounded-full bg-slate-900 dark:bg-white"
              style={{ width: Math.min(currentStrokeWidth * 1.5, 20), height: Math.min(currentStrokeWidth * 1.5, 20) }}
            />
            <span>{currentStrokeWidth}px</span>
          </button>

          {showStrokeMenu && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-slate-500">Stroke Width: {currentStrokeWidth}px</span>
                <input
                  type="range"
                  min="1"
                  max="36"
                  value={currentStrokeWidth}
                  onChange={(e) => onSelectStrokeWidth(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-500">Stroke Style</span>
                <div className="grid grid-cols-3 gap-1">
                  {(['solid', 'dashed', 'dotted'] as StrokeStyle[]).map((style) => (
                    <button
                      key={style}
                      onClick={() => {
                        onSelectStrokeStyle(style);
                        setShowStrokeMenu(false);
                      }}
                      className={`px-2 py-1 text-xs rounded-lg capitalize transition-colors ${
                        currentStrokeStyle === style
                          ? 'bg-indigo-600 text-white font-medium'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions (Zoom, Drafts, Grid, Presentation, Export, Clear) */}
      <div className="flex items-center gap-1.5">
        {/* Zoom Controls */}
        <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl gap-0.5">
          <button
            onClick={onZoomOut}
            title="Zoom out"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={onResetZoom}
            title="Reset zoom (100%)"
            className="px-2 py-1 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={onZoomIn}
            title="Zoom in"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Grid toggle */}
        <button
          onClick={onToggleBackground}
          title={`Background grid (${backgroundType})`}
          className={`p-2 rounded-xl transition-colors ${
            backgroundType !== 'blank'
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>

        {/* Drafts Manager */}
        <button
          onClick={onOpenDrafts}
          title="Saved Drafts & Boards"
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
        >
          <FolderOpen className="w-4 h-4" />
          <span className="text-xs font-medium hidden md:inline">Drafts</span>
        </button>

        {/* Presentation Mode */}
        <button
          onClick={onTogglePresentation}
          title="Presentation Mode (Fullscreen)"
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
        >
          <Maximize2 className="w-4 h-4" />
          <span className="text-xs font-medium hidden md:inline">Present</span>
        </button>

        {/* Clear Canvas */}
        <button
          onClick={onClearCanvas}
          title="Clear Canvas"
          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

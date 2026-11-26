import React, { useState, useEffect, useRef } from 'react';
import { ToolType, WhiteboardElement, WhiteboardBoard, StrokeStyle } from './types';
import { loadSavedBoards, saveBoards, loadCurrentBoardId, saveCurrentBoardId, DEFAULT_BOARD } from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { TopToolbar } from './components/TopToolbar';
import { CanvasArea } from './components/CanvasArea';
import { PropertiesPanel } from './components/PropertiesPanel';
import { DraftsModal } from './components/DraftsModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { PresentationBar } from './components/PresentationBar';
import { drawElement } from './utils/canvasHelpers';
import { Keyboard, HelpCircle, Download } from 'lucide-react';

export default function App() {
  const [boards, setBoards] = useState<WhiteboardBoard[]>(() => loadSavedBoards());
  const [currentBoardId, setCurrentBoardId] = useState<string>(() => loadCurrentBoardId(boards));

  const currentBoard = boards.find((b) => b.id === currentBoardId) || boards[0];

  const [currentTool, setCurrentTool] = useState<ToolType>('select');
  const [currentColor, setCurrentColor] = useState<string>('#0f172a');
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState<number>(3);
  const [currentStrokeStyle, setCurrentStrokeStyle] = useState<StrokeStyle>('solid');
  const [zoom, setZoom] = useState<number>(1);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Undo / Redo history per board session
  const [history, setHistory] = useState<WhiteboardElement[][]>([currentBoard.elements]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Modals & Presentation mode
  const [isDraftsOpen, setIsDraftsOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  // Image upload
  const [pendingImageUploadUrl, setPendingImageUploadUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Update history when board changes
  useEffect(() => {
    setHistory([currentBoard.elements]);
    setHistoryIndex(0);
    setSelectedElementId(null);
  }, [currentBoardId]);

  // Autosave to localStorage
  useEffect(() => {
    saveBoards(boards);
    saveCurrentBoardId(currentBoardId);
  }, [boards, currentBoardId]);

  const updateCurrentBoardElements = (newElements: WhiteboardElement[], pushHistory: boolean = true) => {
    const updatedBoards = boards.map((b) =>
      b.id === currentBoardId ? { ...b, elements: newElements, updatedAt: Date.now() } : b
    );
    setBoards(updatedBoards);

    if (pushHistory) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newElements);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const handleAddElement = (el: WhiteboardElement) => {
    const newElements = [...currentBoard.elements, el];
    updateCurrentBoardElements(newElements);
  };

  const handleUpdateElement = (updatedEl: WhiteboardElement) => {
    const newElements = currentBoard.elements.map((el) => (el.id === updatedEl.id ? updatedEl : el));
    updateCurrentBoardElements(newElements, false); // live dragging doesn't flood history
  };

  const handleDeleteElement = (id: string) => {
    const newElements = currentBoard.elements.filter((el) => el.id !== id);
    updateCurrentBoardElements(newElements);
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const handleDuplicateElement = (el: WhiteboardElement) => {
    const duplicated: WhiteboardElement = {
      ...el,
      id: 'el_' + Date.now(),
      x: el.x + 20,
      y: el.y + 20,
    };
    handleAddElement(duplicated);
    setSelectedElementId(duplicated.id);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setHistoryIndex(nextIndex);
      const updatedBoards = boards.map((b) =>
        b.id === currentBoardId ? { ...b, elements: history[nextIndex], updatedAt: Date.now() } : b
      );
      setBoards(updatedBoards);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      const updatedBoards = boards.map((b) =>
        b.id === currentBoardId ? { ...b, elements: history[nextIndex], updatedAt: Date.now() } : b
      );
      setBoards(updatedBoards);
    }
  };

  const handleClearCanvas = () => {
    if (window.confirm('Are you sure you want to clear this whiteboard?')) {
      updateCurrentBoardElements([]);
      setSelectedElementId(null);
    }
  };

  const handleToggleBackground = () => {
    const types: ('dots' | 'grid' | 'lines' | 'blank')[] = ['dots', 'grid', 'lines', 'blank'];
    const nextType = types[(types.indexOf(currentBoard.background) + 1) % types.length];
    const updatedBoards = boards.map((b) => (b.id === currentBoardId ? { ...b, background: nextType } : b));
    setBoards(updatedBoards);
  };

  const handleUpdateTitle = (title: string) => {
    const updatedBoards = boards.map((b) => (b.id === currentBoardId ? { ...b, title } : b));
    setBoards(updatedBoards);
  };

  const handleCreateBoard = (title: string) => {
    const newBoard: WhiteboardBoard = {
      id: 'board_' + Date.now(),
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      elements: [],
      background: 'dots',
      backgroundColor: '#ffffff',
    };
    setBoards([newBoard, ...boards]);
    setCurrentBoardId(newBoard.id);
  };

  const handleDeleteBoard = (id: string) => {
    if (boards.length <= 1) return;
    const remaining = boards.filter((b) => b.id !== id);
    setBoards(remaining);
    if (currentBoardId === id) {
      setCurrentBoardId(remaining[0].id);
    }
  };

  const handleRenameBoard = (id: string, newTitle: string) => {
    setBoards(boards.map((b) => (b.id === id ? { ...b, title: newTitle } : b)));
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(boards, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `whiteboard_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setBoards(parsed);
        setCurrentBoardId(parsed[0].id);
        setIsDraftsOpen(false);
      }
    } catch (e) {
      alert('Invalid JSON file format.');
    }
  };

  const handleExportPng = () => {
    // Render elements onto a temporary offscreen canvas
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 2400;
    exportCanvas.height = 1600;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    const imageCache = new Map<string, HTMLImageElement>();
    for (const el of currentBoard.elements) {
      drawElement(ctx, el, imageCache);
    }

    const dataUrl = exportCanvas.toDataURL('image/png');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataUrl);
    downloadAnchor.setAttribute('download', `${currentBoard.title.toLowerCase().replace(/\s+/g, '_')}_export.png`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setPendingImageUploadUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const selectedElement = currentBoard.elements.find((el) => el.id === selectedElementId) || null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans select-none">
      {/* Hidden file input for image placement */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Top Toolbar */}
      {!isPresentationMode && (
        <TopToolbar
          boardTitle={currentBoard.title}
          onUpdateTitle={handleUpdateTitle}
          currentColor={currentColor}
          onSelectColor={setCurrentColor}
          currentStrokeWidth={currentStrokeWidth}
          onSelectStrokeWidth={setCurrentStrokeWidth}
          currentStrokeStyle={currentStrokeStyle}
          onSelectStrokeStyle={setCurrentStrokeStyle}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
          zoom={zoom}
          onZoomIn={() => setZoom((z) => Math.min(5, z * 1.15))}
          onZoomOut={() => setZoom((z) => Math.max(0.1, z / 1.15))}
          onResetZoom={() => setZoom(1)}
          backgroundType={currentBoard.background}
          onToggleBackground={handleToggleBackground}
          onOpenDrafts={() => setIsDraftsOpen(true)}
          onTogglePresentation={() => setIsPresentationMode(true)}
          onClearCanvas={handleClearCanvas}
        />
      )}

      {/* Sidebar Tool Selector */}
      {!isPresentationMode && (
        <Sidebar
          currentTool={currentTool}
          onSelectTool={setCurrentTool}
          onImageUploadClick={() => fileInputRef.current?.click()}
        />
      )}

      {/* Properties Panel (when element selected) */}
      {!isPresentationMode && selectedElement && (
        <PropertiesPanel
          selectedElement={selectedElement}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
          onDuplicateElement={handleDuplicateElement}
        />
      )}

      {/* Presentation Mode Top Bar */}
      {isPresentationMode && (
        <PresentationBar
          boardTitle={currentBoard.title}
          onExitPresentation={() => setIsPresentationMode(false)}
        />
      )}

      {/* Core Canvas Area */}
      <CanvasArea
        currentTool={currentTool}
        elements={currentBoard.elements}
        onAddElement={handleAddElement}
        onUpdateElement={handleUpdateElement}
        onDeleteElement={handleDeleteElement}
        currentColor={currentColor}
        currentStrokeWidth={currentStrokeWidth}
        currentStrokeStyle={currentStrokeStyle}
        backgroundType={currentBoard.background}
        zoom={zoom}
        onZoomChange={setZoom}
        selectedElementId={selectedElementId}
        onSelectElementId={setSelectedElementId}
        pendingImageUploadUrl={pendingImageUploadUrl}
        onImageInserted={() => setPendingImageUploadUrl(null)}
      />

      {/* Floating Bottom Right Buttons (Export PNG & Shortcuts) */}
      {!isPresentationMode && (
        <div className="absolute bottom-6 right-6 flex items-center gap-2 z-30">
          <button
            onClick={handleExportPng}
            title="Export as PNG"
            className="p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2 text-xs font-medium"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export PNG</span>
          </button>
          <button
            onClick={() => setIsShortcutsOpen(true)}
            title="Keyboard Shortcuts"
            className="p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2 text-xs font-medium"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Shortcuts</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <DraftsModal
        isOpen={isDraftsOpen}
        onClose={() => setIsDraftsOpen(false)}
        boards={boards}
        currentBoardId={currentBoardId}
        onSelectBoard={setCurrentBoardId}
        onCreateBoard={handleCreateBoard}
        onDeleteBoard={handleDeleteBoard}
        onRenameBoard={handleRenameBoard}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { WhiteboardBoard } from '../types';
import { X, Plus, Trash2, FolderOpen, Download, Upload, Edit2, Check } from 'lucide-react';

interface DraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  boards: WhiteboardBoard[];
  currentBoardId: string;
  onSelectBoard: (id: string) => void;
  onCreateBoard: (title: string) => void;
  onDeleteBoard: (id: string) => void;
  onRenameBoard: (id: string, newTitle: string) => void;
  onExportJson: () => void;
  onImportJson: (jsonStr: string) => void;
}

export const DraftsModal: React.FC<DraftsModalProps> = ({
  isOpen,
  onClose,
  boards,
  currentBoardId,
  onSelectBoard,
  onCreateBoard,
  onDeleteBoard,
  onRenameBoard,
  onExportJson,
  onImportJson,
}) => {
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    onCreateBoard(newBoardTitle.trim());
    setNewBoardTitle('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportJson(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Whiteboard Drafts & Boards</h2>
              <p className="text-xs text-slate-500">Manage, backup, and switch between your saved projects</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
          {/* Create New Board Form */}
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              type="text"
              placeholder="New board title..."
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-md shadow-indigo-600/20 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Board</span>
            </button>
          </form>

          {/* Backup / Restore JSON Actions */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">JSON Backup & Restore</h3>
              <p className="text-xs text-slate-500">Export all boards to JSON or restore from backup</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onExportJson}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
              <label className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors shadow-sm cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Import JSON</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Boards List */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Boards ({boards.length})</h3>
            <div className="flex flex-col gap-2">
              {boards.map((board) => {
                const isCurrent = board.id === currentBoardId;
                const isEditing = editingId === board.id;

                return (
                  <div
                    key={board.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 shadow-sm'
                        : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                      <div
                        className={`w-3 h-3 rounded-full shrink-0 ${
                          isCurrent ? 'bg-indigo-600 ring-4 ring-indigo-600/20' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      />
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editTitleInput}
                            autoFocus
                            onChange={(e) => setEditTitleInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                onRenameBoard(board.id, editTitleInput);
                                setEditingId(null);
                              }
                            }}
                            className="px-2.5 py-1 text-sm bg-white dark:bg-slate-900 border border-indigo-500 rounded-lg text-slate-900 dark:text-white outline-none flex-1"
                          />
                          <button
                            onClick={() => {
                              onRenameBoard(board.id, editTitleInput);
                              setEditingId(null);
                            }}
                            className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col min-w-0 flex-1">
                          <button
                            onClick={() => {
                              onSelectBoard(board.id);
                              onClose();
                            }}
                            className="text-sm font-semibold text-slate-900 dark:text-white truncate text-left hover:text-indigo-600 transition-colors"
                          >
                            {board.title}
                          </button>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {board.elements.length} elements · Updated {new Date(board.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {!isEditing && (
                        <button
                          onClick={() => {
                            setEditingId(board.id);
                            setEditTitleInput(board.title);
                          }}
                          title="Rename board"
                          className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {boards.length > 1 && (
                        <button
                          onClick={() => onDeleteBoard(board.id)}
                          title="Delete board"
                          className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

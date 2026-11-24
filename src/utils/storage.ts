import { WhiteboardBoard, WhiteboardElement } from '../types';

const BOARDS_KEY = 'whiteboard_studio_boards_v1';
const CURRENT_BOARD_ID_KEY = 'whiteboard_studio_current_id_v1';

export const DEFAULT_BOARD: WhiteboardBoard = {
  id: 'board_' + Date.now(),
  title: 'Untitled Masterpiece',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  elements: [],
  background: 'dots',
  backgroundColor: '#ffffff',
};

export function loadSavedBoards(): WhiteboardBoard[] {
  try {
    const raw = localStorage.getItem(BOARDS_KEY);
    if (!raw) return [DEFAULT_BOARD];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [DEFAULT_BOARD];
    return parsed;
  } catch (e) {
    console.error('Failed to load boards from localStorage', e);
    return [DEFAULT_BOARD];
  }
}

export function saveBoards(boards: WhiteboardBoard[]): void {
  try {
    localStorage.setItem(BOARDS_KEY, JSON.stringify(boards));
  } catch (e) {
    console.error('Failed to save boards to localStorage', e);
  }
}

export function loadCurrentBoardId(boards: WhiteboardBoard[]): string {
  try {
    const id = localStorage.getItem(CURRENT_BOARD_ID_KEY);
    if (id && boards.some(b => b.id === id)) return id;
    return boards[0].id;
  } catch {
    return boards[0].id;
  }
}

export function saveCurrentBoardId(id: string): void {
  try {
    localStorage.setItem(CURRENT_BOARD_ID_KEY, id);
  } catch (e) {
    console.error('Failed to save current board ID', e);
  }
}

export type ToolType =
  | 'select'
  | 'pencil'
  | 'brush'
  | 'highlighter'
  | 'eraser'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'text'
  | 'sticky'
  | 'image'
  | 'laser';

export type StrokeStyle = 'solid' | 'dashed' | 'dotted';

export interface Point {
  x: number;
  y: number;
}

export interface WhiteboardElement {
  id: string;
  type: 'pencil' | 'brush' | 'highlighter' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'sticky' | 'image';
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: Point[]; // For freehand / pencil / brush / highlighter
  text?: string;
  color: string;
  backgroundColor?: string;
  strokeWidth: number;
  opacity: number;
  strokeStyle?: StrokeStyle;
  fontSize?: number;
  fontFamily?: string;
  imageUrl?: string;
  rotation?: number;
  isLocked?: boolean;
}

export interface WhiteboardBoard {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  elements: WhiteboardElement[];
  background: 'dots' | 'grid' | 'lines' | 'blank';
  backgroundColor: string;
}

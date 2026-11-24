import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ToolType, WhiteboardElement, StrokeStyle, Point } from '../types';
import { drawElement, isPointInsideElement } from '../utils/canvasHelpers';

interface CanvasAreaProps {
  currentTool: ToolType;
  elements: WhiteboardElement[];
  onAddElement: (el: WhiteboardElement) => void;
  onUpdateElement: (el: WhiteboardElement) => void;
  onDeleteElement: (id: string) => void;
  currentColor: string;
  currentStrokeWidth: number;
  currentStrokeStyle: StrokeStyle;
  backgroundType: 'dots' | 'grid' | 'lines' | 'blank';
  zoom: number;
  onZoomChange: (zoom: number) => void;
  selectedElementId: string | null;
  onSelectElementId: (id: string | null) => void;
  pendingImageUploadUrl: string | null;
  onImageInserted: () => void;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  currentTool,
  elements,
  onAddElement,
  onUpdateElement,
  onDeleteElement,
  currentColor,
  currentStrokeWidth,
  currentStrokeStyle,
  backgroundType,
  zoom,
  onZoomChange,
  selectedElementId,
  onSelectElementId,
  pendingImageUploadUrl,
  onImageInserted,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Pan offset in screen coordinates
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);

  // Active drawing/dragging state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [shapeStart, setShapeStart] = useState<Point | null>(null);
  const [tempShapeEnd, setTempShapeEnd] = useState<Point | null>(null);

  // Moving / Resizing selected element
  const [isDraggingElement, setIsDraggingElement] = useState(false);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });

  // Handle keyboard space press for panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !spacePressed && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        setSpacePressed(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        // Undo handled by parent
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [spacePressed]);

  // Handle pending image placement
  useEffect(() => {
    if (pendingImageUploadUrl) {
      const newImgEl: WhiteboardElement = {
        id: 'el_' + Date.now(),
        type: 'image',
        x: -pan.x + window.innerWidth / 2 - 100,
        y: -pan.y + window.innerHeight / 2 - 100,
        width: 300,
        height: 220,
        imageUrl: pendingImageUploadUrl,
        color: currentColor,
        strokeWidth: currentStrokeWidth,
        opacity: 1,
      };
      onAddElement(newImgEl);
      onSelectElementId(newImgEl.id);
      onImageInserted();
    }
  }, [pendingImageUploadUrl]);

  // Screen to World coordinates helper
  const toWorldCoordinates = useCallback(
    (clientX: number, clientY: number): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const screenX = clientX - rect.left;
      const screenY = clientY - rect.top;
      return {
        x: (screenX - pan.x) / zoom,
        y: (screenY - pan.y) / zoom,
      };
    },
    [pan, zoom]
  );

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Apply pan and zoom
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      // Draw background pattern
      drawBackground(ctx, canvas, backgroundType, pan, zoom);

      // Draw all elements
      for (const el of elements) {
        drawElement(ctx, el, imageCacheRef.current);

        // Draw selection bounding box if selected
        if (el.id === selectedElementId) {
          drawSelectionBox(ctx, el);
        }
      }

      // Draw active temporary drawing / shape
      if (isDrawing) {
        if ((currentTool === 'pencil' || currentTool === 'brush' || currentTool === 'highlighter') && currentPoints.length > 0) {
          ctx.save();
          ctx.strokeStyle = currentColor;
          ctx.lineWidth = currentTool === 'highlighter' ? Math.max(currentStrokeWidth * 2.5, 12) : currentStrokeWidth;
          ctx.globalAlpha = currentTool === 'highlighter' ? 0.4 : 1;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
          for (let i = 1; i < currentPoints.length; i++) {
            ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
          }
          ctx.stroke();
          ctx.restore();
        } else if (shapeStart && tempShapeEnd) {
          ctx.save();
          ctx.strokeStyle = currentColor;
          ctx.lineWidth = currentStrokeWidth;
          ctx.globalAlpha = 1;
          const w = tempShapeEnd.x - shapeStart.x;
          const h = tempShapeEnd.y - shapeStart.y;
          if (currentTool === 'rectangle') {
            ctx.strokeRect(shapeStart.x, shapeStart.y, w, h);
          } else if (currentTool === 'circle') {
            const rx = w / 2;
            const ry = h / 2;
            ctx.beginPath();
            ctx.ellipse(shapeStart.x + rx, shapeStart.y + ry, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
            ctx.stroke();
          } else if (currentTool === 'line' || currentTool === 'arrow') {
            ctx.beginPath();
            ctx.moveTo(shapeStart.x, shapeStart.y);
            ctx.lineTo(tempShapeEnd.x, tempShapeEnd.y);
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      ctx.restore();
    };

    render();
    window.addEventListener('resize', render);
    return () => {
      window.removeEventListener('resize', render);
    };
  }, [elements, pan, zoom, backgroundType, isDrawing, currentPoints, shapeStart, tempShapeEnd, currentTool, currentColor, currentStrokeWidth, selectedElementId]);

  const drawBackground = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    type: string,
    currentPan: Point,
    currentZoom: number
  ) => {
    if (type === 'blank') return;

    const isDark = document.documentElement.classList.contains('dark');
    ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
    ctx.fillRect(-currentPan.x / currentZoom, -currentPan.y / currentZoom, canvas.width / currentZoom, canvas.height / currentZoom);

    const step = type === 'grid' ? 40 : 24;
    const left = -currentPan.x / currentZoom;
    const top = -currentPan.y / currentZoom;
    const right = left + canvas.width / currentZoom;
    const bottom = top + canvas.height / currentZoom;

    const startX = Math.floor(left / step) * step;
    const startY = Math.floor(top / step) * step;

    ctx.fillStyle = isDark ? '#334155' : '#cbd5e1';
    ctx.strokeStyle = isDark ? '#1e293b' : '#e2e8f0';
    ctx.lineWidth = 1 / currentZoom;

    if (type === 'dots') {
      for (let x = startX; x < right; x += step) {
        for (let y = startY; y < bottom; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5 / currentZoom, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (type === 'grid') {
      ctx.beginPath();
      for (let x = startX; x < right; x += step) {
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
      }
      for (let y = startY; y < bottom; y += step) {
        ctx.moveTo(left, y);
        ctx.lineTo(right, y);
      }
      ctx.stroke();
    } else if (type === 'lines') {
      ctx.beginPath();
      for (let y = startY; y < bottom; y += step) {
        ctx.moveTo(left, y);
        ctx.lineTo(right, y);
      }
      ctx.stroke();
    }
  };

  const drawSelectionBox = (ctx: CanvasRenderingContext2D, el: WhiteboardElement) => {
    ctx.save();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 1.5 / zoom;
    ctx.setLineDash([4 / zoom, 4 / zoom]);

    let minX = el.x;
    let minY = el.y;
    let w = el.width || 100;
    let h = el.height || 100;

    if (el.type === 'pencil' || el.type === 'brush' || el.type === 'highlighter') {
      if (el.points && el.points.length > 0) {
        let xs = el.points.map((p) => p.x);
        let ys = el.points.map((p) => p.y);
        minX = Math.min(...xs);
        minY = Math.min(...ys);
        w = Math.max(...xs) - minX;
        h = Math.max(...ys) - minY;
      }
    }

    ctx.strokeRect(minX - 6, minY - 6, w + 12, h + 12);

    // Draw resize handles
    const handleSize = 8 / zoom;
    ctx.fillStyle = '#6366f1';
    ctx.setLineDash([]);
    ctx.fillRect(minX - 6 - handleSize / 2, minY - 6 - handleSize / 2, handleSize, handleSize);
    ctx.fillRect(minX + w + 6 - handleSize / 2, minY - 6 - handleSize / 2, handleSize, handleSize);
    ctx.fillRect(minX - 6 - handleSize / 2, minY + h + 6 - handleSize / 2, handleSize, handleSize);
    ctx.fillRect(minX + w + 6 - handleSize / 2, minY + h + 6 - handleSize / 2, handleSize, handleSize);

    ctx.restore();
  };

  // Mouse / Pointer Event Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const worldPos = toWorldCoordinates(e.clientX, e.clientY);

    if (spacePressed || e.button === 1 || currentTool === 'select' && e.shiftKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (currentTool === 'select') {
      // Find clicked element
      let clickedEl: WhiteboardElement | null = null;
      // Search from top (end of array) to bottom
      for (let i = elements.length - 1; i >= 0; i--) {
        if (isPointInsideElement(worldPos, elements[i])) {
          clickedEl = elements[i];
          break;
        }
      }

      if (clickedEl) {
        onSelectElementId(clickedEl.id);
        setIsDraggingElement(true);
        setDragOffset({ x: worldPos.x - clickedEl.x, y: worldPos.y - clickedEl.y });
      } else {
        onSelectElementId(null);
      }
      return;
    }

    if (currentTool === 'eraser') {
      // Erase element under point
      for (let i = elements.length - 1; i >= 0; i--) {
        if (isPointInsideElement(worldPos, elements[i])) {
          onDeleteElement(elements[i].id);
          break;
        }
      }
      return;
    }

    if (currentTool === 'pencil' || currentTool === 'brush' || currentTool === 'highlighter') {
      setIsDrawing(true);
      setCurrentPoints([worldPos]);
      return;
    }

    if (['rectangle', 'circle', 'line', 'arrow'].includes(currentTool)) {
      setIsDrawing(true);
      setShapeStart(worldPos);
      setTempShapeEnd(worldPos);
      return;
    }

    if (currentTool === 'sticky') {
      const newSticky: WhiteboardElement = {
        id: 'el_' + Date.now(),
        type: 'sticky',
        x: worldPos.x - 90,
        y: worldPos.y - 90,
        width: 180,
        height: 180,
        text: 'New sticky note... Double click to edit',
        color: '#1e293b',
        backgroundColor: '#fef08a',
        strokeWidth: 1,
        opacity: 1,
      };
      onAddElement(newSticky);
      onSelectElementId(newSticky.id);
      return;
    }

    if (currentTool === 'text') {
      const newText: WhiteboardElement = {
        id: 'el_' + Date.now(),
        type: 'text',
        x: worldPos.x,
        y: worldPos.y,
        text: 'Type your text here...',
        color: currentColor,
        fontSize: 24,
        strokeWidth: 1,
        opacity: 1,
      };
      onAddElement(newText);
      onSelectElementId(newText.id);
      return;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const worldPos = toWorldCoordinates(e.clientX, e.clientY);

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (isDraggingElement && selectedElementId) {
      const el = elements.find((item) => item.id === selectedElementId);
      if (el) {
        const updated = {
          ...el,
          x: worldPos.x - dragOffset.x,
          y: worldPos.y - dragOffset.y,
        };
        onUpdateElement(updated);
      }
      return;
    }

    if (!isDrawing) return;

    if (currentTool === 'pencil' || currentTool === 'brush' || currentTool === 'highlighter') {
      setCurrentPoints((prev) => [...prev, worldPos]);
    } else if (['rectangle', 'circle', 'line', 'arrow'].includes(currentTool)) {
      setTempShapeEnd(worldPos);
    }
  };

  const handlePointerUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }

    if (isDraggingElement) {
      setIsDraggingElement(false);
    }

    if (isDrawing) {
      setIsDrawing(false);

      if ((currentTool === 'pencil' || currentTool === 'brush' || currentTool === 'highlighter') && currentPoints.length > 0) {
        let xs = currentPoints.map((p) => p.x);
        let ys = currentPoints.map((p) => p.y);
        const newEl: WhiteboardElement = {
          id: 'el_' + Date.now(),
          type: currentTool === 'highlighter' ? 'highlighter' : currentTool === 'brush' ? 'brush' : 'pencil',
          x: Math.min(...xs),
          y: Math.min(...ys),
          points: currentPoints,
          color: currentColor,
          strokeWidth: currentStrokeWidth,
          strokeStyle: currentStrokeStyle,
          opacity: currentTool === 'highlighter' ? 0.4 : 1,
        };
        onAddElement(newEl);
        setCurrentPoints([]);
      } else if (shapeStart && tempShapeEnd && ['rectangle', 'circle', 'line', 'arrow'].includes(currentTool)) {
        const width = tempShapeEnd.x - shapeStart.x;
        const height = tempShapeEnd.y - shapeStart.y;
        if (Math.abs(width) > 2 || Math.abs(height) > 2) {
          const newEl: WhiteboardElement = {
            id: 'el_' + Date.now(),
            type: currentTool as any,
            x: shapeStart.x,
            y: shapeStart.y,
            width,
            height,
            color: currentColor,
            backgroundColor: currentTool === 'rectangle' || currentTool === 'circle' ? 'transparent' : undefined,
            strokeWidth: currentStrokeWidth,
            strokeStyle: currentStrokeStyle,
            opacity: 1,
          };
          onAddElement(newEl);
        }
        setShapeStart(null);
        setTempShapeEnd(null);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.max(0.1, Math.min(5, zoom * zoomFactor));
    onZoomChange(newZoom);
  };

  return (
    <div className="absolute inset-0 overflow-hidden cursor-crosshair">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full block"
      />
    </div>
  );
};

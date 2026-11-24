import { WhiteboardElement, Point } from '../types';

export function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  headLength: number = 12
) {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle - Math.PI / 6),
    toY - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    toX - headLength * Math.cos(angle + Math.PI / 6),
    toY - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fillStyle = ctx.strokeStyle;
  ctx.fill();
}

export function drawElement(ctx: CanvasRenderingContext2D, el: WhiteboardElement, imageCache: Map<string, HTMLImageElement>) {
  ctx.save();
  ctx.globalAlpha = el.opacity ?? 1;
  ctx.strokeStyle = el.color;
  ctx.fillStyle = el.backgroundColor || 'transparent';
  ctx.lineWidth = el.strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (el.strokeStyle === 'dashed') {
    ctx.setLineDash([el.strokeWidth * 3, el.strokeWidth * 2]);
  } else if (el.strokeStyle === 'dotted') {
    ctx.setLineDash([el.strokeWidth, el.strokeWidth * 2]);
  } else {
    ctx.setLineDash([]);
  }

  if (el.type === 'pencil' || el.type === 'brush' || el.type === 'highlighter') {
    if (el.type === 'highlighter') {
      ctx.globalAlpha = Math.min(el.opacity, 0.4);
      ctx.lineWidth = Math.max(el.strokeWidth * 2.5, 12);
    }
    if (el.points && el.points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(el.points[0].x, el.points[0].y);
      for (let i = 1; i < el.points.length; i++) {
        ctx.lineTo(el.points[i].x, el.points[i].y);
      }
      ctx.stroke();
    }
  } else if (el.type === 'rectangle') {
    const w = el.width || 0;
    const h = el.height || 0;
    ctx.beginPath();
    ctx.rect(el.x, el.y, w, h);
    if (el.backgroundColor && el.backgroundColor !== 'transparent') {
      ctx.fill();
    }
    ctx.stroke();
  } else if (el.type === 'circle') {
    const rx = (el.width || 0) / 2;
    const ry = (el.height || 0) / 2;
    const cx = el.x + rx;
    const cy = el.y + ry;
    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
    if (el.backgroundColor && el.backgroundColor !== 'transparent') {
      ctx.fill();
    }
    ctx.stroke();
  } else if (el.type === 'line') {
    const w = el.width || 0;
    const h = el.height || 0;
    ctx.beginPath();
    ctx.moveTo(el.x, el.y);
    ctx.lineTo(el.x + w, el.y + h);
    ctx.stroke();
  } else if (el.type === 'arrow') {
    const w = el.width || 0;
    const h = el.height || 0;
    drawArrow(ctx, el.x, el.y, el.x + w, el.y + h, Math.max(10, el.strokeWidth * 3));
  } else if (el.type === 'sticky') {
    const w = el.width || 180;
    const h = el.height || 180;
    // Sticky note background with soft shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = el.backgroundColor || '#fef08a';
    ctx.beginPath();
    ctx.roundRect(el.x, el.y, w, h, 8);
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Border
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Text inside sticky note
    if (el.text) {
      ctx.fillStyle = el.color || '#1e293b';
      ctx.font = `14px system-ui, -apple-system, sans-serif`;
      wrapText(ctx, el.text, el.x + 16, el.y + 24, w - 32, 20);
    }
  } else if (el.type === 'text') {
    if (el.text) {
      ctx.fillStyle = el.color;
      const fontSize = el.fontSize || 20;
      ctx.font = `${fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.fillText(el.text, el.x, el.y + fontSize);
    }
  } else if (el.type === 'image' && el.imageUrl) {
    let img = imageCache.get(el.imageUrl);
    if (!img) {
      img = new Image();
      img.src = el.imageUrl;
      imageCache.set(el.imageUrl, img);
    }
    if (img.complete && img.naturalWidth > 0) {
      const w = el.width || img.naturalWidth;
      const h = el.height || img.naturalHeight;
      ctx.drawImage(img, el.x, el.y, w, h);
    } else {
      // Placeholder while loading
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(el.x, el.y, el.width || 150, el.height || 150);
      ctx.fillStyle = '#64748b';
      ctx.font = '12px system-ui';
      ctx.fillText('Loading image...', el.x + 10, el.y + 30);
    }
  }

  ctx.restore();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}

export function isPointInsideElement(point: Point, el: WhiteboardElement): boolean {
  const x = point.x;
  const y = point.y;

  if (el.type === 'pencil' || el.type === 'brush' || el.type === 'highlighter') {
    if (!el.points) return false;
    for (const p of el.points) {
      const dist = Math.hypot(p.x - x, p.y - y);
      if (dist < Math.max(el.strokeWidth * 1.5, 10)) return true;
    }
    return false;
  }

  const elX = el.x;
  const elY = el.y;
  const w = el.width || 0;
  const h = el.height || 0;

  const minX = Math.min(elX, elX + w);
  const maxX = Math.max(elX, elX + w);
  const minY = Math.min(elY, elY + h);
  const maxY = Math.max(elY, elY + h);

  if (el.type === 'rectangle' || el.type === 'sticky' || el.type === 'image') {
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  }

  if (el.type === 'circle') {
    const rx = w / 2;
    const ry = h / 2;
    const cx = elX + rx;
    const cy = elY + ry;
    const dx = (x - cx) / (Math.abs(rx) || 1);
    const dy = (y - cy) / (Math.abs(ry) || 1);
    return dx * dx + dy * dy <= 1;
  }

  if (el.type === 'line' || el.type === 'arrow') {
    const x1 = elX;
    const y1 = elY;
    const x2 = elX + w;
    const y2 = elY + h;
    const lineLen = Math.hypot(x2 - x1, y2 - y1);
    if (lineLen === 0) return Math.hypot(x - x1, y - y1) < 10;
    const d = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) / lineLen;
    const dot = (x - x1) * (x2 - x1) + (y - y1) * (y2 - y1);
    const dot2 = (x - x2) * (x1 - x2) + (y - y2) * (y1 - y2);
    return d < 10 && dot >= 0 && dot2 >= 0;
  }

  if (el.type === 'text') {
    const fontSize = el.fontSize || 20;
    const approxWidth = (el.text || '').length * (fontSize * 0.6);
    return x >= elX && x <= elX + approxWidth && y >= elY && y <= elY + fontSize;
  }

  return false;
}

import { useCallback, useRef } from 'react';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports the graph canvas as a PNG using the native Canvas API.
 * For higher-quality exports, install html-to-image and call it manually.
 */
async function domToPng(el: HTMLElement): Promise<string> {
  // Serialize the element's bounding box as an SVG foreignObject and rasterise via canvas
  const { width, height } = el.getBoundingClientRect();
  const xml = new XMLSerializer().serializeToString(el);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">${xml}</div>
      </foreignObject>
    </svg>`;
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * 2;
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(2, 2);
      ctx.fillStyle = '#0B0B12';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function useGraphExport() {
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const exportAsPNG = useCallback(async () => {
    const el = canvasRef.current;
    if (!el) return;
    try {
      const dataUrl = await domToPng(el);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'dependency-graph.png';
      a.click();
    } catch (e) {
      console.error('PNG export failed:', e);
    }
  }, []);

  const exportAsSVG = useCallback(() => {
    const el = canvasRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const xml = new XMLSerializer().serializeToString(el);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">${xml}</div>
      </foreignObject>
    </svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, 'dependency-graph.svg');
  }, []);

  const exportAsJSON = useCallback((nodes: unknown[], edges: unknown[]) => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    downloadBlob(blob, 'dependency-graph.json');
  }, []);

  return { canvasRef, exportAsPNG, exportAsSVG, exportAsJSON };
}

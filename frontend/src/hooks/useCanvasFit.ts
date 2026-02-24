import { useEffect, useState, RefObject } from 'react';

interface CanvasFitOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  containerRef?: RefObject<HTMLElement | null>;
}

interface CanvasFitResult {
  width: number;
  height: number;
  scale: number;
  mapPointerToCanvas: (clientX: number, clientY: number) => { x: number; y: number };
}

export function useCanvasFit({ canvasRef, containerRef }: CanvasFitOptions): CanvasFitResult {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600, scale: 1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const container = containerRef?.current || canvas.parentElement;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = Math.min(600, window.innerHeight * 0.6);
      
      const aspectRatio = 4 / 3;
      let width = containerWidth;
      let height = width / aspectRatio;

      if (height > containerHeight) {
        height = containerHeight;
        width = height * aspectRatio;
      }

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Reset transform before applying new scale to prevent compounding
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
      }

      setDimensions({ width, height, scale: dpr });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [canvasRef, containerRef]);

  const mapPointerToCanvas = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * dimensions.width;
    const y = ((clientY - rect.top) / rect.height) * dimensions.height;

    return { x, y };
  };

  return {
    ...dimensions,
    mapPointerToCanvas,
  };
}

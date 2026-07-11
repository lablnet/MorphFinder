import { useState, useCallback, useMemo } from 'react';
import type React from 'react';
import { normalizedSelectionRect, type SelectionRect } from '../../components/files/selection';

interface Point {
  x: number;
  y: number;
}

interface MarqueeState {
  start: Point;
  current: Point;
}

export function useMarquee(
  onSelectionChange: (paths: string[]) => void,
  calculateSelection: (rect: SelectionRect) => string[]
) {
  const [marquee, setMarquee] = useState<MarqueeState | null>(null);
  const [suppressNextClick, setSuppressNextClick] = useState(false);

  const marqueeRect = useMemo(() => {
    if (marquee === null) return null;
    return normalizedSelectionRect(marquee.start, marquee.current);
  }, [marquee]);

  const pointFromEvent = useCallback((event: React.MouseEvent): Point => {
    const target = event.currentTarget;
    const bounds = target.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }, []);

  const onMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button !== 0 || (event.target as Element).closest('[data-file-item="true"]') !== null) return;
    const point = pointFromEvent(event);
    setMarquee({ start: point, current: point });
  }, [pointFromEvent]);

  const onMouseMove = useCallback((event: React.MouseEvent) => {
    if (marquee === null) return;
    const point = pointFromEvent(event);
    setMarquee((current) => (current === null ? null : { ...current, current: point }));
  }, [marquee, pointFromEvent]);

  const onMouseUp = useCallback(() => {
    if (marqueeRect !== null) {
      const wasDrag = marqueeRect.right - marqueeRect.left > 3 || marqueeRect.bottom - marqueeRect.top > 3;
      const selectedPaths = calculateSelection(marqueeRect);
      onSelectionChange(selectedPaths);
      setSuppressNextClick(wasDrag);
    }
    setMarquee(null);
  }, [marqueeRect, onSelectionChange, calculateSelection]);

  const marqueeHandlers = useMemo(() => ({
    onMouseDown,
    onMouseMove,
    onMouseUp,
  }), [onMouseDown, onMouseMove, onMouseUp]);

  return {
    marqueeRect,
    suppressNextClick,
    setSuppressNextClick,
    marqueeHandlers,
  };
}
export type UseMarqueeResult = ReturnType<typeof useMarquee>;

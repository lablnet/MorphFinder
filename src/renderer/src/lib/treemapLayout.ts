export interface LayoutRect {
  id: string;
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  percentage: number;
  fileCount: number;
}

/**
 * Computes a simple aspect-ratio-aware slice treemap layout for a list of children.
 * Uses totalRemainingSize dynamically to avoid mathematical overlap and spacing bugs.
 */
export function computeTreemapLayout(
  children: { name: string; path: string; size: number; isDirectory: boolean; fileCount: number }[],
  totalSize: number,
  width: number,
  height: number
): LayoutRect[] {
  if (children.length === 0 || totalSize === 0 || width <= 0 || height <= 0) {
    return [];
  }

  const rects: LayoutRect[] = [];
  let remainingX = 0;
  let remainingY = 0;
  let remainingWidth = width;
  let remainingHeight = height;

  const sortedChildren = [...children].sort((a, b) => b.size - a.size);
  let totalRemainingSize = sortedChildren.reduce((sum, item) => sum + item.size, 0);
  if (totalRemainingSize === 0) return [];

  for (let i = 0; i < sortedChildren.length; i++) {
    const child = sortedChildren[i]!;
    if (totalRemainingSize <= 0) break;

    const proportion = child.size / totalRemainingSize;
    const clampedProportion = Math.min(1, Math.max(0, proportion));

    if (remainingWidth >= remainingHeight) {
      const itemWidth = remainingWidth * clampedProportion;
      rects.push({
        id: child.path,
        name: child.name,
        path: child.path,
        size: child.size,
        isDirectory: child.isDirectory,
        x: remainingX,
        y: remainingY,
        width: Math.max(1, itemWidth),
        height: remainingHeight,
        percentage: (child.size / totalSize) * 100,
        fileCount: child.fileCount,
      });
      remainingX += itemWidth;
      remainingWidth -= itemWidth;
    } else {
      const itemHeight = remainingHeight * clampedProportion;
      rects.push({
        id: child.path,
        name: child.name,
        path: child.path,
        size: child.size,
        isDirectory: child.isDirectory,
        x: remainingX,
        y: remainingY,
        width: remainingWidth,
        height: Math.max(1, itemHeight),
        percentage: (child.size / totalSize) * 100,
        fileCount: child.fileCount,
      });
      remainingY += itemHeight;
      remainingHeight -= itemHeight;
    }

    totalRemainingSize -= child.size;
  }

  return rects;
}

import type {
  Divider,
  LayoutNode,
  LayoutPath,
  LayoutPresetId,
  NeighborDirection,
  Rect,
  SplitDirection,
} from "./types";

export interface LayoutPreset {
  id: LayoutPresetId;
  label: string;
  paneCount: number;
  build: (paneIds: string[]) => LayoutNode;
}

export const FULL_RECT: Rect = { x: 0, y: 0, w: 100, h: 100 };

const EPSILON = 0.01;

function paneNode(paneId: string): LayoutNode {
  return { type: "pane", paneId };
}

function splitNode(
  direction: SplitDirection,
  first: LayoutNode,
  second: LayoutNode,
  ratio = 0.5
): LayoutNode {
  return { type: "split", direction, ratio, first, second };
}

export const LAYOUT_PRESETS: Record<LayoutPresetId, LayoutPreset> = {
  single: {
    id: "single",
    label: "Single",
    paneCount: 1,
    build: ([a]) => paneNode(a),
  },
  "columns-2": {
    id: "columns-2",
    label: "Side by side",
    paneCount: 2,
    build: ([a, b]) => splitNode("row", paneNode(a), paneNode(b)),
  },
  "rows-2": {
    id: "rows-2",
    label: "Stacked",
    paneCount: 2,
    build: ([a, b]) => splitNode("column", paneNode(a), paneNode(b)),
  },
  "main-plus-2": {
    id: "main-plus-2",
    label: "Main + 2",
    paneCount: 3,
    build: ([a, b, c]) =>
      splitNode("row", paneNode(a), splitNode("column", paneNode(b), paneNode(c)), 0.6),
  },
  "grid-4": {
    id: "grid-4",
    label: "Grid of 4",
    paneCount: 4,
    build: ([a, b, c, d]) =>
      splitNode(
        "column",
        splitNode("row", paneNode(a), paneNode(b)),
        splitNode("row", paneNode(c), paneNode(d))
      ),
  },
};

export const LAYOUT_PRESET_IDS = Object.keys(LAYOUT_PRESETS) as LayoutPresetId[];

export function collectPaneIds(node: LayoutNode): string[] {
  if (node.type === "pane") return [node.paneId];
  return [...collectPaneIds(node.first), ...collectPaneIds(node.second)];
}

/** Removes a pane and lets its sibling take the freed space. Returns `null` if nothing is left. */
export function removePane(node: LayoutNode, paneId: string): LayoutNode | null {
  if (node.type === "pane") {
    return node.paneId === paneId ? null : node;
  }

  const first = removePane(node.first, paneId);
  const second = removePane(node.second, paneId);
  if (!first) return second;
  if (!second) return first;
  if (first === node.first && second === node.second) return node;
  return { ...node, first, second };
}

export function swapPaneIds(node: LayoutNode, a: string, b: string): LayoutNode {
  if (node.type === "pane") {
    if (node.paneId === a) return { ...node, paneId: b };
    if (node.paneId === b) return { ...node, paneId: a };
    return node;
  }
  return { ...node, first: swapPaneIds(node.first, a, b), second: swapPaneIds(node.second, a, b) };
}

export function clampRatio(ratio: number, min = 0.1): number {
  const safeMin = Math.min(Math.max(min, 0.01), 0.5);
  return Math.min(Math.max(ratio, safeMin), 1 - safeMin);
}

/** Returns the layout with the split at `path` resized. Unknown paths leave it unchanged. */
export function setRatioAt(node: LayoutNode, path: LayoutPath, ratio: number): LayoutNode {
  if (node.type === "pane") return node;
  if (path.length === 0) {
    const next = clampRatio(ratio, 0.01);
    return next === node.ratio ? node : { ...node, ratio: next };
  }

  const [step, ...rest] = path;
  const child = setRatioAt(node[step], rest, ratio);
  return child === node[step] ? node : { ...node, [step]: child };
}

function splitRect(rect: Rect, direction: SplitDirection, ratio: number): [Rect, Rect] {
  if (direction === "row") {
    const firstW = rect.w * ratio;
    return [
      { ...rect, w: firstW },
      { ...rect, x: rect.x + firstW, w: rect.w - firstW },
    ];
  }
  const firstH = rect.h * ratio;
  return [
    { ...rect, h: firstH },
    { ...rect, y: rect.y + firstH, h: rect.h - firstH },
  ];
}

export function computePaneRects(
  node: LayoutNode,
  rect: Rect = FULL_RECT,
  out: Record<string, Rect> = {}
): Record<string, Rect> {
  if (node.type === "pane") {
    out[node.paneId] = rect;
    return out;
  }

  const [firstRect, secondRect] = splitRect(rect, node.direction, node.ratio);
  computePaneRects(node.first, firstRect, out);
  computePaneRects(node.second, secondRect, out);
  return out;
}

export function computeDividers(
  node: LayoutNode,
  rect: Rect = FULL_RECT,
  path: LayoutPath = [],
  out: Divider[] = []
): Divider[] {
  if (node.type === "pane") return out;

  out.push({ path, direction: node.direction, ratio: node.ratio, splitRect: rect });
  const [firstRect, secondRect] = splitRect(rect, node.direction, node.ratio);
  computeDividers(node.first, firstRect, [...path, "first"], out);
  computeDividers(node.second, secondRect, [...path, "second"], out);
  return out;
}

/** Nearest pane that shares an edge with `fromId` in the given direction. */
export function findNeighbor(
  rects: Record<string, Rect>,
  fromId: string,
  direction: NeighborDirection
): string | null {
  const from = rects[fromId];
  if (!from) return null;

  let best: string | null = null;
  let bestGap = Infinity;
  let bestOverlap = 0;

  for (const [id, rect] of Object.entries(rects)) {
    if (id === fromId) continue;

    const horizontal = direction === "left" || direction === "right";
    const overlap = horizontal
      ? Math.min(from.y + from.h, rect.y + rect.h) - Math.max(from.y, rect.y)
      : Math.min(from.x + from.w, rect.x + rect.w) - Math.max(from.x, rect.x);
    const gap = {
      left: from.x - (rect.x + rect.w),
      right: rect.x - (from.x + from.w),
      up: from.y - (rect.y + rect.h),
      down: rect.y - (from.y + from.h),
    }[direction];

    if (gap < -EPSILON || overlap <= EPSILON) continue;
    if (gap < bestGap - EPSILON || (Math.abs(gap - bestGap) <= EPSILON && overlap > bestOverlap)) {
      best = id;
      bestGap = gap;
      bestOverlap = overlap;
    }
  }

  return best;
}

export function findPaneAt(rects: Record<string, Rect>, x: number, y: number): string | null {
  for (const [id, rect] of Object.entries(rects)) {
    if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) return id;
  }
  return null;
}

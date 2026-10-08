import type { LayoutNode, LayoutPresetId, Rect, SplitDirection } from "./types";

export interface LayoutPreset {
  id: LayoutPresetId;
  label: string;
  paneCount: number;
  build: (paneIds: string[]) => LayoutNode;
}

const FULL_RECT: Rect = { x: 0, y: 0, w: 100, h: 100 };

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

export function computePaneRects(
  node: LayoutNode,
  rect: Rect = FULL_RECT,
  out: Record<string, Rect> = {}
): Record<string, Rect> {
  if (node.type === "pane") {
    out[node.paneId] = rect;
    return out;
  }

  if (node.direction === "row") {
    const firstW = rect.w * node.ratio;
    computePaneRects(node.first, { ...rect, w: firstW }, out);
    computePaneRects(node.second, { ...rect, x: rect.x + firstW, w: rect.w - firstW }, out);
  } else {
    const firstH = rect.h * node.ratio;
    computePaneRects(node.first, { ...rect, h: firstH }, out);
    computePaneRects(node.second, { ...rect, y: rect.y + firstH, h: rect.h - firstH }, out);
  }

  return out;
}

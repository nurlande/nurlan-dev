export type SplitDirection = "row" | "column";

export interface Pane {
  id: string;
  url: string;
}

export interface PaneNode {
  type: "pane";
  paneId: string;
}

export interface SplitNode {
  type: "split";
  direction: SplitDirection;
  /** Share of the space given to `first`, between 0 and 1. */
  ratio: number;
  first: LayoutNode;
  second: LayoutNode;
}

export type LayoutNode = PaneNode | SplitNode;

export type LayoutPresetId = "single" | "columns-2" | "rows-2" | "main-plus-2" | "grid-4";

export interface Workspace {
  id: string;
  name: string;
  /** `null` once the layout no longer matches a preset, e.g. after closing a pane. */
  presetId: LayoutPresetId | null;
  layout: LayoutNode;
  panes: Record<string, Pane>;
  /** Every pane in order. Panes that are not in the layout keep their URL for later. */
  paneOrder: string[];
}

/** Position and size as percentages of the container. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

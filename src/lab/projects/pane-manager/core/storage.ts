import { LAYOUT_PRESET_IDS } from "./layoutTree";
import type { LayoutNode, Workspace } from "./types";

const STORAGE_KEY = "pane-manager:workspace:v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLayoutNode(value: unknown, paneIds: Set<string>): value is LayoutNode {
  if (!isRecord(value)) return false;

  if (value.type === "pane") {
    return typeof value.paneId === "string" && paneIds.has(value.paneId);
  }

  return (
    value.type === "split" &&
    (value.direction === "row" || value.direction === "column") &&
    typeof value.ratio === "number" &&
    value.ratio > 0 &&
    value.ratio < 1 &&
    isLayoutNode(value.first, paneIds) &&
    isLayoutNode(value.second, paneIds)
  );
}

function isWorkspace(value: unknown): value is Workspace {
  if (!isRecord(value) || !isRecord(value.panes) || !Array.isArray(value.paneOrder)) {
    return false;
  }

  const panes = value.panes;
  const paneIds = new Set(value.paneOrder.filter((id): id is string => typeof id === "string"));
  const panesValid = [...paneIds].every((id) => {
    const pane = panes[id];
    return isRecord(pane) && pane.id === id && typeof pane.url === "string";
  });

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    (value.presetId === null || LAYOUT_PRESET_IDS.includes(value.presetId as never)) &&
    paneIds.size === value.paneOrder.length &&
    panesValid &&
    isLayoutNode(value.layout, paneIds)
  );
}

export function loadWorkspace(): Workspace | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data: unknown = JSON.parse(raw);
    return isWorkspace(data) ? data : null;
  } catch {
    return null;
  }
}

export function saveWorkspace(workspace: Workspace) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  } catch {
    // Storage can be full or disabled (private mode); the workspace still works in memory.
  }
}

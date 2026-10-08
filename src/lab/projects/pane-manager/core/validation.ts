import { normalizeUrl } from "./embedPolicy";
import { LAYOUT_PRESET_IDS } from "./layoutTree";
import type { LayoutNode, Workspace } from "./types";

export const MAX_PANES = 16;
export const MAX_NAME_LENGTH = 60;
const MAX_LAYOUT_DEPTH = 32;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Only empty or http(s) addresses may reach an iframe `src`. */
export function isSafePaneUrl(value: unknown): value is string {
  return typeof value === "string" && (value === "" || normalizeUrl(value) === value);
}

export function isSafeName(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= MAX_NAME_LENGTH;
}

export function isValidRatio(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 && value < 1;
}

/** Checks the tree only references known panes, each at most once. */
export function isLayoutNode(
  value: unknown,
  paneIds: Set<string>,
  seen = new Set<string>(),
  depth = 0
): value is LayoutNode {
  if (!isRecord(value) || depth > MAX_LAYOUT_DEPTH) return false;

  if (value.type === "pane") {
    const { paneId } = value;
    if (typeof paneId !== "string" || !paneIds.has(paneId) || seen.has(paneId)) return false;
    seen.add(paneId);
    return true;
  }

  return (
    value.type === "split" &&
    (value.direction === "row" || value.direction === "column") &&
    isValidRatio(value.ratio) &&
    isLayoutNode(value.first, paneIds, seen, depth + 1) &&
    isLayoutNode(value.second, paneIds, seen, depth + 1)
  );
}

export function isWorkspace(value: unknown): value is Workspace {
  if (!isRecord(value) || !isRecord(value.panes) || !Array.isArray(value.paneOrder)) {
    return false;
  }
  if (value.paneOrder.length === 0 || value.paneOrder.length > MAX_PANES) return false;

  const panes = value.panes;
  const paneIds = new Set(value.paneOrder.filter((id): id is string => typeof id === "string"));
  const panesValid = [...paneIds].every((id) => {
    const pane = panes[id];
    return isRecord(pane) && pane.id === id && isSafePaneUrl(pane.url);
  });

  return (
    typeof value.id === "string" &&
    isSafeName(value.name) &&
    (value.presetId === null || LAYOUT_PRESET_IDS.includes(value.presetId as never)) &&
    paneIds.size === value.paneOrder.length &&
    panesValid &&
    isLayoutNode(value.layout, paneIds)
  );
}

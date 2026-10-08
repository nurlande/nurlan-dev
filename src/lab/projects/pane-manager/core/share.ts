import { LAYOUT_PRESET_IDS } from "./layoutTree";
import type { LayoutNode, LayoutPresetId, Workspace } from "./types";
import { isRecord, isSafeName, isValidRatio, isWorkspace, MAX_PANES } from "./validation";
import { createPane } from "./workspace";

const SHARE_PARAM = "pm";
const SHARE_VERSION = 1;
const MAX_TOKEN_LENGTH = 8000;
const MAX_DEPTH = 32;

/** Pane nodes become indexes into `u`, which keeps links short. */
type SharedLayout = number | { d: "r" | "c"; r: number; a: SharedLayout; b: SharedLayout };

interface SharedPayload {
  v: typeof SHARE_VERSION;
  n: string;
  p: LayoutPresetId | null;
  l: SharedLayout;
  u: string[];
}

function toBase64Url(text: string): string {
  let binary = "";
  for (const byte of new TextEncoder().encode(text)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(token: string): string {
  const binary = atob(token.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

export function encodeWorkspace(workspace: Workspace): string {
  const indexOf = new Map(workspace.paneOrder.map((id, index) => [id, index]));
  const encodeLayout = (node: LayoutNode): SharedLayout =>
    node.type === "pane"
      ? indexOf.get(node.paneId)!
      : {
          d: node.direction === "row" ? "r" : "c",
          r: Math.round(node.ratio * 1000) / 1000,
          a: encodeLayout(node.first),
          b: encodeLayout(node.second),
        };

  const payload: SharedPayload = {
    v: SHARE_VERSION,
    n: workspace.name,
    p: workspace.presetId,
    l: encodeLayout(workspace.layout),
    u: workspace.paneOrder.map((id) => workspace.panes[id].url),
  };
  return toBase64Url(JSON.stringify(payload));
}

/** Rebuilds a workspace from a share token, or returns `null` if anything looks off. */
export function decodeWorkspace(token: string): Workspace | null {
  if (!token || token.length > MAX_TOKEN_LENGTH) return null;

  let data: unknown;
  try {
    data = JSON.parse(fromBase64Url(token));
  } catch {
    return null;
  }
  if (!isRecord(data) || data.v !== SHARE_VERSION || !Array.isArray(data.u)) return null;
  if (data.u.length === 0 || data.u.length > MAX_PANES) return null;

  const panes = data.u.map((url) => createPane(typeof url === "string" ? url : ""));
  const decodeLayout = (node: unknown, depth: number): LayoutNode | null => {
    if (depth > MAX_DEPTH) return null;
    if (typeof node === "number") {
      const pane = Number.isInteger(node) ? panes[node] : undefined;
      return pane ? { type: "pane", paneId: pane.id } : null;
    }
    if (!isRecord(node) || (node.d !== "r" && node.d !== "c") || !isValidRatio(node.r)) {
      return null;
    }
    const first = decodeLayout(node.a, depth + 1);
    const second = decodeLayout(node.b, depth + 1);
    if (!first || !second) return null;
    return {
      type: "split",
      direction: node.d === "r" ? "row" : "column",
      ratio: node.r,
      first,
      second,
    };
  };

  const layout = decodeLayout(data.l, 0);
  if (!layout) return null;

  const workspace: Workspace = {
    id: crypto.randomUUID(),
    name: isSafeName(data.n) ? data.n.trim() : "Shared workspace",
    presetId: LAYOUT_PRESET_IDS.includes(data.p as never) ? (data.p as LayoutPresetId) : null,
    layout,
    panes: Object.fromEntries(panes.map((pane) => [pane.id, pane])),
    paneOrder: panes.map((pane) => pane.id),
  };
  // Re-checks addresses (http/https only) and that every pane appears at most once.
  return isWorkspace(workspace) ? workspace : null;
}

export function buildShareUrl(workspace: Workspace, baseUrl: string): string {
  return `${baseUrl}#${SHARE_PARAM}=${encodeWorkspace(workspace)}`;
}

export function readShareToken(hash: string): string | null {
  return new URLSearchParams(hash.replace(/^#/, "")).get(SHARE_PARAM);
}

export function removeShareToken(hash: string): string {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  params.delete(SHARE_PARAM);
  const rest = params.toString();
  return rest ? `#${rest}` : "";
}

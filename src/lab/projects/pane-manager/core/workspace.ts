import {
  LAYOUT_PRESETS,
  collectPaneIds,
  removePane,
  setRatioAt,
  swapPaneIds,
} from "./layoutTree";
import { DEFAULT_TEMPLATE_ID, getTemplate } from "./templates";
import type { LayoutNode, LayoutPath, LayoutPresetId, Pane, Workspace } from "./types";
import { MAX_NAME_LENGTH } from "./validation";

function createId() {
  return crypto.randomUUID();
}

export function createPane(url = ""): Pane {
  return { id: createId(), url };
}

export function createWorkspace(
  presetId: LayoutPresetId,
  urls: string[] = [],
  name = "My workspace"
): Workspace {
  const preset = LAYOUT_PRESETS[presetId];
  const panes = Array.from({ length: preset.paneCount }, (_, i) => createPane(urls[i] ?? ""));
  const paneOrder = panes.map((pane) => pane.id);

  return {
    id: createId(),
    name,
    presetId,
    layout: preset.build(paneOrder),
    panes: Object.fromEntries(panes.map((pane) => [pane.id, pane])),
    paneOrder,
  };
}

export function createWorkspaceFromTemplate(templateId: string, name?: string): Workspace {
  const template = getTemplate(templateId);
  return createWorkspace(template.presetId, template.urls, name ?? template.name);
}

export function createDefaultWorkspace(): Workspace {
  return createWorkspaceFromTemplate(DEFAULT_TEMPLATE_ID);
}

/** Deep copy with fresh workspace and pane ids, so it can live next to the original. */
export function cloneWorkspace(workspace: Workspace, name = workspace.name): Workspace {
  const idMap = new Map(workspace.paneOrder.map((id) => [id, createId()]));
  const remap = (node: LayoutNode): LayoutNode =>
    node.type === "pane"
      ? { ...node, paneId: idMap.get(node.paneId) ?? node.paneId }
      : { ...node, first: remap(node.first), second: remap(node.second) };

  return {
    id: createId(),
    name,
    presetId: workspace.presetId,
    layout: remap(workspace.layout),
    panes: Object.fromEntries(
      workspace.paneOrder.map((id) => {
        const newId = idMap.get(id)!;
        return [newId, { id: newId, url: workspace.panes[id].url }];
      })
    ),
    paneOrder: workspace.paneOrder.map((id) => idMap.get(id)!),
  };
}

export function renameWorkspace(workspace: Workspace, name: string): Workspace {
  const trimmed = name.trim().slice(0, MAX_NAME_LENGTH);
  if (!trimmed || trimmed === workspace.name) return workspace;
  return { ...workspace, name: trimmed };
}

/** Appends " 2", " 3", … until the name is not taken. */
export function uniqueName(name: string, taken: string[]): string {
  const base = name.trim().slice(0, MAX_NAME_LENGTH - 4) || "Workspace";
  if (!taken.includes(base)) return base;
  for (let n = 2; ; n++) {
    const candidate = `${base} ${n}`;
    if (!taken.includes(candidate)) return candidate;
  }
}

export function getVisiblePaneIds(workspace: Workspace): string[] {
  return collectPaneIds(workspace.layout);
}

/** Switches layout, reusing existing panes (and their URLs) in order before creating new ones. */
export function applyPreset(workspace: Workspace, presetId: LayoutPresetId): Workspace {
  const preset = LAYOUT_PRESETS[presetId];
  const panes = { ...workspace.panes };
  const paneOrder = [...workspace.paneOrder];

  while (paneOrder.length < preset.paneCount) {
    const pane = createPane();
    panes[pane.id] = pane;
    paneOrder.push(pane.id);
  }

  return {
    ...workspace,
    presetId,
    panes,
    paneOrder,
    layout: preset.build(paneOrder.slice(0, preset.paneCount)),
  };
}

export function setPaneUrl(workspace: Workspace, paneId: string, url: string): Workspace {
  const pane = workspace.panes[paneId];
  if (!pane || pane.url === url) return workspace;
  return { ...workspace, panes: { ...workspace.panes, [paneId]: { ...pane, url } } };
}

export function setSplitRatio(workspace: Workspace, path: LayoutPath, ratio: number): Workspace {
  const layout = setRatioAt(workspace.layout, path, ratio);
  return layout === workspace.layout ? workspace : { ...workspace, layout };
}

/** Swaps two panes' positions; `paneOrder` follows so switching presets keeps the new order. */
export function swapPanes(workspace: Workspace, a: string, b: string): Workspace {
  const indexA = workspace.paneOrder.indexOf(a);
  const indexB = workspace.paneOrder.indexOf(b);
  if (a === b || indexA === -1 || indexB === -1) return workspace;

  const paneOrder = [...workspace.paneOrder];
  paneOrder[indexA] = b;
  paneOrder[indexB] = a;

  return { ...workspace, paneOrder, layout: swapPaneIds(workspace.layout, a, b) };
}

export function closePane(workspace: Workspace, paneId: string): Workspace {
  const layout = removePane(workspace.layout, paneId);
  if (!layout) return workspace;

  const panes = { ...workspace.panes };
  delete panes[paneId];

  return {
    ...workspace,
    presetId: null,
    layout,
    panes,
    paneOrder: workspace.paneOrder.filter((id) => id !== paneId),
  };
}

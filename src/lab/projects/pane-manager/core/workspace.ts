import { LAYOUT_PRESETS, collectPaneIds, removePane } from "./layoutTree";
import type { LayoutPresetId, Pane, Workspace } from "./types";

function createId() {
  return crypto.randomUUID();
}

export function createPane(url = ""): Pane {
  return { id: createId(), url };
}

export function createWorkspace(presetId: LayoutPresetId, urls: string[] = []): Workspace {
  const preset = LAYOUT_PRESETS[presetId];
  const panes = Array.from({ length: preset.paneCount }, (_, i) => createPane(urls[i] ?? ""));
  const paneOrder = panes.map((pane) => pane.id);

  return {
    id: createId(),
    name: "My workspace",
    presetId,
    layout: preset.build(paneOrder),
    panes: Object.fromEntries(panes.map((pane) => [pane.id, pane])),
    paneOrder,
  };
}

export function createDefaultWorkspace(): Workspace {
  return createWorkspace("columns-2", [
    "https://excalidraw.com/",
    "https://en.wikipedia.org/wiki/Tiling_window_manager",
  ]);
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

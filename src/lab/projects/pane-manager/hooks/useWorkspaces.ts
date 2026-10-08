import { useEffect, useMemo, useReducer } from "react";
import {
  addWorkspaces,
  createDefaultCollection,
  duplicateWorkspace,
  getActiveWorkspace,
  removeWorkspace,
  switchWorkspace,
  updateActiveWorkspace,
  updateWorkspace,
  type WorkspaceCollection,
} from "../core/collection";
import { loadCollection, saveCollection } from "../core/storage";
import type { LayoutPath, LayoutPresetId, Workspace } from "../core/types";
import {
  applyPreset,
  closePane,
  createWorkspaceFromTemplate,
  renameWorkspace,
  setPaneUrl,
  setSplitRatio,
  swapPanes,
} from "../core/workspace";

type CollectionAction =
  | { type: "setUrl"; paneId: string; url: string }
  | { type: "applyPreset"; presetId: LayoutPresetId }
  | { type: "closePane"; paneId: string }
  | { type: "setRatio"; path: LayoutPath; ratio: number }
  | { type: "swapPanes"; a: string; b: string }
  | { type: "createFromTemplate"; templateId: string }
  | { type: "switch"; workspaceId: string }
  | { type: "rename"; workspaceId: string; name: string }
  | { type: "duplicate"; workspaceId: string }
  | { type: "remove"; workspaceId: string }
  | { type: "add"; workspaces: Workspace[] };

function collectionReducer(
  collection: WorkspaceCollection,
  action: CollectionAction
): WorkspaceCollection {
  switch (action.type) {
    case "setUrl":
      return updateActiveWorkspace(collection, (w) => setPaneUrl(w, action.paneId, action.url));
    case "applyPreset":
      return updateActiveWorkspace(collection, (w) => applyPreset(w, action.presetId));
    case "closePane":
      return updateActiveWorkspace(collection, (w) => closePane(w, action.paneId));
    case "setRatio":
      return updateActiveWorkspace(collection, (w) => setSplitRatio(w, action.path, action.ratio));
    case "swapPanes":
      return updateActiveWorkspace(collection, (w) => swapPanes(w, action.a, action.b));
    case "createFromTemplate":
      return addWorkspaces(collection, [createWorkspaceFromTemplate(action.templateId)]);
    case "switch":
      return switchWorkspace(collection, action.workspaceId);
    case "rename":
      return updateWorkspace(collection, action.workspaceId, (w) =>
        renameWorkspace(w, action.name)
      );
    case "duplicate":
      return duplicateWorkspace(collection, action.workspaceId);
    case "remove":
      return removeWorkspace(collection, action.workspaceId);
    case "add":
      return addWorkspaces(collection, action.workspaces);
  }
}

export function useWorkspaces() {
  const [collection, dispatch] = useReducer(
    collectionReducer,
    undefined,
    () => loadCollection() ?? createDefaultCollection()
  );

  useEffect(() => {
    saveCollection(collection);
  }, [collection]);

  const actions = useMemo(
    () => ({
      setUrl: (paneId: string, url: string) => dispatch({ type: "setUrl", paneId, url }),
      applyPreset: (presetId: LayoutPresetId) => dispatch({ type: "applyPreset", presetId }),
      closePane: (paneId: string) => dispatch({ type: "closePane", paneId }),
      setRatio: (path: LayoutPath, ratio: number) => dispatch({ type: "setRatio", path, ratio }),
      swapPanes: (a: string, b: string) => dispatch({ type: "swapPanes", a, b }),
      createFromTemplate: (templateId: string) =>
        dispatch({ type: "createFromTemplate", templateId }),
      switchTo: (workspaceId: string) => dispatch({ type: "switch", workspaceId }),
      rename: (workspaceId: string, name: string) =>
        dispatch({ type: "rename", workspaceId, name }),
      duplicate: (workspaceId: string) => dispatch({ type: "duplicate", workspaceId }),
      remove: (workspaceId: string) => dispatch({ type: "remove", workspaceId }),
      add: (workspaces: Workspace[]) => dispatch({ type: "add", workspaces }),
    }),
    []
  );

  return {
    workspaces: collection.workspaces,
    workspace: getActiveWorkspace(collection),
    ...actions,
  };
}

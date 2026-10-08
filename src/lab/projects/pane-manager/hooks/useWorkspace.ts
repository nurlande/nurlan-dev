import { useEffect, useReducer } from "react";
import { loadWorkspace, saveWorkspace } from "../core/storage";
import type { LayoutPresetId, Workspace } from "../core/types";
import {
  applyPreset,
  closePane,
  createDefaultWorkspace,
  setPaneUrl,
} from "../core/workspace";

type WorkspaceAction =
  | { type: "setUrl"; paneId: string; url: string }
  | { type: "applyPreset"; presetId: LayoutPresetId }
  | { type: "closePane"; paneId: string }
  | { type: "reset" };

function workspaceReducer(workspace: Workspace, action: WorkspaceAction): Workspace {
  switch (action.type) {
    case "setUrl":
      return setPaneUrl(workspace, action.paneId, action.url);
    case "applyPreset":
      return applyPreset(workspace, action.presetId);
    case "closePane":
      return closePane(workspace, action.paneId);
    case "reset":
      return createDefaultWorkspace();
  }
}

export function useWorkspace() {
  const [workspace, dispatch] = useReducer(
    workspaceReducer,
    undefined,
    () => loadWorkspace() ?? createDefaultWorkspace()
  );

  useEffect(() => {
    saveWorkspace(workspace);
  }, [workspace]);

  return {
    workspace,
    setUrl: (paneId: string, url: string) => dispatch({ type: "setUrl", paneId, url }),
    applyPreset: (presetId: LayoutPresetId) => dispatch({ type: "applyPreset", presetId }),
    closePane: (paneId: string) => dispatch({ type: "closePane", paneId }),
    reset: () => dispatch({ type: "reset" }),
  };
}

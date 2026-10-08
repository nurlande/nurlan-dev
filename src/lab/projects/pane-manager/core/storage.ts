import type { WorkspaceCollection } from "./collection";
import type { Workspace } from "./types";
import { isRecord, isWorkspace } from "./validation";

const STORAGE_KEY = "pane-manager:workspaces:v2";
const LEGACY_STORAGE_KEY = "pane-manager:workspace:v1";
const MAX_STORED_WORKSPACES = 100;

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Keeps every valid workspace, so one corrupted entry doesn't wipe the rest. */
export function loadCollection(): WorkspaceCollection | null {
  const data = readJson(STORAGE_KEY);
  if (isRecord(data) && Array.isArray(data.workspaces)) {
    const workspaces = data.workspaces
      .filter((workspace): workspace is Workspace => isWorkspace(workspace))
      .slice(0, MAX_STORED_WORKSPACES);
    if (workspaces.length > 0) {
      const activeId = workspaces.some((workspace) => workspace.id === data.activeId)
        ? (data.activeId as string)
        : workspaces[0].id;
      return { activeId, workspaces };
    }
  }

  const legacy = readJson(LEGACY_STORAGE_KEY);
  if (isWorkspace(legacy)) {
    return { activeId: legacy.id, workspaces: [legacy] };
  }
  return null;
}

export function saveCollection(collection: WorkspaceCollection) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, ...collection }));
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Storage can be full or disabled (private mode); the workspaces still work in memory.
  }
}

import type { Workspace } from "./types";
import { cloneWorkspace, createDefaultWorkspace, uniqueName } from "./workspace";

export interface WorkspaceCollection {
  activeId: string;
  /** Never empty. */
  workspaces: Workspace[];
}

export function createDefaultCollection(): WorkspaceCollection {
  const workspace = createDefaultWorkspace();
  return { activeId: workspace.id, workspaces: [workspace] };
}

export function getActiveWorkspace(collection: WorkspaceCollection): Workspace {
  return (
    collection.workspaces.find((workspace) => workspace.id === collection.activeId) ??
    collection.workspaces[0]
  );
}

export function updateActiveWorkspace(
  collection: WorkspaceCollection,
  update: (workspace: Workspace) => Workspace
): WorkspaceCollection {
  const active = getActiveWorkspace(collection);
  const next = update(active);
  if (next === active) return collection;
  return {
    ...collection,
    workspaces: collection.workspaces.map((workspace) =>
      workspace.id === active.id ? next : workspace
    ),
  };
}

export function updateWorkspace(
  collection: WorkspaceCollection,
  workspaceId: string,
  update: (workspace: Workspace) => Workspace
): WorkspaceCollection {
  let changed = false;
  const workspaces = collection.workspaces.map((workspace) => {
    if (workspace.id !== workspaceId) return workspace;
    const next = update(workspace);
    changed = next !== workspace;
    return next;
  });
  return changed ? { ...collection, workspaces } : collection;
}

export function switchWorkspace(
  collection: WorkspaceCollection,
  workspaceId: string
): WorkspaceCollection {
  if (collection.activeId === workspaceId) return collection;
  if (!collection.workspaces.some((workspace) => workspace.id === workspaceId)) return collection;
  return { ...collection, activeId: workspaceId };
}

/** Adds copies with fresh ids and unique names; the first one becomes active. */
export function addWorkspaces(
  collection: WorkspaceCollection,
  incoming: Workspace[]
): WorkspaceCollection {
  if (incoming.length === 0) return collection;

  const taken = collection.workspaces.map((workspace) => workspace.name);
  const added = incoming.map((workspace) => {
    const copy = cloneWorkspace(workspace, uniqueName(workspace.name, taken));
    taken.push(copy.name);
    return copy;
  });

  return { activeId: added[0].id, workspaces: [...collection.workspaces, ...added] };
}

export function duplicateWorkspace(
  collection: WorkspaceCollection,
  workspaceId: string
): WorkspaceCollection {
  const index = collection.workspaces.findIndex((workspace) => workspace.id === workspaceId);
  if (index === -1) return collection;

  const original = collection.workspaces[index];
  const taken = collection.workspaces.map((workspace) => workspace.name);
  const copy = cloneWorkspace(original, uniqueName(`${original.name} copy`, taken));
  const workspaces = [...collection.workspaces];
  workspaces.splice(index + 1, 0, copy);
  return { activeId: copy.id, workspaces };
}

/** Removing the last workspace replaces it with a fresh default one. */
export function removeWorkspace(
  collection: WorkspaceCollection,
  workspaceId: string
): WorkspaceCollection {
  const index = collection.workspaces.findIndex((workspace) => workspace.id === workspaceId);
  if (index === -1) return collection;

  const workspaces = collection.workspaces.filter((workspace) => workspace.id !== workspaceId);
  if (workspaces.length === 0) return createDefaultCollection();

  const activeId =
    collection.activeId === workspaceId
      ? workspaces[Math.min(index, workspaces.length - 1)].id
      : collection.activeId;
  return { activeId, workspaces };
}

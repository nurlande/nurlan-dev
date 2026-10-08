import type { Workspace } from "./types";
import { isRecord, isWorkspace } from "./validation";

const FILE_FORMAT = "pane-manager";
const FILE_VERSION = 1;
const MAX_IMPORT_WORKSPACES = 50;
export const MAX_IMPORT_BYTES = 1_000_000;

export function serializeWorkspaces(workspaces: Workspace[]): string {
  return JSON.stringify(
    {
      format: FILE_FORMAT,
      version: FILE_VERSION,
      exportedAt: new Date().toISOString(),
      workspaces,
    },
    null,
    2
  );
}

export type ImportResult =
  | { ok: true; workspaces: Workspace[]; skipped: number }
  | { ok: false; error: string };

/** Accepts an exported file or a single workspace object. Invalid workspaces are skipped. */
export function parseWorkspaceFile(text: string): ImportResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: "That file isn't valid JSON." };
  }

  let candidates: unknown[];
  if (isRecord(data) && data.format === FILE_FORMAT && Array.isArray(data.workspaces)) {
    if (data.version !== FILE_VERSION) {
      return { ok: false, error: "That file comes from a newer version of Pane Manager." };
    }
    candidates = data.workspaces;
  } else if (isWorkspace(data)) {
    candidates = [data];
  } else {
    return { ok: false, error: "That file isn't a Pane Manager export." };
  }

  const limited = candidates.slice(0, MAX_IMPORT_WORKSPACES);
  const workspaces = limited.filter((candidate): candidate is Workspace => isWorkspace(candidate));
  const skipped = candidates.length - workspaces.length;

  if (workspaces.length === 0) {
    return { ok: false, error: "No usable workspaces were found in that file." };
  }
  return { ok: true, workspaces, skipped };
}

export function downloadTextFile(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function exportFilename(label: string): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `pane-manager-${slug || "workspace"}.json`;
}

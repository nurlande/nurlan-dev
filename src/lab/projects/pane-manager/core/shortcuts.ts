import type { NeighborDirection } from "./types";

export type ShortcutCommand =
  | { type: "preset"; index: number }
  | { type: "focus"; direction: NeighborDirection }
  | { type: "swap"; direction: NeighborDirection }
  | { type: "maximize" }
  | { type: "address" };

const IS_MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);

const ARROW_DIRECTIONS: Record<string, NeighborDirection> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
};

export function shortcutLabel(key: string, { shift = false } = {}): string {
  if (IS_MAC) return `⌥${shift ? "⇧" : ""}${key === "Enter" ? "↩" : key}`;
  return `Alt+${shift ? "Shift+" : ""}${key}`;
}

/** All shortcuts use Alt (Option on Mac); `code` is used because Option changes `key` on Mac. */
export function matchShortcut(
  e: Pick<KeyboardEvent, "altKey" | "ctrlKey" | "metaKey" | "shiftKey" | "code" | "key">
): ShortcutCommand | null {
  if (!e.altKey || e.ctrlKey || e.metaKey) return null;

  const direction = ARROW_DIRECTIONS[e.key];
  if (direction) return { type: e.shiftKey ? "swap" : "focus", direction };
  if (e.shiftKey) return null;

  const digit = /^Digit([1-9])$/.exec(e.code);
  if (digit) return { type: "preset", index: Number(digit[1]) - 1 };
  if (e.code === "Enter") return { type: "maximize" };
  if (e.code === "KeyL") return { type: "address" };
  return null;
}

export const SHORTCUT_HELP: { keys: string; description: string }[] = [
  { keys: shortcutLabel("1–5"), description: "Switch layout" },
  { keys: shortcutLabel("←↑↓→"), description: "Move to the neighbouring pane" },
  { keys: shortcutLabel("←↑↓→", { shift: true }), description: "Swap with the neighbouring pane" },
  { keys: shortcutLabel("Enter"), description: "Maximize or restore the current pane" },
  { keys: shortcutLabel("L"), description: "Edit the current pane's address" },
  { keys: "Esc", description: "Restore a maximized pane, then exit" },
];

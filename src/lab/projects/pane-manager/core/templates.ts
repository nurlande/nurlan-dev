import type { LayoutPresetId } from "./types";

export interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  presetId: LayoutPresetId;
  urls: string[];
}

export const DEFAULT_TEMPLATE_ID = "sketch-research";

export const WORKSPACE_TEMPLATES: WorkspaceTemplate[] = [
  {
    id: "blank",
    name: "Blank",
    description: "One empty pane to start from.",
    presetId: "single",
    urls: [],
  },
  {
    id: DEFAULT_TEMPLATE_ID,
    name: "Sketch & research",
    description: "A whiteboard next to an article.",
    presetId: "columns-2",
    urls: ["https://excalidraw.com/", "https://en.wikipedia.org/wiki/Tiling_window_manager"],
  },
  {
    id: "frontend-docs",
    name: "Frontend docs",
    description: "React docs up front, Vite docs and a TypeScript playground beside them.",
    presetId: "main-plus-2",
    urls: ["https://react.dev/", "https://vite.dev/", "https://www.typescriptlang.org/play"],
  },
  {
    id: "playground",
    name: "Code playground",
    description: "TypeScript Playground and StackBlitz side by side.",
    presetId: "columns-2",
    urls: ["https://www.typescriptlang.org/play", "https://stackblitz.com/"],
  },
  {
    id: "explore-bishkek",
    name: "Explore Bishkek",
    description: "A city map stacked over its Wikipedia article.",
    presetId: "rows-2",
    urls: [
      "https://www.openstreetmap.org/export/embed.html?bbox=74.50,42.80,74.70,42.92&layer=mapnik",
      "https://en.wikipedia.org/wiki/Bishkek",
    ],
  },
  {
    id: "empty-grid",
    name: "Empty grid",
    description: "Four empty panes, ready for anything.",
    presetId: "grid-4",
    urls: [],
  },
];

export function getTemplate(templateId: string): WorkspaceTemplate {
  return (
    WORKSPACE_TEMPLATES.find((template) => template.id === templateId) ??
    WORKSPACE_TEMPLATES.find((template) => template.id === DEFAULT_TEMPLATE_ID)!
  );
}

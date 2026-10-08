export type MiniProjectStatus = "draft" | "ready";

export interface MiniProject {
  id: string;
  title: string;
  description: string;
  technologies?: string[];
  status: MiniProjectStatus;
}

/**
 * Register mini projects here, then add a matching component
 * in `src/lab/projects/` and map it in `src/lab/registry.ts`.
 */
export const miniProjects: MiniProject[] = [
  {
    id: "pane-manager",
    title: "Pane Manager",
    description:
      "Several sites side by side in one tab — tiled layouts, per-pane addresses, remembered between visits.",
    technologies: ["React", "TypeScript", "iframes", "Layout trees"],
    status: "draft",
  },
  {
    id: "echo-drawer",
    title: "Echo Drawer",
    description:
      "Draw a stroke and it replays itself — delayed, mirrored, slowed down, or glitched.",
    technologies: ["React", "TypeScript", "Canvas"],
    status: "draft",
  },
  {
    id: "orbit-clock",
    title: "Orbit Clock",
    description:
      "Time as a tiny solar system — hours, minutes, and seconds orbit a sun that follows the day.",
    technologies: ["React", "TypeScript", "SVG"],
    status: "draft",
  },
  {
    id: "window-pet",
    title: "Window Pet",
    description:
      "A tiny creature that lives on the bottom edge of your window — pet it, feed it, throw it.",
    technologies: ["React", "TypeScript", "SVG", "requestAnimationFrame"],
    status: "draft",
  },
  {
    id: "emoji-view",
    title: "Emoji View",
    description:
      "Build and customize emoji faces from SVG — starting with a simple smile.",
    technologies: ["React", "TypeScript", "SVG"],
    status: "draft",
  },
  {
    id: "hello-lab",
    title: "Hello Lab",
    description:
      "A starter mini project. Replace or extend this as you build new experiments.",
    technologies: ["React", "TypeScript", "MUI"],
    status: "ready",
  },
];

export function getMiniProject(id: string): MiniProject | undefined {
  return miniProjects.find((project) => project.id === id);
}

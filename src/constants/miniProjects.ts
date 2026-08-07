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

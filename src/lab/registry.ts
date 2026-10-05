import { lazy, type ComponentType } from "react";

/**
 * Maps mini project ids (from `constants/miniProjects.ts`) to their
 * lazy-loaded UI components under `src/lab/projects/`.
 */
export const miniProjectRegistry: Record<
  string,
  () => Promise<{ default: ComponentType }>
> = {
  "echo-drawer": () => import("./projects/EchoDrawer"),
  "orbit-clock": () => import("./projects/OrbitClock"),
  "window-pet": () => import("./projects/WindowPet"),
  "emoji-view": () => import("./projects/EmojiView"),
  "hello-lab": () => import("./projects/HelloLab"),
};

export function loadMiniProject(id: string) {
  const loader = miniProjectRegistry[id];
  return loader ? lazy(loader) : null;
}

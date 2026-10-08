import { useMemo } from "react";
import { Box } from "@mui/material";
import { computePaneRects } from "../core/layoutTree";
import type { Workspace } from "../core/types";
import Pane from "./Pane";

interface LayoutRendererProps {
  workspace: Workspace;
  onUrlChange: (paneId: string, url: string) => void;
  onClose: (paneId: string) => void;
}

/**
 * Panes are rendered as a flat, absolutely positioned list keyed by pane id, so
 * changing the layout moves iframes instead of remounting (and reloading) them.
 * Panes outside the layout stay mounted but hidden.
 */
export default function LayoutRenderer({ workspace, onUrlChange, onClose }: LayoutRendererProps) {
  const rects = useMemo(() => computePaneRects(workspace.layout), [workspace.layout]);
  const visibleCount = Object.keys(rects).length;

  return (
    <Box sx={{ position: "relative", flex: 1, minHeight: 0 }}>
      {workspace.paneOrder.map((paneId) => {
        const pane = workspace.panes[paneId];
        const rect = rects[paneId];

        return (
          <Box
            key={paneId}
            style={{
              display: rect ? "block" : "none",
              left: `${rect?.x ?? 0}%`,
              top: `${rect?.y ?? 0}%`,
              width: `${rect?.w ?? 100}%`,
              height: `${rect?.h ?? 100}%`,
            }}
            sx={{ position: "absolute", p: 0.5 }}
          >
            <Pane
              pane={pane}
              canClose={visibleCount > 1}
              onUrlChange={(url) => onUrlChange(paneId, url)}
              onClose={() => onClose(paneId)}
            />
          </Box>
        );
      })}
    </Box>
  );
}

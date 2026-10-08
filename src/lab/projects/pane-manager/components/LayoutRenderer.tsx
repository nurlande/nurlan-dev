import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { FULL_RECT, clampRatio, computeDividers, findPaneAt } from "../core/layoutTree";
import type { Divider as DividerData, LayoutPath, Rect, Workspace } from "../core/types";
import Divider from "./Divider";
import Pane from "./Pane";

const MIN_PANE_PX = 200;

type Interaction =
  | {
      kind: "resize";
      divider: DividerData;
      /** The split's on-screen box, measured when the drag starts. */
      bounds: { left: number; top: number; width: number; height: number };
    }
  | { kind: "swap"; sourceId: string; targetId: string | null };

interface LayoutRendererProps {
  workspace: Workspace;
  /** Pane rects for the current layout, ignoring maximize. */
  rects: Record<string, Rect>;
  activePaneId: string | null;
  maximizedPaneId: string | null;
  onActivate: (paneId: string) => void;
  onUrlChange: (paneId: string, url: string) => void;
  onClose: (paneId: string) => void;
  onToggleMaximize: (paneId: string) => void;
  onResize: (path: LayoutPath, ratio: number) => void;
  onSwap: (a: string, b: string) => void;
}

/**
 * Panes are rendered as a flat, absolutely positioned list keyed by pane id, so
 * changing the layout moves iframes instead of remounting (and reloading) them.
 * Panes outside the layout stay mounted but hidden.
 */
export default function LayoutRenderer({
  workspace,
  rects,
  activePaneId,
  maximizedPaneId,
  onActivate,
  onUrlChange,
  onClose,
  onToggleMaximize,
  onResize,
  onSwap,
}: LayoutRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [interaction, setInteraction] = useState<Interaction | null>(null);

  const visibleCount = Object.keys(rects).length;
  const shownRects = useMemo(
    () => (maximizedPaneId ? { [maximizedPaneId]: FULL_RECT } : rects),
    [maximizedPaneId, rects]
  );
  const dividers = useMemo(
    () => (maximizedPaneId ? [] : computeDividers(workspace.layout)),
    [maximizedPaneId, workspace.layout]
  );

  useEffect(() => {
    if (!interaction) return;

    const toPercent = (e: globalThis.PointerEvent) => {
      const box = containerRef.current?.getBoundingClientRect();
      if (!box || box.width === 0 || box.height === 0) return null;
      return {
        x: ((e.clientX - box.left) / box.width) * 100,
        y: ((e.clientY - box.top) / box.height) * 100,
      };
    };

    const handleMove = (e: globalThis.PointerEvent) => {
      if (interaction.kind === "resize") {
        const { divider, bounds } = interaction;
        const vertical = divider.direction === "row";
        const size = vertical ? bounds.width : bounds.height;
        if (size <= 0) return;
        const offset = vertical ? e.clientX - bounds.left : e.clientY - bounds.top;
        onResize(divider.path, clampRatio(offset / size, MIN_PANE_PX / size));
        return;
      }

      const point = toPercent(e);
      const targetId = point ? findPaneAt(rects, point.x, point.y) : null;
      if (targetId !== interaction.targetId) {
        setInteraction({ ...interaction, targetId });
      }
    };

    const handleUp = () => {
      if (
        interaction.kind === "swap" &&
        interaction.targetId &&
        interaction.targetId !== interaction.sourceId
      ) {
        onSwap(interaction.sourceId, interaction.targetId);
      }
      setInteraction(null);
    };

    const cancel = () => setInteraction(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      cancel();
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", cancel);
    window.addEventListener("blur", cancel);
    // Capture phase, so Escape cancels the drag before it can close the workspace.
    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", cancel);
      window.removeEventListener("blur", cancel);
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [interaction, rects, onResize, onSwap]);

  const startResize = (divider: DividerData, e: PointerEvent<HTMLDivElement>) => {
    const box = containerRef.current?.getBoundingClientRect();
    if (e.button !== 0 || !box) return;
    e.preventDefault();
    const { splitRect } = divider;
    setInteraction({
      kind: "resize",
      divider,
      bounds: {
        left: box.left + (splitRect.x / 100) * box.width,
        top: box.top + (splitRect.y / 100) * box.height,
        width: (splitRect.w / 100) * box.width,
        height: (splitRect.h / 100) * box.height,
      },
    });
  };

  const startSwap = (paneId: string, e: PointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    onActivate(paneId);
    setInteraction({ kind: "swap", sourceId: paneId, targetId: paneId });
  };

  const swapTarget =
    interaction?.kind === "swap" && interaction.targetId !== interaction.sourceId
      ? interaction.targetId
      : null;
  const swapTargetRect = swapTarget ? rects[swapTarget] : null;
  const overlayCursor =
    interaction?.kind === "resize"
      ? interaction.divider.direction === "row"
        ? "col-resize"
        : "row-resize"
      : "grabbing";

  return (
    <Box ref={containerRef} sx={{ position: "relative", flex: 1, minHeight: 0 }}>
      {workspace.paneOrder.map((paneId) => {
        const pane = workspace.panes[paneId];
        const rect = shownRects[paneId];
        const isMaximized = paneId === maximizedPaneId;

        return (
          <Box
            key={paneId}
            data-pane-id={paneId}
            tabIndex={-1}
            onFocus={() => onActivate(paneId)}
            onPointerDownCapture={() => onActivate(paneId)}
            style={{
              display: rect ? "block" : "none",
              left: `${rect?.x ?? 0}%`,
              top: `${rect?.y ?? 0}%`,
              width: `${rect?.w ?? 100}%`,
              height: `${rect?.h ?? 100}%`,
              opacity: interaction?.kind === "swap" && interaction.sourceId === paneId ? 0.45 : 1,
            }}
            sx={{ position: "absolute", p: 0.5, outline: "none" }}
          >
            <Pane
              pane={pane}
              active={visibleCount > 1 && paneId === activePaneId}
              maximized={isMaximized}
              canClose={visibleCount > 1}
              canArrange={visibleCount > 1 && !maximizedPaneId}
              onUrlChange={(url) => onUrlChange(paneId, url)}
              onClose={() => onClose(paneId)}
              onToggleMaximize={() => onToggleMaximize(paneId)}
              onDragHandlePointerDown={(e) => startSwap(paneId, e)}
            />
          </Box>
        );
      })}

      {dividers.map((divider) => (
        <Divider
          key={divider.path.join("-") || "root"}
          divider={divider}
          active={
            interaction?.kind === "resize" &&
            interaction.divider.path.join("-") === divider.path.join("-")
          }
          onResizeStart={startResize}
          onResize={(target, ratio) => onResize(target.path, ratio)}
        />
      ))}

      {swapTargetRect && (
        <Box
          aria-hidden
          style={{
            left: `${swapTargetRect.x}%`,
            top: `${swapTargetRect.y}%`,
            width: `${swapTargetRect.w}%`,
            height: `${swapTargetRect.h}%`,
          }}
          sx={{ position: "absolute", zIndex: 3, p: 0.5, pointerEvents: "none" }}
        >
          <Box
            sx={(theme) => ({
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              borderRadius: 1.5,
              border: `2px dashed ${theme.palette.primary.main}`,
              bgcolor: alpha(theme.palette.primary.main, 0.14),
              color: "primary.main",
            })}
          >
            <SwapHorizIcon />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Drop to swap
            </Typography>
          </Box>
        </Box>
      )}

      {interaction && (
        // Covers the iframes so they can't swallow pointer events mid-drag.
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 4,
            cursor: overlayCursor,
            userSelect: "none",
          }}
        />
      )}
    </Box>
  );
}

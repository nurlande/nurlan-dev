import type { KeyboardEvent, PointerEvent } from "react";
import { Box } from "@mui/material";
import { clampRatio } from "../core/layoutTree";
import type { Divider as DividerData } from "../core/types";

const HIT_SIZE = 10;
const KEY_STEP = 0.02;
const KEY_STEP_LARGE = 0.1;
const KEY_MIN_RATIO = 0.1;

interface DividerProps {
  divider: DividerData;
  active: boolean;
  onResizeStart: (divider: DividerData, e: PointerEvent<HTMLDivElement>) => void;
  onResize: (divider: DividerData, ratio: number) => void;
}

export default function Divider({ divider, active, onResizeStart, onResize }: DividerProps) {
  const { direction, ratio, splitRect } = divider;
  const vertical = direction === "row";

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;

    const step = e.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
    const decrease = vertical ? "ArrowLeft" : "ArrowUp";
    const increase = vertical ? "ArrowRight" : "ArrowDown";
    let next: number | null = null;

    if (e.key === decrease) next = ratio - step;
    else if (e.key === increase) next = ratio + step;
    else if (e.key === "Home") next = KEY_MIN_RATIO;
    else if (e.key === "End") next = 1 - KEY_MIN_RATIO;
    else if (e.key === "Enter") next = 0.5;
    if (next === null) return;

    e.preventDefault();
    onResize(divider, clampRatio(next, KEY_MIN_RATIO));
  };

  const position = vertical
    ? {
        left: `${splitRect.x + splitRect.w * ratio}%`,
        top: `${splitRect.y}%`,
        width: HIT_SIZE,
        height: `${splitRect.h}%`,
        transform: "translateX(-50%)",
      }
    : {
        left: `${splitRect.x}%`,
        top: `${splitRect.y + splitRect.h * ratio}%`,
        width: `${splitRect.w}%`,
        height: HIT_SIZE,
        transform: "translateY(-50%)",
      };

  return (
    <Box
      role="separator"
      tabIndex={0}
      aria-label={vertical ? "Resize panes left and right" : "Resize panes up and down"}
      aria-orientation={vertical ? "vertical" : "horizontal"}
      aria-valuemin={Math.round(KEY_MIN_RATIO * 100)}
      aria-valuemax={Math.round((1 - KEY_MIN_RATIO) * 100)}
      aria-valuenow={Math.round(ratio * 100)}
      data-active={active || undefined}
      onPointerDown={(e) => onResizeStart(divider, e)}
      onDoubleClick={() => onResize(divider, 0.5)}
      onKeyDown={handleKeyDown}
      style={position}
      sx={{
        position: "absolute",
        zIndex: 2,
        cursor: vertical ? "col-resize" : "row-resize",
        touchAction: "none",
        outline: "none",
        "&::after": {
          content: '""',
          position: "absolute",
          inset: vertical ? "8px 4px" : "4px 8px",
          borderRadius: 1,
          bgcolor: "primary.main",
          opacity: 0,
          transition: "opacity 120ms",
        },
        "&:hover::after, &:focus-visible::after, &[data-active]::after": { opacity: 1 },
      }}
    />
  );
}

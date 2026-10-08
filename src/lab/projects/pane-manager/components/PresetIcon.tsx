import { computePaneRects, LAYOUT_PRESETS } from "../core/layoutTree";
import type { LayoutPresetId } from "../core/types";

const WIDTH = 24;
const HEIGHT = 16;
const GAP = 1;

export default function PresetIcon({ presetId }: { presetId: LayoutPresetId }) {
  const preset = LAYOUT_PRESETS[presetId];
  const ids = Array.from({ length: preset.paneCount }, (_, i) => String(i));
  const rects = Object.values(computePaneRects(preset.build(ids)));

  return (
    <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} aria-hidden="true">
      {rects.map((rect, i) => (
        <rect
          key={i}
          x={(rect.x / 100) * WIDTH + GAP}
          y={(rect.y / 100) * HEIGHT + GAP}
          width={(rect.w / 100) * WIDTH - GAP * 2}
          height={(rect.h / 100) * HEIGHT - GAP * 2}
          rx={1.5}
          fill="currentColor"
          opacity={0.85}
        />
      ))}
    </svg>
  );
}

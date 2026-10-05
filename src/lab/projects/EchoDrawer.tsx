import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  Slider,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

type EchoMode = "drift" | "mirror-x" | "mirror-y" | "kaleidoscope";

interface Settings {
  mode: EchoMode;
  echoes: number;
  delay: number;
  speed: number;
  glitch: number;
  fade: boolean;
}

interface Point {
  x: number;
  y: number;
}

interface TimedPoint extends Point {
  t: number;
}

interface Stroke {
  points: TimedPoint[];
  startedAt: number;
  hue: number;
  drawing: boolean;
}

const CANVAS_HEIGHT = 420;
const FADE_MS = 2500;
const DRIFT = 16;
const MAX_STROKES = 60;
const BG = "#0B1020";

const MODES: { value: EchoMode; label: string }[] = [
  { value: "drift", label: "Drift" },
  { value: "mirror-x", label: "Mirror X" },
  { value: "mirror-y", label: "Mirror Y" },
  { value: "kaleidoscope", label: "Kaleido" },
];

const PRESETS: { label: string; settings: Settings }[] = [
  {
    label: "Ghost trail",
    settings: { mode: "drift", echoes: 3, delay: 0.35, speed: 1, glitch: 0, fade: true },
  },
  {
    label: "Mirror lake",
    settings: { mode: "mirror-y", echoes: 1, delay: 0.25, speed: 1, glitch: 0, fade: true },
  },
  {
    label: "Kaleidoscope",
    settings: { mode: "kaleidoscope", echoes: 3, delay: 0.2, speed: 1.5, glitch: 0, fade: false },
  },
  {
    label: "Broken tape",
    settings: { mode: "drift", echoes: 4, delay: 0.6, speed: 0.75, glitch: 7, fade: true },
  },
];

function echoTransform(mode: EchoMode, i: number, w: number, h: number) {
  const cx = w / 2;
  const cy = h / 2;

  switch (mode) {
    case "drift":
      return (p: Point) => ({ x: p.x + DRIFT * i, y: p.y + DRIFT * i });
    case "mirror-x": {
      const s = 1 - 0.12 * (i - 1);
      return (p: Point) => ({ x: cx - (p.x - cx) * s, y: cy + (p.y - cy) * s });
    }
    case "mirror-y": {
      const s = 1 - 0.12 * (i - 1);
      return (p: Point) => ({ x: cx + (p.x - cx) * s, y: cy - (p.y - cy) * s });
    }
    case "kaleidoscope": {
      const flips = [
        [-1, 1],
        [1, -1],
        [-1, -1],
      ] as const;
      const [fx, fy] = flips[(i - 1) % 3];
      const s = 1 - 0.15 * Math.floor((i - 1) / 3);
      return (p: Point) => ({ x: cx + (p.x - cx) * fx * s, y: cy + (p.y - cy) * fy * s });
    }
  }
}

function visiblePoints(points: TimedPoint[], elapsed: number) {
  let end = 0;
  while (end < points.length && points[end].t <= elapsed) end += 1;
  return points.slice(0, end);
}

function strokeWith(ctx: CanvasRenderingContext2D, pts: Point[], color: string, width: number) {
  if (pts.length === 0) return;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (pts.length === 1) {
    ctx.beginPath();
    ctx.arc(pts[0].x, pts[0].y, width / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length - 1; i++) {
    const midX = (pts[i].x + pts[i + 1].x) / 2;
    const midY = (pts[i].y + pts[i + 1].y) / 2;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
  }
  const last = pts[pts.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
}

function strokeGlitched(
  ctx: CanvasRenderingContext2D,
  pts: Point[],
  glitch: number,
  hue: number,
  alpha: number,
  width: number
) {
  const jitter = glitch * 1.2;
  const shaken = pts.map((p) => ({
    x: p.x + (Math.random() - 0.5) * jitter,
    y: p.y + (Math.random() - 0.5) * jitter,
  }));

  if (shaken.length > 4 && Math.random() < glitch * 0.03) {
    const start = Math.floor(Math.random() * shaken.length);
    const end = Math.min(shaken.length, start + 4 + Math.floor(Math.random() * 20));
    const shift = (Math.random() - 0.5) * glitch * 8;
    for (let k = start; k < end; k++) {
      shaken[k] = { x: shaken[k].x + shift, y: shaken[k].y };
    }
  }

  const split = glitch * 0.6;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  strokeWith(
    ctx,
    shaken.map((p) => ({ x: p.x - split, y: p.y })),
    `rgba(255, 60, 90, ${alpha * 0.7})`,
    width
  );
  strokeWith(
    ctx,
    shaken.map((p) => ({ x: p.x + split, y: p.y })),
    `rgba(60, 220, 255, ${alpha * 0.7})`,
    width
  );
  ctx.restore();
  strokeWith(ctx, shaken, `hsla(${hue}, 90%, 62%, ${alpha * 0.8})`, width);
}

function LabeledSlider({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline">
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontVariantNumeric: "tabular-nums" }}
        >
          {display}
        </Typography>
      </Stack>
      <Slider
        size="small"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(_, next) => onChange(next as number)}
        aria-label={label}
      />
    </Box>
  );
}

export default function EchoDrawer() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ w: 0, h: CANVAS_HEIGHT });
  const strokesRef = useRef<Stroke[]>([]);
  const activeRef = useRef<Stroke | null>(null);
  const hueRef = useRef(Math.floor(Math.random() * 360));

  const [settings, setSettings] = useState<Settings>(PRESETS[0].settings);
  const settingsRef = useRef(settings);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!wrap || !canvas || !ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = wrap.clientWidth;
      sizeRef.current = { w, h: CANVAS_HEIGHT };
      canvas.width = w * dpr;
      canvas.height = CANVAS_HEIGHT * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);

    let raf = 0;
    const render = (now: number) => {
      const { w, h } = sizeRef.current;
      const s = settingsRef.current;

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);

      strokesRef.current = strokesRef.current.filter((stroke) => {
        const duration = stroke.points[stroke.points.length - 1].t;
        let alpha = 1;

        if (!stroke.drawing && s.fade) {
          const lastEchoEnd = stroke.startedAt + s.delay * 1000 * s.echoes + duration / s.speed;
          const end = Math.max(stroke.startedAt + duration, lastEchoEnd);
          alpha = Math.min(1, 1 - (now - end) / FADE_MS);
          if (alpha <= 0) return false;
        }

        for (let i = s.echoes; i >= 1; i--) {
          const elapsed = (now - stroke.startedAt - s.delay * 1000 * i) * s.speed;
          if (elapsed < 0) continue;

          const transform = echoTransform(s.mode, i, w, h);
          const pts = visiblePoints(stroke.points, elapsed).map(transform);
          const echoAlpha = alpha * (1 - (i / (s.echoes + 1)) * 0.6);
          const width = Math.max(1.5, 5 - i * 0.6);
          const hue = stroke.hue + i * 40;

          if (s.glitch > 0) {
            strokeGlitched(ctx, pts, s.glitch, hue, echoAlpha, width);
          } else {
            strokeWith(ctx, pts, `hsla(${hue}, 90%, 62%, ${echoAlpha})`, width);
          }
        }

        strokeWith(ctx, stroke.points, `hsla(${stroke.hue}, 90%, 78%, ${alpha})`, 5);
        return true;
      });

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  const toCanvasPoint = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const stroke: Stroke = {
      points: [{ ...toCanvasPoint(e), t: 0 }],
      startedAt: performance.now(),
      hue: hueRef.current,
      drawing: true,
    };
    hueRef.current = (hueRef.current + 37) % 360;
    strokesRef.current.push(stroke);
    if (strokesRef.current.length > MAX_STROKES) {
      strokesRef.current.shift();
    }
    activeRef.current = stroke;
    setHasDrawn(true);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const stroke = activeRef.current;
    if (!stroke) return;
    const p = toCanvasPoint(e);
    const last = stroke.points[stroke.points.length - 1];
    if (Math.hypot(p.x - last.x, p.y - last.y) < 1.5) return;
    stroke.points.push({ ...p, t: performance.now() - stroke.startedAt });
  };

  const handlePointerUp = () => {
    if (activeRef.current) {
      activeRef.current.drawing = false;
      activeRef.current = null;
    }
  };

  const clear = () => {
    strokesRef.current = [];
    activeRef.current = null;
  };

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Box
      sx={{
        py: 6,
        px: { xs: 2, sm: 4 },
        textAlign: "center",
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: (theme) =>
          theme.palette.mode === "light"
            ? "rgba(255, 255, 255, 0.7)"
            : "rgba(26, 31, 58, 0.7)",
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        Echo Drawer
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 440, mx: "auto" }}>
        Draw a stroke and watch it come back — late, bent, and a little haunted.
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        flexWrap="wrap"
        useFlexGap
        sx={{ mb: 2 }}
      >
        {PRESETS.map((preset) => (
          <Chip
            key={preset.label}
            label={preset.label}
            clickable
            variant="outlined"
            onClick={() => setSettings(preset.settings)}
          />
        ))}
      </Stack>

      <Box
        ref={wrapRef}
        sx={{
          position: "relative",
          width: "100%",
          height: CANVAS_HEIGHT,
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          mb: 3,
        }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            display: "block",
            width: "100%",
            height: CANVAS_HEIGHT,
            touchAction: "none",
            cursor: "crosshair",
          }}
        />
        {!hasDrawn && (
          <Typography
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255, 255, 255, 0.45)",
              pointerEvents: "none",
            }}
          >
            Draw anything — your echoes will follow.
          </Typography>
        )}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={settings.mode}
          onChange={(_, next: EchoMode | null) => {
            if (next) update("mode", next);
          }}
          aria-label="Echo mode"
          sx={{ flexWrap: "wrap", justifyContent: "center" }}
        >
          {MODES.map((mode) => (
            <ToggleButton key={mode.value} value={mode.value} sx={{ textTransform: "none", px: 2 }}>
              {mode.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          columnGap: 4,
          rowGap: 1.5,
          maxWidth: 560,
          mx: "auto",
          textAlign: "left",
          mb: 2,
        }}
      >
        <LabeledSlider
          label="Echoes"
          value={settings.echoes}
          display={`${settings.echoes}`}
          min={1}
          max={5}
          step={1}
          onChange={(v) => update("echoes", v)}
        />
        <LabeledSlider
          label="Delay"
          value={settings.delay}
          display={`${settings.delay.toFixed(2)} s`}
          min={0.1}
          max={1.5}
          step={0.05}
          onChange={(v) => update("delay", v)}
        />
        <LabeledSlider
          label="Replay speed"
          value={settings.speed}
          display={`${settings.speed}×`}
          min={0.25}
          max={2}
          step={0.25}
          onChange={(v) => update("speed", v)}
        />
        <LabeledSlider
          label="Glitch"
          value={settings.glitch}
          display={`${settings.glitch}`}
          min={0}
          max={10}
          step={1}
          onChange={(v) => update("glitch", v)}
        />
      </Box>

      <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
        <FormControlLabel
          control={
            <Switch checked={settings.fade} onChange={(e) => update("fade", e.target.checked)} />
          }
          label="Fade out"
        />
        <Button variant="outlined" onClick={clear} sx={{ textTransform: "none", fontWeight: 600 }}>
          Clear
        </Button>
      </Stack>
    </Box>
  );
}

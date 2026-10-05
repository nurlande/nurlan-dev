import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

const WARPS = [1, 60, 3600] as const;
type Warp = (typeof WARPS)[number];

const WARP_LABELS: Record<Warp, string> = {
  1: "Real time",
  60: "1 sec = 1 min",
  3600: "1 sec = 1 hour",
};

const ORBITS = {
  hour: { r: 52, size: 11, color: "#81C784", label: "Hours" },
  minute: { r: 92, size: 8, color: "#4FC3F7", label: "Minutes" },
  second: { r: 132, size: 5, color: "#F48FB1", label: "Seconds" },
} as const;

const COMET_TRAIL = 7;

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

/** Position on an orbit, where fraction 0 is 12 o'clock and runs clockwise. */
function polar(r: number, fraction: number) {
  const angle = fraction * Math.PI * 2 - Math.PI / 2;
  return { x: r * Math.cos(angle), y: r * Math.sin(angle) };
}

function arcPath(r: number, fraction: number) {
  if (fraction <= 0.0005) return "";
  if (fraction >= 0.9995) {
    return `M 0 ${-r} A ${r} ${r} 0 1 1 0 ${r} A ${r} ${r} 0 1 1 0 ${-r}`;
  }
  const end = polar(r, fraction);
  const largeArc = fraction > 0.5 ? 1 : 0;
  return `M 0 ${-r} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function dayPhase(hour: number) {
  if (hour < 5 || hour >= 21) return { label: "Night", color: "#9FB4FF" };
  if (hour < 8) return { label: "Dawn", color: "#FFB37A" };
  if (hour < 17) return { label: "Day", color: "#FFD54F" };
  return { label: "Dusk", color: "#FF8A65" };
}

function OrbitRing({
  r,
  fraction,
  color,
}: {
  r: number;
  fraction: number;
  color: string;
}) {
  return (
    <g>
      <circle
        r={r}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.25}
        strokeDasharray="2 5"
      />
      <path
        d={arcPath(r, fraction)}
        fill="none"
        stroke={color}
        strokeOpacity={0.55}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </g>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color }} />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

export default function OrbitClock() {
  const [warp, setWarp] = useState<Warp>(1);
  const [showDigits, setShowDigits] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const anchorRef = useRef({ real: performance.now(), sim: Date.now() });
  const warpRef = useRef<Warp>(1);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const anchor = anchorRef.current;
      setNow(anchor.sim + (performance.now() - anchor.real) * warpRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const changeWarp = (next: Warp) => {
    const anchor = anchorRef.current;
    const realNow = performance.now();
    anchorRef.current = {
      real: realNow,
      sim: anchor.sim + (realNow - anchor.real) * warpRef.current,
    };
    warpRef.current = next;
    setWarp(next);
  };

  const backToNow = () => {
    anchorRef.current = { real: performance.now(), sim: Date.now() };
    warpRef.current = 1;
    setWarp(1);
  };

  const date = new Date(now);
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  const ms = date.getMilliseconds();

  const hourFrac = ((h % 12) + m / 60 + s / 3600) / 12;
  const minuteFrac = (m + s / 60 + ms / 60000) / 60;
  const secondFrac = (s + ms / 1000) / 60;

  const phase = dayPhase(h + m / 60);
  const secondsBlur = warp >= 3600;
  const isOffNow = warp !== 1 || Math.abs(now - Date.now()) > 1000;
  const digits = `${pad(h)}:${pad(m)}:${pad(s)}`;

  const hourPos = polar(ORBITS.hour.r, hourFrac);
  const minutePos = polar(ORBITS.minute.r, minuteFrac);

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
        Orbit Clock
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 440, mx: "auto" }}>
        No hands, no digits — just a tiny solar system keeping time.
      </Typography>

      <Box sx={{ color: "text.secondary", mb: 2 }}>
        <svg
          viewBox="-160 -160 320 320"
          width="100%"
          style={{ maxWidth: 380, display: "block", margin: "0 auto" }}
          role="img"
          aria-label={`Orbit clock showing ${digits}`}
        >
          <defs>
            <radialGradient id="orbit-clock-sun">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop
                offset="55%"
                style={{ stopColor: phase.color, transition: "stop-color 1s ease" }}
              />
              <stop
                offset="100%"
                style={{ stopColor: phase.color, transition: "stop-color 1s ease" }}
              />
            </radialGradient>
          </defs>

          {Array.from({ length: 12 }, (_, i) => {
            const outer = polar(154, i / 12);
            const inner = polar(i % 3 === 0 ? 144 : 149, i / 12);
            return (
              <line
                key={i}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="currentColor"
                strokeOpacity={i % 3 === 0 ? 0.7 : 0.35}
                strokeWidth={i % 3 === 0 ? 2.5 : 1.5}
                strokeLinecap="round"
              />
            );
          })}

          <OrbitRing r={ORBITS.hour.r} fraction={hourFrac} color={ORBITS.hour.color} />
          <OrbitRing r={ORBITS.minute.r} fraction={minuteFrac} color={ORBITS.minute.color} />
          {secondsBlur ? (
            <circle
              r={ORBITS.second.r}
              fill="none"
              stroke={ORBITS.second.color}
              strokeOpacity={0.45}
              strokeWidth={4}
            />
          ) : (
            <OrbitRing
              r={ORBITS.second.r}
              fraction={secondFrac}
              color={ORBITS.second.color}
            />
          )}

          <circle
            r={36}
            style={{ fill: phase.color, transition: "fill 1s ease" }}
            opacity={0.18}
          />
          <circle r={24} fill="url(#orbit-clock-sun)" />

          <g transform={`translate(${hourPos.x} ${hourPos.y})`}>
            <title>{ORBITS.hour.label}</title>
            <circle r={ORBITS.hour.size} fill={ORBITS.hour.color} />
            <ellipse
              rx={18}
              ry={5}
              fill="none"
              stroke={ORBITS.hour.color}
              strokeWidth={2}
              strokeOpacity={0.8}
              transform="rotate(-20)"
            />
          </g>

          <g transform={`translate(${minutePos.x} ${minutePos.y})`}>
            <title>{ORBITS.minute.label}</title>
            <circle r={ORBITS.minute.size} fill={ORBITS.minute.color} />
            <circle cx={-2.5} cy={-2} r={2} fill="#FFFFFF" opacity={0.45} />
            <circle cx={2.5} cy={2.5} r={1.3} fill="#FFFFFF" opacity={0.35} />
          </g>

          {!secondsBlur && (
            <g>
              <title>{ORBITS.second.label}</title>
              {Array.from({ length: COMET_TRAIL }, (_, k) => {
                const step = COMET_TRAIL - k;
                const p = polar(ORBITS.second.r, secondFrac - step * 0.006);
                return (
                  <circle
                    key={step}
                    cx={p.x}
                    cy={p.y}
                    r={ORBITS.second.size * (1 - step / (COMET_TRAIL + 2))}
                    fill={ORBITS.second.color}
                    opacity={0.6 * (1 - step / (COMET_TRAIL + 1))}
                  />
                );
              })}
              {(() => {
                const p = polar(ORBITS.second.r, secondFrac);
                return (
                  <circle cx={p.x} cy={p.y} r={ORBITS.second.size} fill={ORBITS.second.color} />
                );
              })()}
            </g>
          )}
        </svg>
      </Box>

      {showDigits && (
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", letterSpacing: 2 }}
          >
            {digits}
          </Typography>
          {warp !== 1 && (
            <Typography variant="body2" color="text.secondary">
              {date.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}{" "}
              (simulated)
            </Typography>
          )}
        </Box>
      )}

      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        flexWrap="wrap"
        useFlexGap
        sx={{ mb: 3 }}
      >
        <Chip
          label={phase.label}
          sx={{
            fontWeight: 600,
            color: "#1A1A2E",
            bgcolor: phase.color,
            transition: "background-color 1s ease",
          }}
        />
        <Chip label={WARP_LABELS[warp]} variant="outlined" />
      </Stack>

      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
        sx={{ mb: 3 }}
      >
        <ToggleButtonGroup
          exclusive
          size="small"
          value={warp}
          onChange={(_, next: Warp | null) => {
            if (next) changeWarp(next);
          }}
          aria-label="Time warp"
        >
          {WARPS.map((w) => (
            <ToggleButton key={w} value={w} sx={{ textTransform: "none", px: 2 }}>
              {w}×
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Button
          variant="outlined"
          onClick={backToNow}
          disabled={!isOffNow}
          sx={{ textTransform: "none", fontWeight: 600, whiteSpace: "nowrap" }}
        >
          Back to now
        </Button>
        <FormControlLabel
          control={
            <Switch checked={showDigits} onChange={(e) => setShowDigits(e.target.checked)} />
          }
          label="Show digits"
          sx={{ whiteSpace: "nowrap", mr: 0 }}
        />
      </Stack>

      <Stack direction="row" spacing={2.5} justifyContent="center" flexWrap="wrap" useFlexGap>
        <LegendDot color={ORBITS.hour.color} label="Planet = hours" />
        <LegendDot color={ORBITS.minute.color} label="Moon = minutes" />
        <LegendDot color={ORBITS.second.color} label="Comet = seconds" />
      </Stack>
    </Box>
  );
}

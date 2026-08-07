import { useState, useRef, useEffect, useCallback, forwardRef } from "react";
import {
  Box,
  Typography,
  Slider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  Alert,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ImageIcon from "@mui/icons-material/Image";
import CodeIcon from "@mui/icons-material/Code";

type ViewMode = "static" | "virtual";

interface FaceEmotions {
  happiness: number;
  anger: number;
  surprise: number;
}

interface Gaze {
  x: number;
  y: number;
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Map slider 0–10 → 0–1 */
function t(value: number) {
  return clamp01(value / 10);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function serializeSvg(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  if (!clone.getAttribute("width")) clone.setAttribute("width", "200");
  if (!clone.getAttribute("height")) clone.setAttribute("height", "200");
  return new XMLSerializer().serializeToString(clone);
}

function exportSvg(svg: SVGSVGElement, filename: string) {
  const markup = serializeSvg(svg);
  downloadBlob(new Blob([markup], { type: "image/svg+xml;charset=utf-8" }), filename);
}

function exportPng(svg: SVGSVGElement, filename: string, scale = 2) {
  const markup = serializeSvg(svg);
  const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  img.onload = () => {
    const width = svg.viewBox.baseVal.width || 200;
    const height = svg.viewBox.baseVal.height || 200;
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      URL.revokeObjectURL(url);
      return;
    }
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((pngBlob) => {
      if (pngBlob) downloadBlob(pngBlob, filename);
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  img.onerror = () => URL.revokeObjectURL(url);
  img.src = url;
}

function Eye({
  cx,
  cy,
  radius,
  gaze,
  blinking,
}: {
  cx: number;
  cy: number;
  radius: number;
  gaze: Gaze;
  blinking: boolean;
}) {
  const r = Math.max(4, radius);

  if (blinking) {
    return (
      <line
        x1={cx - r}
        y1={cy}
        x2={cx + r}
        y2={cy}
        stroke="#3D2B1F"
        strokeWidth="5"
        strokeLinecap="round"
      />
    );
  }

  const pupilR = r * 0.48;
  const maxOffset = r - pupilR - 1.5;
  const pupilX = cx + gaze.x * maxOffset;
  const pupilY = cy + gaze.y * maxOffset;

  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#FFF8E7" stroke="#3D2B1F" strokeWidth="2" />
      <circle cx={pupilX} cy={pupilY} r={pupilR} fill="#3D2B1F" />
      <circle
        cx={pupilX - pupilR * 0.28}
        cy={pupilY - pupilR * 0.28}
        r={pupilR * 0.28}
        fill="#FFFFFF"
        opacity={0.85}
      />
    </g>
  );
}

interface FaceSvgProps extends FaceEmotions {
  size?: number;
  gaze?: Gaze;
  blinking?: boolean;
}

const FaceSvg = forwardRef<SVGSVGElement, FaceSvgProps>(function FaceSvg(
  {
    size = 220,
    happiness,
    anger,
    surprise,
    gaze = { x: 0, y: 0 },
    blinking = false,
  },
  ref
) {
  const h = t(happiness);
  const a = t(anger);
  const s = t(surprise);

  const eyeRadius = 10 + s * 6 - h * 2;
  const eyeY = 85 - s * 4;

  const browY = 58 - s * 14 + h * 4 + a * 2;
  const browInnerDrop = a * 10;
  const browOuterLift = a * 4;
  const browLength = 28;

  const leftBrow = {
    x1: 70 - browLength / 2,
    y1: browY - browOuterLift,
    x2: 70 + browLength / 2,
    y2: browY + browInnerDrop,
  };
  const rightBrow = {
    x1: 130 - browLength / 2,
    y1: browY + browInnerDrop,
    x2: 130 + browLength / 2,
    y2: browY - browOuterLift,
  };

  const mouthOpen = s > 0.15;
  const mouthCenterY = 128 + a * 6 - h * 4;
  const smileDepth = 28 * h - 22 * a;
  const mouthLeft = 65;
  const mouthRight = 135;
  const mouthMidX = 100;
  const mouthMidY = mouthCenterY + smileDepth;

  const mouthPath = `M ${mouthLeft} ${mouthCenterY} Q ${mouthMidX} ${mouthMidY} ${mouthRight} ${mouthCenterY}`;
  const mouthRx = 12 + s * 14;
  const mouthRy = 8 + s * 18;

  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label={`Emoji face: happiness ${happiness}, anger ${anger}, surprise ${surprise}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="100" cy="100" r="90" fill="#F7D774" stroke="#E8B84A" strokeWidth="4" />

      <line
        x1={leftBrow.x1}
        y1={leftBrow.y1}
        x2={leftBrow.x2}
        y2={leftBrow.y2}
        stroke="#3D2B1F"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <line
        x1={rightBrow.x1}
        y1={rightBrow.y1}
        x2={rightBrow.x2}
        y2={rightBrow.y2}
        stroke="#3D2B1F"
        strokeWidth="6"
        strokeLinecap="round"
      />

      <Eye cx={70} cy={eyeY} radius={eyeRadius} gaze={gaze} blinking={blinking} />
      <Eye cx={130} cy={eyeY} radius={eyeRadius} gaze={gaze} blinking={blinking} />

      {mouthOpen ? (
        <ellipse
          cx="100"
          cy={mouthCenterY + 8}
          rx={mouthRx}
          ry={mouthRy}
          fill="#3D2B1F"
        />
      ) : (
        <path
          d={mouthPath}
          fill="none"
          stroke="#3D2B1F"
          strokeWidth="8"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
});

const SLIDER_MARKS = [
  { value: 0, label: "0" },
  { value: 5, label: "5" },
  { value: 10, label: "10" },
];

function EmotionSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: "tabular-nums" }}>
          {value}
        </Typography>
      </Stack>
      <Slider
        value={value}
        min={0}
        max={10}
        step={1}
        marks={SLIDER_MARKS}
        valueLabelDisplay="auto"
        onChange={(_, next) => onChange(next as number)}
        aria-label={label}
      />
    </Box>
  );
}

function exportFilename(ext: "svg" | "png", emotions: FaceEmotions) {
  const { happiness, anger, surprise } = emotions;
  return `emoji-h${happiness}-a${anger}-s${surprise}.${ext}`;
}

export default function EmojiView() {
  const [mode, setMode] = useState<ViewMode>("static");
  const [happiness, setHappiness] = useState(5);
  const [anger, setAnger] = useState(0);
  const [surprise, setSurprise] = useState(0);
  const [gaze, setGaze] = useState<Gaze>({ x: 0, y: 0 });
  const [blinking, setBlinking] = useState(false);
  const [reactionBoost, setReactionBoost] = useState(0);
  const [reacting, setReacting] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const faceWrapRef = useRef<HTMLDivElement>(null);
  const reactionTimerRef = useRef<number | null>(null);

  const emotions = { happiness, anger, surprise };
  const isStatic = mode === "static";
  const isVirtual = mode === "virtual";

  const displaySurprise = Math.min(10, surprise + reactionBoost);

  // Idle blink — virtual only
  useEffect(() => {
    if (!isVirtual) {
      setBlinking(false);
      return;
    }

    let blinkTimeout: number | undefined;
    let scheduleTimeout: number | undefined;

    const scheduleNextBlink = () => {
      const delay = 2200 + Math.random() * 2800;
      scheduleTimeout = window.setTimeout(() => {
        setBlinking(true);
        blinkTimeout = window.setTimeout(() => {
          setBlinking(false);
          scheduleNextBlink();
        }, 140);
      }, delay);
    };

    scheduleNextBlink();

    return () => {
      window.clearTimeout(scheduleTimeout);
      window.clearTimeout(blinkTimeout);
    };
  }, [isVirtual]);

  // Reset gaze / reaction when leaving virtual
  useEffect(() => {
    if (!isVirtual) {
      setGaze({ x: 0, y: 0 });
      setReactionBoost(0);
      setReacting(false);
      if (reactionTimerRef.current) {
        window.clearTimeout(reactionTimerRef.current);
        reactionTimerRef.current = null;
      }
    }
  }, [isVirtual]);

  useEffect(() => {
    return () => {
      if (reactionTimerRef.current) {
        window.clearTimeout(reactionTimerRef.current);
      }
    };
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isVirtual || !faceWrapRef.current) return;
      const rect = faceWrapRef.current.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      setGaze({
        x: clamp(nx, -1, 1),
        y: clamp(ny, -1, 1),
      });
    },
    [isVirtual]
  );

  const handlePointerLeave = useCallback(() => {
    if (!isVirtual) return;
    setGaze({ x: 0, y: 0 });
  }, [isVirtual]);

  const handleFaceClick = useCallback(() => {
    if (!isVirtual) return;

    setReacting(true);
    setReactionBoost(4);
    setBlinking(false);

    if (reactionTimerRef.current) {
      window.clearTimeout(reactionTimerRef.current);
    }

    reactionTimerRef.current = window.setTimeout(() => {
      setReactionBoost(0);
      setReacting(false);
      reactionTimerRef.current = null;
    }, 450);
  }, [isVirtual]);

  const handleExportSvg = () => {
    if (!svgRef.current) return;
    exportSvg(svgRef.current, exportFilename("svg", emotions));
  };

  const handleExportPng = () => {
    if (!svgRef.current) return;
    exportPng(svgRef.current, exportFilename("png", emotions));
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
        Emoji View
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 420, mx: "auto" }}>
        Static mode for exportable faces. Virtual mode adds blink, gaze, and click reactions.
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mb: 3 }}>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={mode}
          onChange={(_, next: ViewMode | null) => {
            if (next) setMode(next);
          }}
          aria-label="View mode"
        >
          <ToggleButton value="static" sx={{ textTransform: "none", px: 2.5 }}>
            Static
          </ToggleButton>
          <ToggleButton value="virtual" sx={{ textTransform: "none", px: 2.5 }}>
            Virtual
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {isVirtual && (
        <Alert severity="info" sx={{ maxWidth: 420, mx: "auto", mb: 3, textAlign: "left" }}>
          Move near the face to make it look at you. It blinks on its own — click it for a
          surprise reaction.
        </Alert>
      )}

      <Box
        ref={faceWrapRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleFaceClick}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          p: 2,
          mb: 2,
          cursor: isVirtual ? "pointer" : "default",
          "@keyframes emojiFloat": {
            "0%, 100%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(-6px)" },
          },
          "@keyframes emojiPop": {
            "0%": { transform: "scale(1)" },
            "40%": { transform: "scale(1.08)" },
            "100%": { transform: "scale(1)" },
          },
          animation: isVirtual
            ? reacting
              ? "emojiPop 0.45s ease"
              : "emojiFloat 3.2s ease-in-out infinite"
            : "none",
          transition: "transform 0.2s ease",
        }}
      >
        <FaceSvg
          ref={svgRef}
          happiness={happiness}
          anger={anger}
          surprise={isVirtual ? displaySurprise : surprise}
          gaze={isVirtual ? gaze : { x: 0, y: 0 }}
          blinking={isVirtual && blinking}
        />
      </Box>

      {isStatic && (
        <Stack
          direction="row"
          spacing={1.5}
          justifyContent="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: 4, width: "100%" }}
        >
          <Button
            variant="contained"
            startIcon={<CodeIcon />}
            onClick={handleExportSvg}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Export SVG
          </Button>
          <Button
            variant="outlined"
            startIcon={<ImageIcon />}
            endIcon={<DownloadIcon />}
            onClick={handleExportPng}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Export PNG
          </Button>
        </Stack>
      )}

      <Stack spacing={3} sx={{ maxWidth: 360, mx: "auto", textAlign: "left", px: 1 }}>
        <EmotionSlider label="Happiness" value={happiness} onChange={setHappiness} />
        <EmotionSlider label="Anger" value={anger} onChange={setAnger} />
        <EmotionSlider label="Surprise" value={surprise} onChange={setSurprise} />
      </Stack>
    </Box>
  );
}

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import { keyframes } from "@emotion/react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";

const SIZE = 64;
const FLOOR = 12;
const EDGE = 8;
const TREAT_SIZE = 22;
const WALK_SPEED = 70;
const RUN_SPEED = 260;
const GRAVITY = 2200;
const MAX_THROW = 1600;
const DIZZY_IMPACT = 950;
const SLEEP_AFTER_MS = 20000;
const NAV_SELECTOR = "nav a, nav button";

const BODY = "#9C88FF";
const BODY_DARK = "#5F4BB6";
const INK = "#2D1E4A";

type Mood =
  | "idle"
  | "walk"
  | "run"
  | "alert"
  | "happy"
  | "eat"
  | "sleep"
  | "held"
  | "falling"
  | "dizzy";

type TargetReason = "wander" | "nav" | "treat" | "call";

interface PetState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  mood: Mood;
  moodUntil: number;
  targetX: number | null;
  targetReason: TargetReason | null;
  nextDecisionAt: number;
}

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  grabX: number;
  grabY: number;
  lastX: number;
  lastY: number;
  lastT: number;
  vx: number;
  vy: number;
  moved: boolean;
}

const MOOD_LABELS: Record<Mood, string> = {
  idle: "Chilling",
  walk: "Strolling",
  run: "On a mission",
  alert: "Curious",
  happy: "Happy",
  eat: "Snacking",
  sleep: "Sleeping",
  held: "Up in the air",
  falling: "Wheee",
  dizzy: "Dizzy",
};

const BUBBLES: Partial<Record<Mood, string>> = {
  alert: "!",
  happy: "♥",
  eat: "nom",
  sleep: "z z",
  dizzy: "@_@",
  falling: "wheee",
};

const bob = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
`;
const hop = keyframes`
  0%, 100% { transform: translateY(0); }
  40% { transform: translateY(-12px); }
`;
const breathe = keyframes`
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.94); }
`;
const wobble = keyframes`
  0%, 100% { transform: rotate(-8deg); }
  50% { transform: rotate(8deg); }
`;
const chomp = keyframes`
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.92); }
`;
const dangle = keyframes`
  0%, 100% { transform: rotate(-6deg); }
  50% { transform: rotate(6deg); }
`;
const stepAnim = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
`;
const wag = keyframes`
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(18deg); }
`;
const treatDrop = keyframes`
  from { transform: translateY(-100vh); }
  to { transform: translateY(0); }
`;

const BODY_ANIMATIONS: Partial<Record<Mood, string>> = {
  walk: `${bob} 0.36s ease-in-out infinite`,
  run: `${bob} 0.2s ease-in-out infinite`,
  alert: `${hop} 0.5s ease-out 2`,
  happy: `${hop} 0.4s ease-out 3`,
  sleep: `${breathe} 2.4s ease-in-out infinite`,
  dizzy: `${wobble} 0.5s ease-in-out infinite`,
  eat: `${chomp} 0.3s ease-in-out infinite`,
  held: `${dangle} 0.8s ease-in-out infinite`,
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function getMaxX() {
  return window.innerWidth - SIZE - EDGE;
}

function createPet(): PetState {
  return {
    x: getMaxX() / 2,
    y: 120,
    vx: 0,
    vy: 0,
    facing: 1,
    mood: "falling",
    moodUntil: 0,
    targetX: null,
    targetReason: null,
    nextDecisionAt: 0,
  };
}

function enterMood(p: PetState, mood: Mood, now: number, duration = 0) {
  p.mood = mood;
  p.moodUntil = duration ? now + duration : 0;
}

function goTo(p: PetState, x: number, reason: TargetReason, pace: "walk" | "run") {
  p.targetX = clamp(x, EDGE, getMaxX());
  p.targetReason = reason;
  enterMood(p, pace, 0);
}

function treatTargetX(treatX: number) {
  return treatX + TREAT_SIZE / 2 - SIZE / 2;
}

function PetEyes({ mood }: { mood: Mood }) {
  if (mood === "sleep") {
    return (
      <g fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round">
        <path d="M 23 37 Q 27 40 31 37" />
        <path d="M 37 37 Q 41 40 45 37" />
      </g>
    );
  }

  if (mood === "happy") {
    return (
      <g fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round">
        <path d="M 23 38 Q 27 33 31 38" />
        <path d="M 37 38 Q 41 33 45 38" />
      </g>
    );
  }

  if (mood === "dizzy") {
    return (
      <g stroke={INK} strokeWidth="2.5" strokeLinecap="round">
        <line x1="24" y1="34" x2="30" y2="40" />
        <line x1="30" y1="34" x2="24" y2="40" />
        <line x1="38" y1="34" x2="44" y2="40" />
        <line x1="44" y1="34" x2="38" y2="40" />
      </g>
    );
  }

  const r = mood === "alert" || mood === "falling" ? 4.5 : 3.2;

  return (
    <g>
      <circle cx="27" cy="37" r={r} fill={INK} />
      <circle cx="41" cy="37" r={r} fill={INK} />
      <circle cx="28" cy="36" r={r * 0.32} fill="#FFFFFF" />
      <circle cx="42" cy="36" r={r * 0.32} fill="#FFFFFF" />
    </g>
  );
}

function PetMouth({ mood }: { mood: Mood }) {
  if (mood === "eat") {
    return <ellipse cx="34" cy="46" rx="3.5" ry="3" fill={INK} />;
  }

  if (mood === "alert" || mood === "falling" || mood === "dizzy") {
    return <circle cx="34" cy="46" r="2" fill={INK} />;
  }

  const d =
    mood === "happy"
      ? "M 29 44 Q 34 49 39 44"
      : mood === "sleep"
        ? "M 32 46 L 36 46"
        : "M 30 44 Q 32 47 34 44 Q 36 47 38 44";

  return <path d={d} fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />;
}

function PetSvg({ mood }: { mood: Mood }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={SIZE}
      height={SIZE}
      style={{ display: "block", overflow: "visible" }}
      aria-hidden="true"
    >
      <path
        className="pet-tail"
        d="M 13 46 Q 2 44 5 30"
        fill="none"
        stroke={BODY_DARK}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <ellipse className="pet-foot-l" cx="24" cy="57" rx="5" ry="3.5" fill={BODY_DARK} />
      <ellipse className="pet-foot-r" cx="40" cy="57" rx="5" ry="3.5" fill={BODY_DARK} />
      <polygon
        points="17,28 20,12 29,24"
        fill={BODY}
        stroke={BODY_DARK}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <polygon
        points="37,24 46,12 49,28"
        fill={BODY}
        stroke={BODY_DARK}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <ellipse cx="33" cy="40" rx="22" ry="17" fill={BODY} stroke={BODY_DARK} strokeWidth="2" />
      <circle cx="22" cy="44" r="3.5" fill="#FF8FAB" opacity="0.6" />
      <circle cx="46" cy="44" r="3.5" fill="#FF8FAB" opacity="0.6" />
      <PetEyes mood={mood} />
      <PetMouth mood={mood} />
    </svg>
  );
}

function TreatSvg() {
  return (
    <svg viewBox="0 0 22 22" width={TREAT_SIZE} height={TREAT_SIZE} aria-hidden="true">
      <circle cx="11" cy="11" r="9.5" fill="#D9A066" stroke="#A0703C" strokeWidth="1.5" />
      <circle cx="7" cy="8" r="1.6" fill="#5A3A1E" />
      <circle cx="14" cy="7" r="1.3" fill="#5A3A1E" />
      <circle cx="12" cy="13" r="1.6" fill="#5A3A1E" />
      <circle cx="6.5" cy="14" r="1.2" fill="#5A3A1E" />
    </svg>
  );
}

export default function WindowPet() {
  const petElRef = useRef<HTMLDivElement>(null);
  const petRef = useRef<PetState | null>(null);
  if (petRef.current === null) {
    petRef.current = createPet();
  }
  const dragRef = useRef<DragState | null>(null);
  const treatRef = useRef<number | null>(null);
  const cursorXRef = useRef<number | null>(null);
  const lastActivityRef = useRef(performance.now());

  const [view, setView] = useState<{ mood: Mood; facing: 1 | -1 }>({
    mood: "falling",
    facing: 1,
  });
  const [treatX, setTreatX] = useState<number | null>(null);
  const [stats, setStats] = useState({ treats: 0, pets: 0 });

  useEffect(() => {
    const p = petRef.current!;
    let raf = 0;
    let last = performance.now();
    let shownMood = p.mood;
    let shownFacing = p.facing;
    let lastNavEl: Element | null = null;

    const finishTimedMood = (now: number) => {
      if (p.mood === "eat") {
        treatRef.current = null;
        setTreatX(null);
        setStats((s) => ({ ...s, treats: s.treats + 1 }));
        enterMood(p, "happy", now, 1200);
        return;
      }
      enterMood(p, "idle", now);
      p.nextDecisionAt = now + rand(800, 2000);
    };

    const arrive = (now: number) => {
      const reason = p.targetReason;
      p.targetX = null;
      p.targetReason = null;

      if (reason === "nav") {
        enterMood(p, "alert", now, 1400);
      } else if (reason === "treat" && treatRef.current !== null) {
        enterMood(p, "eat", now, 1500);
      } else if (reason === "call") {
        enterMood(p, "happy", now, 900);
      } else {
        enterMood(p, "idle", now);
        p.nextDecisionAt = now + rand(1500, 4000);
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const maxX = getMaxX();

      if (p.mood === "falling") {
        p.vy -= GRAVITY * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.x <= EDGE || p.x >= maxX) {
          p.x = clamp(p.x, EDGE, maxX);
          p.vx = -p.vx * 0.6;
        }
        if (Math.abs(p.vx) > 50) {
          p.facing = p.vx > 0 ? 1 : -1;
        }

        const ceiling = window.innerHeight - FLOOR - SIZE;
        if (p.y > ceiling) {
          p.y = ceiling;
          p.vy = -Math.abs(p.vy) * 0.4;
        }

        if (p.y <= 0) {
          const impact = -p.vy;
          p.y = 0;
          p.vx = 0;
          p.vy = 0;
          if (impact > DIZZY_IMPACT) {
            enterMood(p, "dizzy", now, 1800);
          } else {
            enterMood(p, "idle", now);
            p.nextDecisionAt = now + rand(600, 1500);
          }
        }
      } else if (p.mood !== "held") {
        if (p.moodUntil && now >= p.moodUntil) {
          finishTimedMood(now);
        }

        if ((p.mood === "idle" || p.mood === "sleep") && treatRef.current !== null) {
          goTo(p, treatTargetX(treatRef.current), "treat", "run");
        }

        if (p.mood === "walk" || p.mood === "run") {
          const speed = p.mood === "run" ? RUN_SPEED : WALK_SPEED;
          const target = p.targetX ?? p.x;
          const dx = target - p.x;
          if (Math.abs(dx) <= speed * dt) {
            p.x = target;
            arrive(now);
          } else {
            p.facing = dx > 0 ? 1 : -1;
            p.x += Math.sign(dx) * speed * dt;
          }
        } else if (p.mood === "idle") {
          if (now - lastActivityRef.current > SLEEP_AFTER_MS) {
            enterMood(p, "sleep", now);
          } else if (now >= p.nextDecisionAt) {
            if (Math.random() < 0.6) {
              goTo(p, rand(EDGE, maxX), "wander", "walk");
            } else {
              p.nextDecisionAt = now + rand(1500, 3500);
            }
          }

          if (p.mood === "idle" && cursorXRef.current !== null) {
            p.facing = cursorXRef.current > p.x + SIZE / 2 ? 1 : -1;
          }
        }
      }

      p.x = clamp(p.x, EDGE, maxX);

      const el = petElRef.current;
      if (el) {
        el.style.transform = `translate3d(${p.x}px, ${-p.y}px, 0)`;
      }

      if (p.mood !== shownMood || p.facing !== shownFacing) {
        shownMood = p.mood;
        shownFacing = p.facing;
        setView({ mood: p.mood, facing: p.facing });
      }

      raf = requestAnimationFrame(tick);
    };

    const handleWindowPointerMove = (e: PointerEvent) => {
      cursorXRef.current = e.clientX;
      lastActivityRef.current = performance.now();
    };

    const handleKeyDown = () => {
      lastActivityRef.current = performance.now();
    };

    const handleNavHover = (e: PointerEvent) => {
      const link = e.target instanceof Element ? e.target.closest(NAV_SELECTOR) : null;
      if (link === lastNavEl) return;
      lastNavEl = link;
      if (!link) return;
      if (p.mood === "held" || p.mood === "falling" || p.mood === "eat") return;

      const rect = link.getBoundingClientRect();
      goTo(p, rect.left + rect.width / 2 - SIZE / 2, "nav", "run");
      lastActivityRef.current = performance.now();
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", handleWindowPointerMove);
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerover", handleNavHover);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerover", handleNavHover);
    };
  }, []);

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const p = petRef.current!;
    e.currentTarget.setPointerCapture(e.pointerId);
    const top = window.innerHeight - FLOOR - SIZE - p.y;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      grabX: e.clientX - p.x,
      grabY: e.clientY - top,
      lastX: e.clientX,
      lastY: e.clientY,
      lastT: e.timeStamp,
      vx: 0,
      vy: 0,
      moved: false,
    };
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const p = petRef.current!;

    if (!drag.moved) {
      if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 4) return;
      drag.moved = true;
      p.targetX = null;
      p.targetReason = null;
      enterMood(p, "held", performance.now());
    }

    const dt = Math.max(1, e.timeStamp - drag.lastT) / 1000;
    drag.vx = drag.vx * 0.5 + ((e.clientX - drag.lastX) / dt) * 0.5;
    drag.vy = drag.vy * 0.5 + (-(e.clientY - drag.lastY) / dt) * 0.5;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    drag.lastT = e.timeStamp;

    const ceiling = window.innerHeight - FLOOR - SIZE;
    p.x = e.clientX - drag.grabX;
    p.y = clamp(ceiling - (e.clientY - drag.grabY), 0, ceiling);
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;

    const p = petRef.current!;
    const now = performance.now();
    lastActivityRef.current = now;

    if (drag.moved) {
      const stale = e.timeStamp - drag.lastT > 100;
      p.vx = stale ? 0 : clamp(drag.vx, -MAX_THROW, MAX_THROW);
      p.vy = stale ? 0 : clamp(drag.vy, -MAX_THROW, MAX_THROW);
      enterMood(p, "falling", now);
    } else if (p.mood !== "falling") {
      p.targetX = null;
      p.targetReason = null;
      enterMood(p, "happy", now, 1200);
      setStats((s) => ({ ...s, pets: s.pets + 1 }));
    }
  };

  const dropTreat = () => {
    if (treatRef.current !== null) return;
    const x = rand(EDGE + 40, window.innerWidth - TREAT_SIZE - EDGE - 40);
    treatRef.current = x;
    setTreatX(x);
    lastActivityRef.current = performance.now();
  };

  const callOver = () => {
    const p = petRef.current!;
    if (p.mood === "held" || p.mood === "falling") return;
    goTo(p, window.innerWidth / 2 - SIZE / 2, "call", "run");
    lastActivityRef.current = performance.now();
  };

  const toggleNap = () => {
    const p = petRef.current!;
    const now = performance.now();
    if (p.mood === "sleep") {
      lastActivityRef.current = now;
      enterMood(p, "happy", now, 800);
    } else if (p.mood !== "held" && p.mood !== "falling") {
      p.targetX = null;
      p.targetReason = null;
      enterMood(p, "sleep", now);
    }
  };

  const { mood, facing } = view;
  const walking = mood === "walk" || mood === "run";
  const stepDuration = mood === "run" ? 0.2 : 0.36;
  const bubble = BUBBLES[mood];

  return (
    <>
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
          Window Pet
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 440, mx: "auto" }}>
          A little creature living on the bottom edge of your window. Look down.
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: 3 }}
        >
          <Chip label={`Mood: ${MOOD_LABELS[mood]}`} color="primary" variant="outlined" />
          <Chip label={`Treats eaten: ${stats.treats}`} />
          <Chip label={`Pets: ${stats.pets}`} />
        </Stack>

        <Stack
          direction="row"
          spacing={1.5}
          justifyContent="center"
          flexWrap="wrap"
          useFlexGap
          sx={{ mb: 4 }}
        >
          <Button
            variant="contained"
            onClick={dropTreat}
            disabled={treatX !== null}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Drop a treat
          </Button>
          <Button
            variant="outlined"
            onClick={callOver}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Call over
          </Button>
          <Button
            variant="outlined"
            onClick={toggleNap}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {mood === "sleep" ? "Wake up" : "Nap time"}
          </Button>
        </Stack>

        <Box
          component="ul"
          sx={{
            textAlign: "left",
            maxWidth: 440,
            mx: "auto",
            my: 0,
            pl: 3,
            color: "text.secondary",
            "& li": { mb: 0.75 },
          }}
        >
          <li>Hover a navbar link and it runs over to check it out.</li>
          <li>Click to pet it. Drag to pick it up, flick to throw.</li>
          <li>Leave it alone for a while and it falls asleep.</li>
        </Box>
      </Box>

      {createPortal(
        <>
          {treatX !== null && (
            <Box
              sx={{
                position: "fixed",
                left: treatX,
                bottom: FLOOR,
                width: TREAT_SIZE,
                height: TREAT_SIZE,
                zIndex: 1149,
                pointerEvents: "none",
                animation: `${treatDrop} 0.6s ease-in`,
              }}
            >
              <TreatSvg />
            </Box>
          )}

          <Box
            ref={petElRef}
            role="img"
            aria-label={`Window pet, ${MOOD_LABELS[mood].toLowerCase()}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            sx={{
              position: "fixed",
              left: 0,
              bottom: FLOOR,
              width: SIZE,
              height: SIZE,
              zIndex: 1150,
              touchAction: "none",
              userSelect: "none",
              willChange: "transform",
              cursor: mood === "held" ? "grabbing" : "grab",
            }}
          >
            {bubble && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: SIZE + 4,
                  left: "50%",
                  transform: "translateX(-50%)",
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  color: "text.primary",
                  fontSize: 12,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                }}
              >
                {bubble}
              </Box>
            )}
            <Box sx={{ transform: `scaleX(${facing})` }}>
              <Box
                sx={{
                  transformOrigin: "50% 100%",
                  animation: BODY_ANIMATIONS[mood] ?? "none",
                  "& .pet-tail": {
                    transformBox: "fill-box",
                    transformOrigin: "100% 100%",
                    animation:
                      mood === "sleep"
                        ? "none"
                        : `${wag} ${walking ? 0.3 : 1.2}s ease-in-out infinite`,
                  },
                  "& .pet-foot-l, & .pet-foot-r": {
                    transformBox: "fill-box",
                    animation: walking
                      ? `${stepAnim} ${stepDuration}s ease-in-out infinite`
                      : "none",
                  },
                  "& .pet-foot-r": {
                    animationDelay: `${stepDuration / 2}s`,
                  },
                }}
              >
                <PetSvg mood={mood} />
              </Box>
            </Box>
          </Box>
        </>,
        document.body
      )}
    </>
  );
}

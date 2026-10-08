import { useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputBase,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CloseIcon from "@mui/icons-material/Close";
import BlockIcon from "@mui/icons-material/Block";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import {
  EMBEDDABLE_SUGGESTIONS,
  getHostname,
  isKnownBlocked,
  normalizeUrl,
} from "../core/embedPolicy";
import { shortcutLabel } from "../core/shortcuts";
import type { Pane as PaneData } from "../core/types";

const IFRAME_SANDBOX = [
  "allow-scripts",
  "allow-same-origin",
  "allow-forms",
  "allow-popups",
  "allow-popups-to-escape-sandbox",
  "allow-modals",
  "allow-downloads",
].join(" ");

function openInNewWindow(url: string) {
  window.open(url, "_blank", "noopener,noreferrer,popup,width=1280,height=860");
}

function AddressBar({ url, onSubmit }: { url: string; onSubmit: (url: string) => void }) {
  const [draft, setDraft] = useState(url);
  const [invalid, setInvalid] = useState(false);

  const submit = () => {
    if (!draft.trim()) {
      onSubmit("");
      return;
    }
    const normalized = normalizeUrl(draft);
    if (!normalized) {
      setInvalid(true);
      return;
    }
    setDraft(normalized);
    onSubmit(normalized);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submit();
    } else if (e.key === "Escape") {
      // Keeps Escape from also closing the full-screen workspace.
      e.stopPropagation();
      setDraft(url);
      setInvalid(false);
      e.currentTarget.blur();
    }
  };

  return (
    <InputBase
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value);
        setInvalid(false);
      }}
      onKeyDown={handleKeyDown}
      onFocus={(e) => e.target.select()}
      placeholder="Type an address and press Enter"
      inputProps={{ "aria-label": "Pane address", spellCheck: false }}
      sx={{
        flex: 1,
        minWidth: 0,
        height: 28,
        px: 1,
        fontSize: 13,
        borderRadius: 1.5,
        border: "1px solid",
        borderColor: invalid ? "error.main" : "divider",
        bgcolor: "action.hover",
      }}
    />
  );
}

/** Centers its content but scrolls from the top when the pane is too small. */
function PaneMessage({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ height: "100%", overflow: "auto", display: "flex" }}>
      <Stack spacing={1.5} alignItems="center" sx={{ m: "auto", p: 2.5 }}>
        {children}
      </Stack>
    </Box>
  );
}

function EmptyPane({ onPick }: { onPick: (url: string) => void }) {
  return (
    <PaneMessage>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        Open something here
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 360 }}>
        Type an address above, or start with a site that allows embedding:
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
        justifyContent="center"
        sx={{ maxWidth: 420 }}
      >
        {EMBEDDABLE_SUGGESTIONS.map((suggestion) => (
          <Chip
            key={suggestion.url}
            label={suggestion.label}
            clickable
            variant="outlined"
            onClick={() => onPick(suggestion.url)}
          />
        ))}
      </Stack>
    </PaneMessage>
  );
}

function BlockedNotice({ url }: { url: string }) {
  const host = getHostname(url);

  return (
    <PaneMessage>
      <BlockIcon sx={{ fontSize: 32, color: "text.secondary" }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }} align="center">
        {host} can't be shown here
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: 380 }}>
        This site tells browsers not to display it inside other pages. Open it in its own
        window instead.
      </Typography>
      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap justifyContent="center">
        <Button
          variant="contained"
          startIcon={<OpenInNewIcon />}
          onClick={() => openInNewWindow(url)}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Open in new window
        </Button>
        <Button
          variant="outlined"
          component="a"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Open in new tab
        </Button>
      </Stack>
    </PaneMessage>
  );
}

interface PaneProps {
  pane: PaneData;
  active: boolean;
  maximized: boolean;
  canClose: boolean;
  /** Whether the pane can be maximized or dragged, i.e. it shares the screen. */
  canArrange: boolean;
  onUrlChange: (url: string) => void;
  onClose: () => void;
  onToggleMaximize: () => void;
  onDragHandlePointerDown: (e: PointerEvent<HTMLElement>) => void;
}

export default function Pane({
  pane,
  active,
  maximized,
  canClose,
  canArrange,
  onUrlChange,
  onClose,
  onToggleMaximize,
  onDragHandlePointerDown,
}: PaneProps) {
  const [reloadCount, setReloadCount] = useState(0);
  const [loadedFrameKey, setLoadedFrameKey] = useState<string | null>(null);

  const { url } = pane;
  const blocked = url !== "" && isKnownBlocked(url);
  const frameKey = `${reloadCount}:${url}`;
  const loading = url !== "" && !blocked && loadedFrameKey !== frameKey;

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 1.5,
        overflow: "hidden",
        border: "1px solid",
        borderColor: active ? "primary.main" : "divider",
        bgcolor: "background.paper",
        containerType: "inline-size",
        "@container (max-width: 300px)": {
          "& .pane-secondary-action": { display: "none" },
        },
      }}
    >
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        sx={{ px: 0.75, py: 0.5, borderBottom: "1px solid", borderColor: "divider" }}
      >
        {canArrange && (
          <Tooltip title="Drag onto another pane to swap them">
            <Box
              aria-hidden
              onPointerDown={onDragHandlePointerDown}
              sx={{
                display: "flex",
                alignSelf: "stretch",
                alignItems: "center",
                color: "text.secondary",
                cursor: "grab",
                touchAction: "none",
                "&:hover": { color: "text.primary" },
              }}
            >
              <DragIndicatorIcon fontSize="small" />
            </Box>
          </Tooltip>
        )}
        <AddressBar key={url} url={url} onSubmit={onUrlChange} />
        <Tooltip title="Reload">
          <span className="pane-secondary-action">
            <IconButton
              size="small"
              aria-label="Reload pane"
              disabled={!url || blocked}
              onClick={() => setReloadCount((count) => count + 1)}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        {(canArrange || maximized) && (
          <Tooltip title={maximized ? "Restore layout (Esc)" : `Maximize (${shortcutLabel("Enter")})`}>
            <IconButton
              size="small"
              aria-label={maximized ? "Restore pane" : "Maximize pane"}
              onClick={onToggleMaximize}
            >
              {maximized ? (
                <FullscreenExitIcon fontSize="small" />
              ) : (
                <FullscreenIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Open in new window — use this if the page stays blank, some sites block embedding">
          <span className="pane-secondary-action">
            <IconButton
              size="small"
              aria-label="Open pane in new window"
              disabled={!url}
              onClick={() => openInNewWindow(url)}
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Close pane">
          <span>
            <IconButton
              size="small"
              aria-label="Close pane"
              disabled={!canClose}
              onClick={onClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <Box sx={{ position: "relative", flex: 1, minHeight: 0 }}>
        {loading && (
          <LinearProgress sx={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 1 }} />
        )}
        {!url ? (
          <EmptyPane onPick={onUrlChange} />
        ) : blocked ? (
          <BlockedNotice url={url} />
        ) : (
          <iframe
            key={frameKey}
            src={url}
            title={`Pane showing ${getHostname(url)}`}
            sandbox={IFRAME_SANDBOX}
            allow="clipboard-read; clipboard-write; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setLoadedFrameKey(frameKey)}
            style={{ display: "block", width: "100%", height: "100%", border: 0 }}
          />
        )}
      </Box>
    </Box>
  );
}

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  Alert,
  Box,
  Chip,
  IconButton,
  Popover,
  Snackbar,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import {
  LAYOUT_PRESET_IDS,
  LAYOUT_PRESETS,
  computePaneRects,
  findNeighbor,
} from "../core/layoutTree";
import { buildShareUrl, decodeWorkspace } from "../core/share";
import { SHORTCUT_HELP, matchShortcut } from "../core/shortcuts";
import {
  MAX_IMPORT_BYTES,
  downloadTextFile,
  exportFilename,
  parseWorkspaceFile,
  serializeWorkspaces,
} from "../core/transfer";
import type { LayoutPresetId, Workspace } from "../core/types";
import { uniqueName } from "../core/workspace";
import { useWorkspaces } from "../hooks/useWorkspaces";
import LayoutRenderer from "./LayoutRenderer";
import PresetIcon from "./PresetIcon";
import {
  RenameDialog,
  ShareDialog,
  SharedWorkspaceDialog,
  TemplateDialog,
} from "./WorkspaceDialogs";
import WorkspaceMenu from "./WorkspaceMenu";

interface PaneManagerProps {
  onExit?: () => void;
  /** Token from a share link; a confirmation dialog asks before adding it. */
  sharedToken?: string | null;
  onSharedTokenHandled?: () => void;
  /** Page address that share links point to. Defaults to the current page. */
  shareBaseUrl?: string;
}

interface Notice {
  severity: "success" | "error" | "info";
  message: string;
}

function isTextField(target: EventTarget | null) {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
}

/** Menus, popovers and dialogs handle their own keys, including Escape. */
function isInsideOverlay(target: EventTarget | null) {
  return target instanceof Element && target.closest(".MuiModal-root") !== null;
}

function currentPageUrl() {
  const { origin, pathname, search } = window.location;
  return `${origin}${pathname}${search}`;
}

export default function PaneManager({
  onExit,
  sharedToken = null,
  onSharedTokenHandled,
  shareBaseUrl,
}: PaneManagerProps) {
  const {
    workspaces,
    workspace,
    setUrl,
    applyPreset,
    closePane,
    setRatio,
    swapPanes,
    createFromTemplate,
    switchTo,
    rename,
    duplicate,
    remove,
    add,
  } = useWorkspaces();
  const layoutRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [maximizedId, setMaximizedId] = useState<string | null>(null);
  const [helpAnchor, setHelpAnchor] = useState<HTMLElement | null>(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [renaming, setRenaming] = useState<Workspace | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const sharedWorkspace = useMemo(
    () => (sharedToken ? decodeWorkspace(sharedToken) : null),
    [sharedToken]
  );

  const rects = useMemo(() => computePaneRects(workspace.layout), [workspace.layout]);
  const visibleIds = Object.keys(rects);
  const hiddenCount = workspace.paneOrder.length - visibleIds.length;
  const activePaneId = activeId && rects[activeId] ? activeId : (visibleIds[0] ?? null);
  const maximizedPaneId =
    maximizedId && rects[maximizedId] && visibleIds.length > 1 ? maximizedId : null;

  const choosePreset = (presetId: LayoutPresetId) => {
    setMaximizedId(null);
    applyPreset(presetId);
  };

  const toggleMaximize = (paneId: string) => {
    setMaximizedId((current) => (current === paneId ? null : paneId));
  };

  const handleDelete = () => {
    const message =
      workspaces.length > 1
        ? `Delete "${workspace.name}"? This can't be undone.`
        : `Delete "${workspace.name}"? It's your only workspace, so a fresh default one will replace it.`;
    if (window.confirm(message)) remove(workspace.id);
  };

  const handleExport = (list: Workspace[], label: string) => {
    downloadTextFile(exportFilename(label), serializeWorkspaces(list));
  };

  const handleImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      setNotice({ severity: "error", message: "That file is too large to be a workspace export." });
      return;
    }

    const result = parseWorkspaceFile(await file.text());
    if (!result.ok) {
      setNotice({ severity: "error", message: result.error });
      return;
    }
    add(result.workspaces);
    const count = result.workspaces.length;
    const skipped = result.skipped > 0 ? ` Skipped ${result.skipped} that couldn't be read.` : "";
    setNotice({
      severity: result.skipped > 0 ? "info" : "success",
      message: `Imported ${count} ${count === 1 ? "workspace" : "workspaces"}.${skipped}`,
    });
  };

  const handleAddShared = (shared: Workspace) => {
    const finalName = uniqueName(shared.name, workspaces.map((w) => w.name));
    add([shared]);
    onSharedTokenHandled?.();
    setNotice({ severity: "success", message: `Added "${finalName}" to your workspaces.` });
  };

  useEffect(() => {
    const paneElement = (paneId: string) =>
      layoutRef.current?.querySelector<HTMLElement>(`[data-pane-id="${paneId}"]`) ?? null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || isInsideOverlay(e.target)) return;

      if (e.key === "Escape") {
        if (maximizedPaneId && !isTextField(e.target)) {
          e.preventDefault();
          setMaximizedId(null);
        }
        return;
      }

      const command = matchShortcut(e);
      if (!command) return;
      // Alt+Arrow moves by word inside text fields; leave that alone.
      if ((command.type === "focus" || command.type === "swap") && isTextField(e.target)) return;
      e.preventDefault();

      switch (command.type) {
        case "preset": {
          const presetId = LAYOUT_PRESET_IDS[command.index];
          if (presetId) {
            setMaximizedId(null);
            applyPreset(presetId);
          }
          break;
        }
        case "focus":
        case "swap": {
          if (!activePaneId || maximizedPaneId) break;
          const neighbor = findNeighbor(rects, activePaneId, command.direction);
          if (!neighbor) break;
          if (command.type === "swap") {
            swapPanes(activePaneId, neighbor);
            paneElement(activePaneId)?.focus();
          } else {
            setActiveId(neighbor);
            paneElement(neighbor)?.focus();
          }
          break;
        }
        case "maximize":
          if (activePaneId && visibleIds.length > 1) {
            setMaximizedId(maximizedPaneId === activePaneId ? null : activePaneId);
          }
          break;
        case "address":
          if (activePaneId) {
            paneElement(activePaneId)
              ?.querySelector<HTMLInputElement>('input[aria-label="Pane address"]')
              ?.focus();
          }
          break;
      }
    };

    // Capture phase, so Escape restores a maximized pane before it can close the workspace.
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [activePaneId, maximizedPaneId, rects, visibleIds.length, applyPreset, swapPanes]);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{
          px: 1,
          py: 0.75,
          overflowX: "auto",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <WorkspaceMenu
          workspaces={workspaces}
          active={workspace}
          onSwitch={(workspaceId) => {
            setMaximizedId(null);
            switchTo(workspaceId);
          }}
          onNew={() => setTemplatesOpen(true)}
          onRename={() => setRenaming(workspace)}
          onDuplicate={() => duplicate(workspace.id)}
          onShare={() => setShareUrl(buildShareUrl(workspace, shareBaseUrl ?? currentPageUrl()))}
          onExportCurrent={() => handleExport([workspace], workspace.name)}
          onExportAll={() => handleExport(workspaces, "all-workspaces")}
          onImport={() => fileInputRef.current?.click()}
          onDelete={handleDelete}
        />

        <ToggleButtonGroup
          exclusive
          size="small"
          value={workspace.presetId}
          onChange={(_, next: LayoutPresetId | null) => {
            // Clicking the selected layout again evens out its sizes.
            const presetId = next ?? workspace.presetId;
            if (presetId) choosePreset(presetId);
          }}
          aria-label="Layout"
        >
          {LAYOUT_PRESET_IDS.map((presetId) => (
            <Tooltip
              key={presetId}
              title={
                presetId === workspace.presetId
                  ? `${LAYOUT_PRESETS[presetId].label} — click again to even out sizes`
                  : LAYOUT_PRESETS[presetId].label
              }
            >
              <ToggleButton
                value={presetId}
                aria-label={LAYOUT_PRESETS[presetId].label}
                sx={{ px: 1, py: 0.5 }}
              >
                <PresetIcon presetId={presetId} />
              </ToggleButton>
            </Tooltip>
          ))}
        </ToggleButtonGroup>

        {hiddenCount > 0 && (
          <Tooltip title="These panes keep their addresses. Pick a bigger layout to show them again.">
            <Chip size="small" variant="outlined" label={`${hiddenCount} hidden`} />
          </Tooltip>
        )}

        {maximizedPaneId && (
          <Tooltip title="Show all panes again (Esc)">
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              icon={<FullscreenExitIcon />}
              label="Restore layout"
              onClick={() => setMaximizedId(null)}
            />
          </Tooltip>
        )}

        <Box sx={{ flex: 1 }} />

        <Tooltip title="Keyboard shortcuts">
          <IconButton
            size="small"
            aria-label="Keyboard shortcuts"
            onClick={(e) => setHelpAnchor(e.currentTarget)}
          >
            <KeyboardIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {onExit && (
          <Tooltip title="Exit full screen (Esc)">
            <IconButton size="small" aria-label="Exit Pane Manager" onClick={onExit}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <Popover
        open={Boolean(helpAnchor)}
        anchorEl={helpAnchor}
        onClose={() => setHelpAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { p: 2, maxWidth: 360 } } }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          Keyboard shortcuts
        </Typography>
        <Box
          component="dl"
          sx={{
            m: 0,
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            columnGap: 2,
            rowGap: 0.75,
            alignItems: "center",
          }}
        >
          {SHORTCUT_HELP.map(({ keys, description }) => (
            <Box key={description} sx={{ display: "contents" }}>
              <Box
                component="dt"
                sx={{
                  justifySelf: "start",
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  fontFamily: "monospace",
                  fontSize: 12,
                  whiteSpace: "nowrap",
                }}
              >
                {keys}
              </Box>
              <Typography component="dd" variant="body2" sx={{ m: 0 }}>
                {description}
              </Typography>
            </Box>
          ))}
        </Box>
        <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1.5 }}>
          Shortcuts don&apos;t reach Pane Manager while you&apos;re typing inside an embedded
          site. Click a pane&apos;s header bar first. To resize, drag the gaps between panes,
          or focus a gap with Tab and use the arrow keys. Double-click a gap to even it out.
        </Typography>
      </Popover>

      <Box ref={layoutRef} sx={{ flex: 1, minHeight: 0, display: "flex" }}>
        <LayoutRenderer
          workspace={workspace}
          rects={rects}
          activePaneId={activePaneId}
          maximizedPaneId={maximizedPaneId}
          onActivate={setActiveId}
          onUrlChange={setUrl}
          onClose={closePane}
          onToggleMaximize={toggleMaximize}
          onResize={setRatio}
          onSwap={swapPanes}
        />
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={handleImportFile}
      />
      <TemplateDialog
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onPick={(templateId) => {
          setTemplatesOpen(false);
          createFromTemplate(templateId);
        }}
      />
      <RenameDialog
        workspace={renaming}
        onClose={() => setRenaming(null)}
        onSubmit={(name) => {
          if (renaming) rename(renaming.id, name);
          setRenaming(null);
        }}
      />
      <ShareDialog url={shareUrl} onClose={() => setShareUrl(null)} />
      <SharedWorkspaceDialog
        open={sharedToken !== null}
        workspace={sharedWorkspace}
        onAdd={handleAddShared}
        onDismiss={() => onSharedTokenHandled?.()}
      />
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={5000}
        onClose={(_, reason) => {
          if (reason !== "clickaway") setNotice(null);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {notice ? (
          <Alert severity={notice.severity} variant="filled" onClose={() => setNotice(null)}>
            {notice.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}

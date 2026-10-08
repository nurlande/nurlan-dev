import { useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { getHostname } from "../core/embedPolicy";
import { WORKSPACE_TEMPLATES } from "../core/templates";
import type { Workspace } from "../core/types";
import { MAX_NAME_LENGTH } from "../core/validation";
import PresetIcon from "./PresetIcon";

function hostSummary(urls: string[]): string {
  const hosts = [...new Set(urls.filter(Boolean).map(getHostname))];
  return hosts.length > 0 ? hosts.join(" · ") : "Empty panes";
}

export function TemplateDialog({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (templateId: string) => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>New workspace</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Start from a template. You can change the layout and addresses afterwards.
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 1.5,
          }}
        >
          {WORKSPACE_TEMPLATES.map((template) => (
            <ButtonBase
              key={template.id}
              onClick={() => onPick(template.id)}
              sx={{
                display: "block",
                textAlign: "left",
                p: 1.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                "&:hover, &.Mui-focusVisible": { borderColor: "primary.main" },
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <Box sx={{ color: "primary.main", display: "flex" }}>
                  <PresetIcon presetId={template.presetId} />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {template.name}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {template.description}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.8 }}>
                {hostSummary(template.urls)}
              </Typography>
            </ButtonBase>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function RenameForm({
  initialName,
  onClose,
  onSubmit,
}: {
  initialName: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
}) {
  const [name, setName] = useState(initialName);
  const trimmed = name.trim();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogTitle>Rename workspace</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={(e) => e.target.select()}
          slotProps={{ htmlInput: { maxLength: MAX_NAME_LENGTH } }}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={!trimmed} sx={{ textTransform: "none" }}>
          Rename
        </Button>
      </DialogActions>
    </form>
  );
}

export function RenameDialog({
  workspace,
  onClose,
  onSubmit,
}: {
  workspace: Workspace | null;
  onClose: () => void;
  onSubmit: (name: string) => void;
}) {
  return (
    <Dialog open={Boolean(workspace)} onClose={onClose} maxWidth="xs" fullWidth>
      {workspace && (
        <RenameForm
          key={workspace.id}
          initialName={workspace.name}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      )}
    </Dialog>
  );
}

export function ShareDialog({ url, onClose }: { url: string | null; onClose: () => void }) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [copyFailed, setCopyFailed] = useState(false);

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setCopyFailed(false);
    } catch {
      setCopyFailed(true);
    }
  };

  return (
    <Dialog open={Boolean(url)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share this workspace</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Anyone who opens this link gets a copy of the layout and addresses. Nothing is
          uploaded; everything lives inside the link itself.
        </Typography>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={url ?? ""}
          onFocus={(e) => e.target.select()}
          slotProps={{
            htmlInput: { readOnly: true, "aria-label": "Share link", spellCheck: false },
          }}
          sx={{ "& textarea": { fontFamily: "monospace", fontSize: 12, wordBreak: "break-all" } }}
        />
        {copyFailed && (
          <Alert severity="warning" sx={{ mt: 1.5 }}>
            Couldn&apos;t copy automatically. Select the link above and copy it manually.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Close
        </Button>
        <Button variant="contained" onClick={copy} sx={{ textTransform: "none" }}>
          {copiedUrl === url ? "Copied" : "Copy link"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/** Shown when the page was opened with a share link. `workspace` is `null` if the link is broken. */
export function SharedWorkspaceDialog({
  open,
  workspace,
  onAdd,
  onDismiss,
}: {
  open: boolean;
  workspace: Workspace | null;
  onAdd: (workspace: Workspace) => void;
  onDismiss: () => void;
}) {
  const urls = workspace ? workspace.paneOrder.map((id) => workspace.panes[id].url) : [];
  const filled = urls.filter(Boolean);

  return (
    <Dialog open={open} onClose={onDismiss} maxWidth="sm" fullWidth>
      <DialogTitle>{workspace ? "Open a shared workspace?" : "This link doesn't work"}</DialogTitle>
      <DialogContent>
        {workspace ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Someone shared &ldquo;{workspace.name}&rdquo; with {urls.length}{" "}
              {urls.length === 1 ? "pane" : "panes"}. Adding it keeps your own workspaces
              untouched. It will load these addresses:
            </Typography>
            {filled.length > 0 ? (
              <Box
                component="ul"
                sx={{
                  m: 0,
                  pl: 2.5,
                  fontFamily: "monospace",
                  fontSize: 12,
                  wordBreak: "break-all",
                  "& li + li": { mt: 0.5 },
                }}
              >
                {filled.map((url, index) => (
                  <li key={`${index}:${url}`}>{url}</li>
                ))}
              </Box>
            ) : (
              <Typography variant="body2">Only empty panes.</Typography>
            )}
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            The share link is incomplete or damaged, so there&apos;s nothing to open. Ask for
            the link again, and make sure it was copied in full.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onDismiss} sx={{ textTransform: "none" }}>
          {workspace ? "Not now" : "OK"}
        </Button>
        {workspace && (
          <Button
            variant="contained"
            onClick={() => onAdd(workspace)}
            sx={{ textTransform: "none" }}
          >
            Add workspace
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

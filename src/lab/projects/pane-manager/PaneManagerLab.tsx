import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Alert, Box, Button, Typography } from "@mui/material";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import PaneManager from "./components/PaneManager";

export default function PaneManagerLab() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // The workspace is portaled outside #root, so this only disables the page behind it.
    const appRoot = document.getElementById("root");
    appRoot?.setAttribute("inert", "");

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const active = document.activeElement;
      if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return;
      setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      appRoot?.removeAttribute("inert");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

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
          Pane Manager
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 480, mx: "auto" }}>
          Open up to four sites side by side in one browser tab. Pick a layout, type an
          address into each pane, and everything is remembered for next time.
        </Typography>

        <Alert severity="info" sx={{ maxWidth: 520, mx: "auto", mb: 4, textAlign: "left" }}>
          Many work tools (GitLab, GitHub, YouTrack, Jira, Google) refuse to be shown inside
          other pages. Those panes offer an &ldquo;Open in new window&rdquo; button instead. A
          desktop version will remove this limit later.
        </Alert>

        <Button
          variant="contained"
          size="large"
          startIcon={<OpenInFullIcon />}
          onClick={() => setOpen(true)}
          sx={{ textTransform: "none", fontWeight: 600, px: 4 }}
        >
          Open workspace
        </Button>
      </Box>

      {open &&
        createPortal(
          <Box
            role="dialog"
            aria-modal="true"
            aria-label="Pane Manager workspace"
            sx={{
              position: "fixed",
              inset: 0,
              zIndex: 1250,
              bgcolor: "background.default",
            }}
          >
            <PaneManager onExit={() => setOpen(false)} />
          </Box>,
          document.body
        )}
    </>
  );
}

import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { LAYOUT_PRESET_IDS, LAYOUT_PRESETS } from "../core/layoutTree";
import type { LayoutPresetId } from "../core/types";
import { getVisiblePaneIds } from "../core/workspace";
import { useWorkspace } from "../hooks/useWorkspace";
import LayoutRenderer from "./LayoutRenderer";
import PresetIcon from "./PresetIcon";

interface PaneManagerProps {
  onExit?: () => void;
}

export default function PaneManager({ onExit }: PaneManagerProps) {
  const { workspace, setUrl, applyPreset, closePane, reset } = useWorkspace();
  const hiddenCount = workspace.paneOrder.length - getVisiblePaneIds(workspace).length;

  const handleReset = () => {
    if (window.confirm("Reset the workspace to the default layout and addresses?")) {
      reset();
    }
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{
          px: 1.5,
          py: 0.75,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
          Pane Manager
        </Typography>

        <ToggleButtonGroup
          exclusive
          size="small"
          value={workspace.presetId}
          onChange={(_, next: LayoutPresetId | null) => {
            if (next) applyPreset(next);
          }}
          aria-label="Layout"
        >
          {LAYOUT_PRESET_IDS.map((presetId) => (
            <Tooltip key={presetId} title={LAYOUT_PRESETS[presetId].label}>
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

        <Box sx={{ flex: 1 }} />

        <Button
          size="small"
          startIcon={<RestartAltIcon />}
          onClick={handleReset}
          sx={{ textTransform: "none", whiteSpace: "nowrap" }}
        >
          Reset
        </Button>
        {onExit && (
          <Tooltip title="Exit full screen (Esc)">
            <IconButton size="small" aria-label="Exit Pane Manager" onClick={onExit}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <LayoutRenderer workspace={workspace} onUrlChange={setUrl} onClose={closePane} />
    </Box>
  );
}

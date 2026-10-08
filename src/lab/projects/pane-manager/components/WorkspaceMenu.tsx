import { useState } from "react";
import {
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LinkIcon from "@mui/icons-material/Link";
import UploadIcon from "@mui/icons-material/Upload";
import ViewQuiltIcon from "@mui/icons-material/ViewQuilt";
import type { Workspace } from "../core/types";

interface WorkspaceMenuProps {
  workspaces: Workspace[];
  active: Workspace;
  onSwitch: (workspaceId: string) => void;
  onNew: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onShare: () => void;
  onExportCurrent: () => void;
  onExportAll: () => void;
  onImport: () => void;
  onDelete: () => void;
}

export default function WorkspaceMenu({
  workspaces,
  active,
  onSwitch,
  onNew,
  onRename,
  onDuplicate,
  onShare,
  onExportCurrent,
  onExportAll,
  onImport,
  onDelete,
}: WorkspaceMenuProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const close = () => setAnchor(null);
  const run = (action: () => void) => () => {
    close();
    action();
  };

  const paneCount = (workspace: Workspace) => {
    const count = workspace.paneOrder.length;
    return `${count} ${count === 1 ? "pane" : "panes"}`;
  };

  return (
    <>
      <Button
        color="inherit"
        startIcon={<ViewQuiltIcon />}
        endIcon={<ExpandMoreIcon />}
        onClick={(e) => setAnchor(e.currentTarget)}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        aria-label={`Workspace: ${active.name}`}
        sx={{
          textTransform: "none",
          fontWeight: 700,
          minWidth: 0,
          maxWidth: 220,
          "& .workspace-name": {
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          },
        }}
      >
        <span className="workspace-name">{active.name}</span>
      </Button>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        slotProps={{ paper: { sx: { minWidth: 260, maxHeight: "70vh" } } }}
      >
        <ListSubheader sx={{ lineHeight: "32px", bgcolor: "transparent" }}>Workspaces</ListSubheader>
        {workspaces.map((workspace) => (
          <MenuItem
            key={workspace.id}
            selected={workspace.id === active.id}
            onClick={run(() => onSwitch(workspace.id))}
          >
            <ListItemIcon>
              {workspace.id === active.id && <CheckIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText
              primary={workspace.name}
              secondary={paneCount(workspace)}
              slotProps={{ primary: { noWrap: true } }}
            />
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={run(onNew)}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>New workspace…</ListItemText>
        </MenuItem>
        <MenuItem onClick={run(onRename)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename…</ListItemText>
        </MenuItem>
        <MenuItem onClick={run(onDuplicate)}>
          <ListItemIcon>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem onClick={run(onShare)}>
          <ListItemIcon>
            <LinkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share link…</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={run(onExportCurrent)}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export this workspace</ListItemText>
        </MenuItem>
        <MenuItem onClick={run(onExportAll)}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export all workspaces</ListItemText>
        </MenuItem>
        <MenuItem onClick={run(onImport)}>
          <ListItemIcon>
            <UploadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Import from file…</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={run(onDelete)} sx={{ color: "error.main" }}>
          <ListItemIcon sx={{ color: "inherit" }}>
            <DeleteOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete workspace</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

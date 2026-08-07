import { useState } from "react";
import { Box, Button, Typography, Stack } from "@mui/material";

/**
 * Starter mini project — swap this for your own experiments.
 * Add new files under `src/lab/projects/` and register them in `registry.ts`.
 */
export default function HelloLab() {
  const [count, setCount] = useState(0);

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
        Hello Lab
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 420, mx: "auto" }}>
        This is your sandbox. Build small interactive experiments here without
        touching the main portfolio sections.
      </Typography>

      <Typography variant="h3" sx={{ fontWeight: 700, mb: 3, fontVariantNumeric: "tabular-nums" }}>
        {count}
      </Typography>

      <Stack direction="row" spacing={1.5} justifyContent="center">
        <Button variant="outlined" onClick={() => setCount((c) => c - 1)}>
          −1
        </Button>
        <Button variant="contained" onClick={() => setCount(0)}>
          Reset
        </Button>
        <Button variant="outlined" onClick={() => setCount((c) => c + 1)}>
          +1
        </Button>
      </Stack>
    </Box>
  );
}

import { Box, Typography, IconButton, Stack } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { profile } from "../constants/profile";

export default function Footer() {
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: { xs: 2, sm: 4, md: 8 },
        backgroundColor: (theme) => theme.palette.background.paper,
        borderTop: "1px solid",
        borderColor: "divider",
        textAlign: "center",
      }}
    >
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={1}
        sx={{ mb: 1 }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} {profile.name} {profile.surname}
        </Typography>
        <IconButton
          color="primary"
          size="small"
          onClick={handleBackToTop}
          aria-label="back to top"
        >
          <ArrowUpwardIcon />
        </IconButton>
      </Stack>

      <Typography variant="body2" color="text.secondary">
        Made with ❤️ using React & Material UI
      </Typography>
    </Box>
  );
}

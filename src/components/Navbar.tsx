import { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { Box, Button, Drawer, List, ListItem } from "@mui/material";
import { Link as ScrollLink } from "react-scroll";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { trackThemeToggle } from "../utils/analytics";

const navItems = ["Home", "Projects", "Experience", "Skills", "Contact"];

interface NavbarProps {
  mode: "light" | "dark";
  toggleMode: () => void;
}

export default function Navbar({ mode, toggleMode }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleThemeToggle = () => {
    const newMode = mode === "light" ? "dark" : "light";
    trackThemeToggle(newMode);
    toggleMode();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileOpen(false);
  };

  const drawer = (
    <Box
      onClick={handleDrawerToggle}
      sx={{
        textAlign: "center",
        height: "100%",
        background: (theme) =>
          theme.palette.mode === "light"
            ? "linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)"
            : "linear-gradient(180deg, #1a1f3a 0%, #0a0e27 100%)",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          my: 3,
          cursor: "pointer",
          fontWeight: 700,
          background: (theme) =>
            theme.palette.mode === "light"
              ? "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)"
              : "linear-gradient(135deg, #42a5f5 0%, #64b5f6 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          transition: "all 0.3s ease",
          display: "inline-block",
          "&:hover": {
            transform: "scale(1.05)",
            filter: "brightness(1.1)",
          },
        }}
        onClick={scrollToTop}
      >
        nurlandev
      </Typography>
      <List sx={{ px: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item} disablePadding sx={{ mb: 1 }}>
            <ScrollLink
              key={item}
              to={item === "Home" ? "hero" : item.toLowerCase()}
              smooth={true}
              duration={300}
              offset={-70}
              activeClass="active"
              onClick={handleDrawerToggle}
              style={{ width: "100%" }}
            >
              <Button
                fullWidth
                sx={{
                  color: "text.primary",
                  fontWeight: 500,
                  py: 1.5,
                  borderRadius: 2,
                  transition: "all 0.2s ease",
                  "&.active": {
                    color: "primary.main",
                    background: (theme) =>
                      theme.palette.mode === "light"
                        ? "rgba(25, 118, 210, 0.1)"
                        : "rgba(66, 165, 245, 0.2)",
                    fontWeight: 600,
                  },
                  "&:hover": {
                    background: (theme) =>
                      theme.palette.mode === "light"
                        ? "rgba(25, 118, 210, 0.08)"
                        : "rgba(66, 165, 245, 0.15)",
                  },
                  "&:active": {
                    transform: "scale(0.95)",
                  },
                }}
              >
                {item}
              </Button>
            </ScrollLink>
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <IconButton
          onClick={handleThemeToggle}
          sx={{
            color: "text.primary",
            border: (theme) =>
              theme.palette.mode === "light"
                ? "1px solid rgba(0, 0, 0, 0.1)"
                : "1px solid rgba(255, 255, 255, 0.2)",
            "&:hover": {
              background: (theme) =>
                theme.palette.mode === "light"
                  ? "rgba(25, 118, 210, 0.1)"
                  : "rgba(66, 165, 245, 0.2)",
            },
          }}
        >
          {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar 
        component="nav" 
        color="default" 
        elevation={0} 
        position="sticky"
        sx={{
          backdropFilter: "blur(20px)",
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? scrolled
                ? "rgba(255, 255, 255, 0.95)"
                : "rgba(255, 255, 255, 0.9)"
              : scrolled
                ? "rgba(26, 31, 58, 0.95)"
                : "rgba(26, 31, 58, 0.9)",
          borderBottom: (theme) =>
            theme.palette.mode === "light"
              ? scrolled
                ? "1px solid rgba(0, 0, 0, 0.12)"
                : "1px solid rgba(0, 0, 0, 0.08)"
              : scrolled
                ? "1px solid rgba(255, 255, 255, 0.15)"
                : "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: scrolled
            ? (theme) =>
                theme.palette.mode === "light"
                  ? "0px 4px 20px rgba(0, 0, 0, 0.08)"
                  : "0px 4px 20px rgba(0, 0, 0, 0.5)"
            : "none",
          transition: "all 0.3s ease",
        }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            maxWidth: "1400px",
            width: "100%",
            mx: "auto",
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              minWidth: 0,
              overflow: "visible",
            }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                cursor: "pointer",
                background: (theme) =>
                  theme.palette.mode === "light"
                    ? "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)"
                    : "linear-gradient(135deg, #42a5f5 0%, #64b5f6 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                transition: "all 0.3s ease",
                display: "inline-block",
                whiteSpace: "nowrap",
                "&:hover": {
                  transform: "scale(1.05)",
                  filter: "brightness(1.1)",
                },
              }}
              onClick={scrollToTop}
            >
              nurlandev
            </Typography>
          </Box>

          {/* Desktop Menu */}
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              gap: 1,
            }}
          >
            {navItems.map((item) => (
              <ScrollLink
                key={item}
                to={item === "Home" ? "hero" : item.toLowerCase()}
                smooth={true}
                duration={300}
                offset={-70}
                activeClass="active"
              >
                <Button
                  sx={{
                    color: "text.primary",
                    fontWeight: 500,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    transition: "all 0.2s ease",
                    position: "relative",
                    "&.active": {
                      color: "primary.main",
                      fontWeight: 600,
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: 4,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "60%",
                        height: 2,
                        background: (theme) =>
                          theme.palette.mode === "light"
                            ? "linear-gradient(90deg, #1976d2, #42a5f5)"
                            : "linear-gradient(90deg, #42a5f5, #64b5f6)",
                        borderRadius: 1,
                      },
                    },
                    "&:hover": {
                      color: "primary.main",
                      background: (theme) =>
                        theme.palette.mode === "light"
                          ? "rgba(25, 118, 210, 0.08)"
                          : "rgba(66, 165, 245, 0.15)",
                    },
                    "&:active": {
                      transform: "scale(0.95)",
                    },
                  }}
                >
                  {item}
                </Button>
              </ScrollLink>
            ))}
            {/* Dark/Light mode toggle */}
            <IconButton
              onClick={handleThemeToggle}
              aria-label={`Switch to ${mode === "light" ? "dark" : "light"} mode`}
              sx={{
                ml: 1,
                color: "text.primary",
                border: (theme) =>
                  theme.palette.mode === "light"
                    ? "1px solid rgba(0, 0, 0, 0.1)"
                    : "1px solid rgba(255, 255, 255, 0.2)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: (theme) =>
                    theme.palette.mode === "light"
                      ? "rgba(25, 118, 210, 0.1)"
                      : "rgba(66, 165, 245, 0.2)",
                  transform: "rotate(180deg)",
                  border: (theme) =>
                    theme.palette.mode === "light"
                      ? "1px solid rgba(25, 118, 210, 0.3)"
                      : "1px solid rgba(66, 165, 245, 0.4)",
                },
              }}
            >
              {mode === "light" ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            aria-label={mobileOpen ? "close navigation menu" : "open navigation menu"}
            aria-expanded={mobileOpen}
            edge="end"
            onClick={handleDrawerToggle}
            sx={{ display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        aria-label="Navigation menu"
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280,
            backdropFilter: "blur(20px)",
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

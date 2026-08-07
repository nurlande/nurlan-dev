import { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { Box, Button, Drawer, List, ListItem } from "@mui/material";
import { Link as ScrollLink } from "react-scroll";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { trackThemeToggle } from "../utils/analytics";

type NavItem =
  | { label: string; kind: "scroll"; to: string }
  | { label: string; kind: "route"; to: string };

const navItems: NavItem[] = [
  { label: "Home", kind: "scroll", to: "hero" },
  { label: "Projects", kind: "scroll", to: "projects" },
  { label: "Experience", kind: "scroll", to: "experience" },
  { label: "Skills", kind: "scroll", to: "skills" },
  { label: "Lab", kind: "route", to: "/lab" },
  { label: "Contact", kind: "scroll", to: "contact" },
];

interface NavbarProps {
  mode: "light" | "dark";
  toggleMode: () => void;
}

const navButtonSx = {
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
      background: (theme: { palette: { mode: string } }) =>
        theme.palette.mode === "light"
          ? "linear-gradient(90deg, #1976d2, #42a5f5)"
          : "linear-gradient(90deg, #42a5f5, #64b5f6)",
      borderRadius: 1,
    },
  },
  "&:hover": {
    color: "primary.main",
    background: (theme: { palette: { mode: string } }) =>
      theme.palette.mode === "light"
        ? "rgba(25, 118, 210, 0.08)"
        : "rgba(66, 165, 245, 0.15)",
  },
  "&:active": {
    transform: "scale(0.95)",
  },
} as const;

const drawerButtonSx = {
  color: "text.primary",
  fontWeight: 500,
  py: 1.5,
  borderRadius: 2,
  transition: "all 0.2s ease",
  "&.active": {
    color: "primary.main",
    background: (theme: { palette: { mode: string } }) =>
      theme.palette.mode === "light"
        ? "rgba(25, 118, 210, 0.1)"
        : "rgba(66, 165, 245, 0.2)",
    fontWeight: 600,
  },
  "&:hover": {
    background: (theme: { palette: { mode: string } }) =>
      theme.palette.mode === "light"
        ? "rgba(25, 118, 210, 0.08)"
        : "rgba(66, 165, 245, 0.15)",
  },
  "&:active": {
    transform: "scale(0.95)",
  },
} as const;

export default function Navbar({ mode, toggleMode }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const isLab = location.pathname.startsWith("/lab");

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

  const goHome = () => {
    if (isHome) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
    setMobileOpen(false);
  };

  const renderNavButton = (item: NavItem, fullWidth = false) => {
    const buttonSx = fullWidth ? drawerButtonSx : navButtonSx;
    const isRouteActive =
      item.kind === "route" &&
      (item.to === "/lab" ? isLab : location.pathname === item.to);

    if (item.kind === "route") {
      return (
        <Button
          key={item.label}
          component={RouterLink}
          to={item.to}
          fullWidth={fullWidth}
          className={isRouteActive ? "active" : undefined}
          onClick={() => fullWidth && setMobileOpen(false)}
          sx={buttonSx}
        >
          {item.label}
        </Button>
      );
    }

    if (isHome) {
      return (
        <ScrollLink
          key={item.label}
          to={item.to}
          smooth={true}
          duration={300}
          offset={-70}
          activeClass="active"
          onClick={() => fullWidth && setMobileOpen(false)}
          style={{ width: fullWidth ? "100%" : undefined }}
        >
          <Button fullWidth={fullWidth} sx={buttonSx}>
            {item.label}
          </Button>
        </ScrollLink>
      );
    }

    return (
      <Button
        key={item.label}
        component={RouterLink}
        to={`/#${item.to}`}
        fullWidth={fullWidth}
        onClick={() => fullWidth && setMobileOpen(false)}
        sx={buttonSx}
      >
        {item.label}
      </Button>
    );
  };

  const brandSx = {
    fontWeight: 700,
    cursor: "pointer",
    background: (theme: { palette: { mode: string } }) =>
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
  };

  const drawer = (
    <Box
      onClick={() => setMobileOpen(false)}
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
        sx={{ ...brandSx, my: 3 }}
        onClick={(e) => {
          e.stopPropagation();
          goHome();
        }}
      >
        nurlandev
      </Typography>
      <List sx={{ px: 2 }}>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
            {renderNavButton(item, true)}
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            handleThemeToggle();
          }}
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
              sx={{ ...brandSx, whiteSpace: "nowrap" }}
              onClick={goHome}
            >
              nurlandev
            </Typography>
          </Box>

          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              gap: 1,
            }}
          >
            {navItems.map((item) => renderNavButton(item))}
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

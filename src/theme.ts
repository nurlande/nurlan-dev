// src/theme.ts
import { createTheme, type ThemeOptions } from "@mui/material/styles";

const getDesignTokens = (mode: "light" | "dark"): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: mode === "light" ? "#1976d2" : "#42a5f5",
      light: mode === "light" ? "#42a5f5" : "#64b5f6",
      dark: mode === "light" ? "#1565c0" : "#1976d2",
    },
    ...(mode === "light"
      ? {
          background: {
            default: "#f8f9fa",
            paper: "#ffffff",
          },
          text: {
            primary: "#1a1a1a",
            secondary: "rgba(0, 0, 0, 0.6)",
          },
        }
      : {
          background: {
            default: "#0a0e27",
            paper: "#1a1f3a",
          },
          text: {
            primary: "#ffffff",
            secondary: "rgba(255, 255, 255, 0.7)",
          },
        }),
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: (mode === "light"
    ? [
        "none",
        "0px 2px 4px rgba(0,0,0,0.05)",
        "0px 4px 8px rgba(0,0,0,0.08)",
        "0px 8px 16px rgba(0,0,0,0.1)",
        "0px 12px 24px rgba(0,0,0,0.12)",
        "0px 16px 32px rgba(0,0,0,0.14)",
        "0px 20px 40px rgba(0,0,0,0.16)",
        "0px 24px 48px rgba(0,0,0,0.18)",
        "0px 28px 56px rgba(0,0,0,0.2)",
        "0px 32px 64px rgba(0,0,0,0.22)",
        "0px 36px 72px rgba(0,0,0,0.24)",
        "0px 40px 80px rgba(0,0,0,0.26)",
        "0px 44px 88px rgba(0,0,0,0.28)",
        "0px 48px 96px rgba(0,0,0,0.3)",
        "0px 52px 104px rgba(0,0,0,0.32)",
        "0px 56px 112px rgba(0,0,0,0.34)",
        "0px 60px 120px rgba(0,0,0,0.36)",
        "0px 64px 128px rgba(0,0,0,0.38)",
        "0px 68px 136px rgba(0,0,0,0.4)",
        "0px 72px 144px rgba(0,0,0,0.42)",
        "0px 76px 152px rgba(0,0,0,0.44)",
        "0px 80px 160px rgba(0,0,0,0.46)",
        "0px 84px 168px rgba(0,0,0,0.48)",
        "0px 88px 176px rgba(0,0,0,0.5)",
        "0px 92px 184px rgba(0,0,0,0.52)",
      ]
    : [
        "none",
        "0px 2px 4px rgba(0,0,0,0.3)",
        "0px 4px 8px rgba(0,0,0,0.35)",
        "0px 8px 16px rgba(0,0,0,0.4)",
        "0px 12px 24px rgba(0,0,0,0.45)",
        "0px 16px 32px rgba(0,0,0,0.5)",
        "0px 20px 40px rgba(0,0,0,0.55)",
        "0px 24px 48px rgba(0,0,0,0.6)",
        "0px 28px 56px rgba(0,0,0,0.65)",
        "0px 32px 64px rgba(0,0,0,0.7)",
        "0px 36px 72px rgba(0,0,0,0.75)",
        "0px 40px 80px rgba(0,0,0,0.8)",
        "0px 44px 88px rgba(0,0,0,0.85)",
        "0px 48px 96px rgba(0,0,0,0.9)",
        "0px 52px 104px rgba(0,0,0,0.95)",
        "0px 56px 112px rgba(0,0,0,1)",
        "0px 60px 120px rgba(0,0,0,1)",
        "0px 64px 128px rgba(0,0,0,1)",
        "0px 68px 136px rgba(0,0,0,1)",
        "0px 72px 144px rgba(0,0,0,1)",
        "0px 76px 152px rgba(0,0,0,1)",
        "0px 80px 160px rgba(0,0,0,1)",
        "0px 84px 168px rgba(0,0,0,1)",
        "0px 88px 176px rgba(0,0,0,1)",
        "0px 92px 184px rgba(0,0,0,1)",
      ]) as ThemeOptions["shadows"],
});

export const getTheme = (mode: "light" | "dark") => createTheme(getDesignTokens(mode));

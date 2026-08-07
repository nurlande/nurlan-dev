import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { useState, useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { getTheme } from "./theme";
import Navbar from "./components/Navbar";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorBoundary from "./components/ErrorBoundary";
import AnimatedBackground from "./components/AnimatedBackground";
import { initGA, trackPageView } from "./utils/analytics";

const HomePage = lazy(() => import("./pages/HomePage"));
const LabPage = lazy(() => import("./pages/LabPage"));
const MiniProjectPage = lazy(() => import("./pages/MiniProjectPage"));

function AnalyticsListener() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return null;
}

function AppShell() {
  const [mode, setMode] = useState<"light" | "dark">(() => {
    const savedMode = localStorage.getItem("themeMode");
    return (savedMode === "light" || savedMode === "dark" ? savedMode : "dark") as
      | "light"
      | "dark";
  });

  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  useEffect(() => {
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (gaId) {
      initGA(gaId);
    }
  }, []);

  const toggleMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeProvider theme={getTheme(mode)}>
      <CssBaseline />
      <ErrorBoundary>
        <Box
          sx={{
            position: "relative",
            minHeight: "100vh",
            zIndex: 1,
          }}
        >
          <AnimatedBackground mode={mode} />
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Navbar mode={mode} toggleMode={toggleMode} />
            <Suspense fallback={<LoadingSpinner message="Loading..." />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/lab" element={<LabPage />} />
                <Route path="/lab/:projectId" element={<MiniProjectPage />} />
              </Routes>
            </Suspense>
          </Box>
        </Box>
        <AnalyticsListener />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;

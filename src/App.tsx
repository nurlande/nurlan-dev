import { ThemeProvider, CssBaseline, Container, Box } from "@mui/material";
import { useState, useEffect, Suspense, lazy } from "react";
import { getTheme } from "./theme";
import Navbar from "./components/Navbar";
import About from "./components/About";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorBoundary from "./components/ErrorBoundary";
import AnimatedBackground from "./components/AnimatedBackground";
import { initGA, trackPageView } from "./utils/analytics";

// Lazy load components for code splitting
const Projects = lazy(() => import("./components/Projects"));
const Experience = lazy(() => import("./components/Experience"));
const Skills = lazy(() => import("./components/Skills"));
const Contact = lazy(() => import("./components/Contact"));
const Footer = lazy(() => import("./components/Footer"));

function App() {
  // Load theme preference from localStorage or default to dark
  const [mode, setMode] = useState<"light" | "dark">(() => {
    const savedMode = localStorage.getItem("themeMode");
    return (savedMode === "light" || savedMode === "dark" ? savedMode : "dark") as "light" | "dark";
  });

  useEffect(() => {
    // Save theme preference to localStorage whenever it changes
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  // Initialize analytics
  useEffect(() => {
    // Initialize Google Analytics if measurement ID is provided
    const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (gaId) {
      initGA(gaId);
    }

    // Track initial page view
    trackPageView(window.location.pathname);
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
            <About />
            <Container>
              <Suspense fallback={<LoadingSpinner message="Loading projects..." />}>
                <ErrorBoundary>
                  <Projects />
                  <Experience />
                  <Skills />
                  <Contact />
                </ErrorBoundary>
              </Suspense>
            </Container>
            <Suspense fallback={null}>
              <Footer />
            </Suspense>
          </Box>
        </Box>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;

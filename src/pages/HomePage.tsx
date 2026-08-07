import { Container } from "@mui/material";
import { Suspense, lazy, useEffect } from "react";
import { useLocation } from "react-router-dom";
import About from "../components/About";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBoundary from "../components/ErrorBoundary";

const Projects = lazy(() => import("../components/Projects"));
const Experience = lazy(() => import("../components/Experience"));
const Skills = lazy(() => import("../components/Skills"));
const Contact = lazy(() => import("../components/Contact"));
const Footer = lazy(() => import("../components/Footer"));

const SECTION_IDS = new Set(["hero", "projects", "experience", "skills", "contact"]);

export default function HomePage() {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (!hash || !SECTION_IDS.has(hash)) return;

    const timer = window.setTimeout(() => {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);

    return () => window.clearTimeout(timer);
  }, [location.hash, location.pathname]);

  return (
    <>
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
    </>
  );
}

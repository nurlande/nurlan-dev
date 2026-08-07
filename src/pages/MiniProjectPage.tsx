import { Suspense, lazy } from "react";
import { Link as RouterLink, useParams, Navigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Chip,
  Stack,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getMiniProject } from "../constants/miniProjects";
import { loadMiniProject } from "../lab/registry";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBoundary from "../components/ErrorBoundary";

const Footer = lazy(() => import("../components/Footer"));

export default function MiniProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = projectId ? getMiniProject(projectId) : undefined;
  const ProjectComponent = projectId ? loadMiniProject(projectId) : null;

  if (!project || !ProjectComponent) {
    return <Navigate to="/lab" replace />;
  }

  return (
    <>
      <Box sx={{ py: 6, px: { xs: 2, sm: 4, md: 8 }, minHeight: "70vh" }}>
        <Container maxWidth="md">
          <Button
            component={RouterLink}
            to="/lab"
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 3, textTransform: "none", fontWeight: 600 }}
          >
            Back to Lab
          </Button>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ sm: "center" }}
            spacing={1.5}
            sx={{ mb: 1 }}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.75rem", md: "2.25rem" },
              }}
            >
              {project.title}
            </Typography>
            <Chip
              label={project.status}
              size="small"
              color={project.status === "ready" ? "success" : "default"}
              sx={{ textTransform: "capitalize", alignSelf: "flex-start" }}
            />
          </Stack>

          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {project.description}
          </Typography>

          {project.technologies && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 4 }}>
              {project.technologies.map((tech) => (
                <Chip key={tech} label={tech} size="small" />
              ))}
            </Box>
          )}

          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner message="Loading mini project..." />}>
              <ProjectComponent />
            </Suspense>
          </ErrorBoundary>
        </Container>
      </Box>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  );
}

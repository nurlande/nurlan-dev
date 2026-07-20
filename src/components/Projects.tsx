import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  IconButton,
} from "@mui/material";
import { BusinessCenter, OpenInNew, Inventory2, Web } from "@mui/icons-material";
import type { ReactNode } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  projectSections,
  NDA_NOTICE,
  type Project,
  type ProjectCategory,
  type ProjectSection,
} from "../constants/projects";
import { trackProjectClick } from "../utils/analytics";
import { use3DTilt } from "../hooks/use3DTilt";

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const categoryIcons: Record<ProjectCategory, ReactNode> = {
  commercial: <BusinessCenter sx={{ fontSize: 48, opacity: 0.9 }} />,
  library: <Inventory2 sx={{ fontSize: 48, opacity: 0.9 }} />,
  personal: <Web sx={{ fontSize: 48, opacity: 0.9 }} />,
};

const categoryGradients = {
  light: {
    commercial: "linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)",
    library: "linear-gradient(135deg, #6a1b9a 0%, #ab47bc 100%)",
    personal: "linear-gradient(135deg, #00838f 0%, #26c6da 100%)",
  },
  dark: {
    commercial: "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)",
    library: "linear-gradient(135deg, #4a148c 0%, #8e24aa 100%)",
    personal: "linear-gradient(135deg, #006064 0%, #00acc1 100%)",
  },
};

function getGridColumns(section: ProjectSection) {
  const sm = section.columns?.sm ?? 2;
  const md = section.columns?.md ?? 3;

  return {
    xs: "1fr",
    sm: `repeat(${sm}, 1fr)`,
    md: `repeat(${md}, 1fr)`,
  };
}

function ProjectCard({
  project,
  category,
  index,
  isInView,
}: {
  project: Project;
  category: ProjectCategory;
  index: number;
  isInView: boolean;
}) {
  const tiltRef = use3DTilt({ maxTilt: 10, scale: 1.02 });
  const hasLink = Boolean(project.link);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        ref={tiltRef}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 4,
          boxShadow: (theme) =>
            theme.palette.mode === "light"
              ? "0px 4px 20px rgba(0, 0, 0, 0.08)"
              : "0px 4px 20px rgba(0, 0, 0, 0.5)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          position: "relative",
          transformStyle: "preserve-3d",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: (theme) =>
              theme.palette.mode === "light"
                ? "linear-gradient(90deg, #1976d2, #42a5f5)"
                : "linear-gradient(90deg, #42a5f5, #64b5f6)",
            transform: "scaleX(0)",
            transformOrigin: "left",
            transition: "transform 0.4s ease",
          },
          "&:hover": {
            boxShadow: (theme) =>
              theme.palette.mode === "light"
                ? "0px 12px 40px rgba(25, 118, 210, 0.2)"
                : "0px 12px 40px rgba(66, 165, 245, 0.3)",
            "&::before": {
              transform: "scaleX(1)",
            },
          },
        }}
      >
        <Box
          sx={{
            height: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            background: (theme) =>
              theme.palette.mode === "light"
                ? categoryGradients.light[category]
                : categoryGradients.dark[category],
          }}
        >
          {categoryIcons[category]}
        </Box>

        {hasLink && (
          <IconButton
            component="a"
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackProjectClick(project.title)}
            aria-label={`Open ${project.title}`}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              color: "white",
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.35)",
              },
            }}
          >
            <OpenInNew fontSize="small" />
          </IconButton>
        )}

        <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            {project.title}
          </Typography>

          {project.description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {project.description}
            </Typography>
          )}

          {project.technologies && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2 }}>
              {project.technologies.map((tech) => (
                <Chip
                  key={tech}
                  label={tech}
                  size="small"
                  sx={{
                    fontSize: "0.75rem",
                    backgroundColor: (theme) =>
                      theme.palette.mode === "light"
                        ? "rgba(25, 118, 210, 0.08)"
                        : "rgba(66, 165, 245, 0.15)",
                  }}
                />
              ))}
            </Box>
          )}

          <Box sx={{ mt: "auto", display: "flex", flexWrap: "wrap", gap: 1 }}>
            {project.link && (
              <Button
                variant="contained"
                size="medium"
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackProjectClick(project.title)}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  background: (theme) =>
                    theme.palette.mode === "light"
                      ? "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)"
                      : "linear-gradient(135deg, #42a5f5 0%, #64b5f6 100%)",
                  boxShadow: (theme) =>
                    theme.palette.mode === "light"
                      ? "0px 4px 12px rgba(25, 118, 210, 0.3)"
                      : "0px 4px 12px rgba(66, 165, 245, 0.4)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: (theme) =>
                      theme.palette.mode === "light"
                        ? "0px 6px 20px rgba(25, 118, 210, 0.4)"
                        : "0px 6px 20px rgba(66, 165, 245, 0.5)",
                  },
                }}
              >
                {category === "library" ? "View on GitHub" : "View Project"}
              </Button>
            )}
            {project.demoLink && (
              <Button
                variant="outlined"
                size="medium"
                href={project.demoLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackProjectClick(`${project.title} demo`)}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                }}
              >
                Live Demo
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const visibleSections = projectSections.filter(
    (section) => section.projects.length > 0
  );

  let cardIndex = 0;

  return (
    <Box
      id="projects"
      ref={ref}
      sx={{
        py: 10,
        px: { xs: 2, sm: 4, md: 8 },
        backgroundColor: (theme) => theme.palette.background.default,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6 }}
      >
        <Typography
          variant="h4"
          component="h2"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 700,
            fontSize: { xs: "2rem", md: "2.5rem" },
            background: (theme) =>
              theme.palette.mode === "light"
                ? "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)"
                : "linear-gradient(135deg, #42a5f5 0%, #64b5f6 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
          }}
        >
          Projects
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          sx={{
            mb: 4,
            color: "text.secondary",
            fontSize: { xs: "0.95rem", md: "1.1rem" },
          }}
        >
          Commercial work, open-source packages, and personal side projects.
        </Typography>
      </motion.div>

      {visibleSections.some((section) => section.showNdaNotice) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Alert
            severity="info"
            sx={{
              mb: 6,
              borderRadius: 3,
              maxWidth: 900,
              mx: "auto",
              fontStyle: "italic",
            }}
          >
            {NDA_NOTICE}
          </Alert>
        </motion.div>
      )}

      {visibleSections.map((section, sectionIndex) => (
        <Box
          key={section.id}
          sx={{ mb: sectionIndex < visibleSections.length - 1 ? 8 : 0 }}
        >
          <Typography
            variant="h5"
            component="h3"
            sx={{
              fontWeight: 600,
              mb: 3,
              textAlign: { xs: "center", md: "left" },
            }}
          >
            {section.title}
            <Typography
              component="span"
              variant="body2"
              color="text.secondary"
              sx={{ ml: 1.5, fontWeight: 400 }}
            >
              ({section.projects.length})
            </Typography>
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: getGridColumns(section),
              gap: 4,
            }}
          >
            {section.projects.map((project) => {
              const currentIndex = cardIndex;
              cardIndex += 1;

              return (
                <ProjectCard
                  key={`${section.id}-${project.title}`}
                  project={project}
                  category={section.id}
                  index={currentIndex}
                  isInView={isInView}
                />
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

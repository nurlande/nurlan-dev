import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Container,
} from "@mui/material";
import { Science, ArrowForward } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef, lazy, Suspense } from "react";
import { miniProjects, type MiniProject } from "../constants/miniProjects";
import { use3DTilt } from "../hooks/use3DTilt";

const Footer = lazy(() => import("../components/Footer"));

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

function MiniProjectCard({
  project,
  index,
  isInView,
}: {
  project: MiniProject;
  index: number;
  isInView: boolean;
}) {
  const tiltRef = use3DTilt({ maxTilt: 8, scale: 1.02 });

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ delay: index * 0.08 }}
    >
      <Card
        ref={tiltRef}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: (theme) =>
            theme.palette.mode === "light"
              ? "0px 4px 20px rgba(0, 0, 0, 0.08)"
              : "0px 4px 20px rgba(0, 0, 0, 0.5)",
          transition: "box-shadow 0.3s ease",
          "&:hover": {
            boxShadow: (theme) =>
              theme.palette.mode === "light"
                ? "0px 12px 40px rgba(25, 118, 210, 0.2)"
                : "0px 12px 40px rgba(66, 165, 245, 0.3)",
          },
        }}
      >
        <Box
          sx={{
            height: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            background: (theme) =>
              theme.palette.mode === "light"
                ? "linear-gradient(135deg, #00695c 0%, #26a69a 100%)"
                : "linear-gradient(135deg, #004d40 0%, #00897b 100%)",
          }}
        >
          <Science sx={{ fontSize: 44, opacity: 0.95 }} />
        </Box>

        <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
              {project.title}
            </Typography>
            <Chip
              label={project.status}
              size="small"
              color={project.status === "ready" ? "success" : "default"}
              sx={{ textTransform: "capitalize", fontSize: "0.7rem" }}
            />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {project.description}
          </Typography>

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
                        ? "rgba(0, 105, 92, 0.08)"
                        : "rgba(38, 166, 154, 0.15)",
                  }}
                />
              ))}
            </Box>
          )}

          <Box sx={{ mt: "auto" }}>
            <Button
              component={RouterLink}
              to={`/lab/${project.id}`}
              variant="contained"
              endIcon={<ArrowForward />}
              sx={{
                textTransform: "none",
                borderRadius: 2,
                fontWeight: 600,
                background: (theme) =>
                  theme.palette.mode === "light"
                    ? "linear-gradient(135deg, #00695c 0%, #26a69a 100%)"
                    : "linear-gradient(135deg, #26a69a 0%, #4db6ac 100%)",
              }}
            >
              Open
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function LabPage() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <>
      <Box
        ref={ref}
        sx={{
          py: 10,
          px: { xs: 2, sm: 4, md: 8 },
          minHeight: "70vh",
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h4"
              component="h1"
              align="center"
              gutterBottom
              sx={{
                fontWeight: 700,
                fontSize: { xs: "2rem", md: "2.5rem" },
                background: (theme) =>
                  theme.palette.mode === "light"
                    ? "linear-gradient(135deg, #00695c 0%, #26a69a 100%)"
                    : "linear-gradient(135deg, #26a69a 0%, #4db6ac 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Lab
            </Typography>
            <Typography
              variant="subtitle1"
              align="center"
              sx={{
                mb: 6,
                color: "text.secondary",
                maxWidth: 560,
                mx: "auto",
              }}
            >
              Mini projects and experiments — a sandbox for trying ideas outside
              the main portfolio.
            </Typography>
          </motion.div>

          {miniProjects.length === 0 ? (
            <Typography align="center" color="text.secondary">
              No mini projects yet. Add one in{" "}
              <Box component="code" sx={{ fontSize: "0.9em" }}>
                src/constants/miniProjects.ts
              </Box>
              .
            </Typography>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                },
                gap: 4,
              }}
            >
              {miniProjects.map((project, index) => (
                <MiniProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  isInView={isInView}
                />
              ))}
            </Box>
          )}
        </Container>
      </Box>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  );
}

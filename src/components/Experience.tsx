import { Box, Typography, Card, CardContent } from "@mui/material";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { experiences } from "../constants/experience";

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5 },
  },
};

export default function Experience() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <Box
      id="experience"
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
          Experience
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          sx={{
            mb: 6,
            color: "text.secondary",
            fontSize: { xs: "0.95rem", md: "1.1rem" },
          }}
        >
          Career path and roles over the years.
        </Typography>
      </motion.div>

      <Box
        sx={{
          position: "relative",
          maxWidth: 800,
          mx: "auto",
          "&::before": {
            content: '""',
            position: "absolute",
            left: { xs: 11, sm: 19 },
            top: 8,
            bottom: 8,
            width: 2,
            background: (theme) =>
              theme.palette.mode === "light"
                ? "linear-gradient(180deg, #1976d2 0%, #42a5f5 60%, transparent 100%)"
                : "linear-gradient(180deg, #42a5f5 0%, #64b5f6 60%, transparent 100%)",
            borderRadius: 1,
          },
        }}
      >
        {experiences.map((job, index) => (
          <motion.div
            key={`${job.company}-${job.period}`}
            variants={itemVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ delay: index * 0.12 }}
          >
            <Box
              sx={{
                display: "flex",
                gap: { xs: 2, sm: 3 },
                mb: index < experiences.length - 1 ? 3 : 0,
                position: "relative",
              }}
            >
              <Box
                sx={{
                  flexShrink: 0,
                  width: { xs: 24, sm: 40 },
                  display: "flex",
                  justifyContent: "center",
                  pt: 2.5,
                  zIndex: 1,
                }}
              >
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: (theme) =>
                      theme.palette.mode === "light"
                        ? "linear-gradient(135deg, #1976d2, #42a5f5)"
                        : "linear-gradient(135deg, #42a5f5, #64b5f6)",
                    boxShadow: (theme) =>
                      theme.palette.mode === "light"
                        ? "0 0 0 4px rgba(25, 118, 210, 0.15)"
                        : "0 0 0 4px rgba(66, 165, 245, 0.2)",
                  }}
                />
              </Box>

              <Card
                sx={{
                  flex: 1,
                  borderRadius: 3,
                  boxShadow: (theme) =>
                    theme.palette.mode === "light"
                      ? "0px 4px 20px rgba(0, 0, 0, 0.08)"
                      : "0px 4px 20px rgba(0, 0, 0, 0.5)",
                  border: (theme) =>
                    theme.palette.mode === "light"
                      ? "1px solid rgba(25, 118, 210, 0.1)"
                      : "1px solid rgba(66, 165, 245, 0.2)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: (theme) =>
                      theme.palette.mode === "light"
                        ? "0px 12px 32px rgba(25, 118, 210, 0.15)"
                        : "0px 12px 32px rgba(66, 165, 245, 0.25)",
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {job.title}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    color="primary"
                    sx={{ fontWeight: 600, mb: 0.5 }}
                  >
                    {job.company}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1.5 }}
                  >
                    {job.period}
                  </Typography>
                  <Box
                    component="ul"
                    sx={{
                      m: 0,
                      pl: 2.25,
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.75,
                    }}
                  >
                    {job.responsibilities.map((item) => (
                      <Typography
                        key={item}
                        component="li"
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.5 }}
                      >
                        {item}
                      </Typography>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </motion.div>
        ))}
      </Box>
    </Box>
  );
}

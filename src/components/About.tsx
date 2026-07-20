import { Box, Typography, Grid, Avatar, Container } from "@mui/material";
import { Email } from "@mui/icons-material";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { profile } from "../constants/profile";
import { useMagneticButton } from "../hooks/useMagneticButton";

const fadeInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6 }
  }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.6, delay: 0.2 }
  }
};

const MagneticCTAButton = () => {
  const buttonRef = useMagneticButton({ distance: 15 });
  
  return (
    <Box
      ref={buttonRef as any}
      component="a"
      href="#projects"
      sx={{
        display: "inline-block",
        px: 5,
        py: 1.8,
        backgroundColor: "white",
        color: "primary.main",
        textDecoration: "none",
        borderRadius: 3,
        fontWeight: 700,
        fontSize: "1.1rem",
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.15)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "100%",
          height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
          transition: "left 0.5s",
        },
        "&:hover": {
          transform: "translateY(-4px) scale(1.05)",
          boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.25)",
          "&::before": {
            left: "100%",
          },
        },
        "&:active": {
          transform: "translateY(-2px) scale(1.02)",
        },
      }}
    >
      View My Work
    </Box>
  );
};

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <Box
      id="hero"
      ref={ref}
      sx={{
        py: { xs: 8, md: 12 },
        px: { xs: 2, sm: 4, md: 8 },
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #0a1929 0%, #1565c0 50%, #0a1929 100%)"
            : "linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #1976d2 100%)",
        backgroundSize: "200% 200%",
        animation: "gradientShift 15s ease infinite",
        "@keyframes gradientShift": {
          "0%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
          "100%": {
            backgroundPosition: "0% 50%",
          },
        },
        color: "white",
        minHeight: { xs: "auto", md: "600px" },
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center" justifyContent="center">
          {/* Left Column - Text Content */}
          <Grid size={{ xs: 12, md: 7 }}>
            <motion.div
              variants={fadeInLeft}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              style={{ textAlign: "left" }}
            >
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: "2.5rem", md: "3.5rem" },
              }}
            >
              {profile.title}
            </Typography>
            
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontWeight: 500,
                mb: 3,
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: { xs: "1.25rem", md: "1.5rem" },
              }}
            >
              {profile.jobTitle}
            </Typography>
            
            <Typography
              variant="body1"
              sx={{
                mb: 4,
                fontSize: { xs: "1rem", md: "1.125rem" },
                lineHeight: 1.8,
                color: "rgba(255, 255, 255, 0.9)",
                maxWidth: "600px",
              }}
            >
              {profile.description}
            </Typography>

            {/* Contact Info */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-start" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Email sx={{ fontSize: 24 }} />
                <Typography 
                  variant="body1" 
                  component="a"
                  href={`mailto:${profile.email}`}
                  sx={{ 
                    fontSize: { xs: "0.9rem", md: "1rem" },
                    color: "white",
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  {profile.email}
                </Typography>
              </Box>
            </Box>

            {/* CTA Button */}
            <Box sx={{ mt: 4 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <MagneticCTAButton />
              </motion.div>
            </Box>
            </motion.div>
          </Grid>

          {/* Right Column - Photo */}
          <Grid size={{ xs: 12, md: 5 }}>
            <motion.div
              variants={fadeInRight}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              style={{ display: "flex", justifyContent: "center" }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: { xs: "250px", sm: "300px", md: "400px" },
                  height: { xs: "250px", sm: "300px", md: "400px" },
                  margin: "0 auto",
                  animation: "float 6s ease-in-out infinite",
                  "@keyframes float": {
                    "0%, 100%": {
                      transform: "translateY(0px)",
                    },
                    "50%": {
                      transform: "translateY(-20px)",
                    },
                  },
                }}
              >
                <Avatar
                  src={profile.photo}
                  alt={`${profile.name} ${profile.surname}`}
                  sx={{
                    width: "100%",
                    height: "100%",
                    border: "4px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                    animation: "pulse 3s ease-in-out infinite",
                    "@keyframes pulse": {
                      "0%, 100%": {
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(255, 255, 255, 0.4)",
                      },
                      "50%": {
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 20px rgba(255, 255, 255, 0)",
                      },
                    },
                  }}
                />
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

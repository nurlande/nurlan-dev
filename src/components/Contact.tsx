import { Box, Typography, IconButton, Stack, Link } from "@mui/material";
import { 
  LinkedIn, 
  GitHub, 
  Telegram,
  WhatsApp,
} from "@mui/icons-material";
import { motion, useInView, type Variants } from "framer-motion";
import { useRef } from "react";
import { contacts } from "../constants/contacts";
import { trackSocialClick } from "../utils/analytics";

const iconVariants: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 200,
      damping: 15
    }
  }
};

export default function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const socialLinks = [
    { name: "GitHub", url: contacts.githubLink, icon: GitHub, ariaLabel: "GitHub" },
    { name: "LinkedIn", url: contacts.linkedinLink, icon: LinkedIn, ariaLabel: "LinkedIn" },
    { name: "Telegram", url: contacts.telegramLink, icon: Telegram, ariaLabel: "Telegram" },
    { name: "WhatsApp", url: contacts.whatsappLink, icon: WhatsApp, ariaLabel: "WhatsApp" },
  ].filter((link) => link.url && link.url.trim() !== "");

  return (
    <Box
      id="contact"
      ref={ref}
      sx={{
        py: 10,
        px: { xs: 2, sm: 4, md: 8 },
        backgroundColor: (theme) => theme.palette.background.default,
        textAlign: "center",
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
          Contact Me
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
          Connect with me on social media
        </Typography>
      </motion.div>

      <Stack
        direction="row"
        spacing={3}
        justifyContent="center"
        alignItems="center"
        flexWrap="wrap"
        sx={{ gap: 3 }}
      >
        {socialLinks.map((social, index) => {
          const IconComponent = social.icon;
          return (
            <motion.div
              key={social.name}
              variants={iconVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              transition={{ delay: index * 0.1 }}
            >
              <IconButton
                component={Link}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.ariaLabel}
                onClick={() => trackSocialClick(social.name)}
                sx={{
                  fontSize: 48,
                  color: "primary.main",
                  width: 64,
                  height: 64,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  background: (theme) =>
                    theme.palette.mode === "light"
                      ? "rgba(25, 118, 210, 0.08)"
                      : "rgba(66, 165, 245, 0.15)",
                  border: (theme) =>
                    theme.palette.mode === "light"
                      ? "2px solid rgba(25, 118, 210, 0.2)"
                      : "2px solid rgba(66, 165, 245, 0.3)",
                  "&:hover": {
                    transform: "scale(1.15) rotate(5deg)",
                    color: "primary.dark",
                    background: (theme) =>
                      theme.palette.mode === "light"
                        ? "rgba(25, 118, 210, 0.15)"
                        : "rgba(66, 165, 245, 0.25)",
                    border: (theme) =>
                      theme.palette.mode === "light"
                        ? "2px solid rgba(25, 118, 210, 0.4)"
                        : "2px solid rgba(66, 165, 245, 0.5)",
                    boxShadow: (theme) =>
                      theme.palette.mode === "light"
                        ? "0px 8px 24px rgba(25, 118, 210, 0.3)"
                        : "0px 8px 24px rgba(66, 165, 245, 0.4)",
                  },
                }}
              >
                <IconComponent sx={{ fontSize: 48 }} />
              </IconButton>
            </motion.div>
          );
        })}
      </Stack>
    </Box>
  );
}

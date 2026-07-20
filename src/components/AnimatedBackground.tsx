import { Box } from "@mui/material";
import { motion } from "framer-motion";

interface AnimatedBackgroundProps {
  mode: "light" | "dark";
}

export default function AnimatedBackground({ mode }: AnimatedBackgroundProps) {
  const circles = Array.from({ length: 5 }, (_, i) => i);

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        zIndex: 0,
        pointerEvents: "none",
        opacity: mode === "light" ? 0.3 : 0.2,
      }}
    >
      {circles.map((i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            borderRadius: "50%",
            background: mode === "light"
              ? `radial-gradient(circle, rgba(25, 118, 210, ${0.1 - i * 0.02}) 0%, transparent 70%)`
              : `radial-gradient(circle, rgba(66, 165, 245, ${0.15 - i * 0.03}) 0%, transparent 70%)`,
            width: `${200 + i * 100}px`,
            height: `${200 + i * 100}px`,
            left: `${20 + i * 15}%`,
            top: `${10 + i * 20}%`,
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}
    </Box>
  );
}

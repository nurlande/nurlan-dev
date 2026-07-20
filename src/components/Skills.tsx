import { Box, Typography, Card, CardContent } from "@mui/material";
import { 
  Code, 
  Storage, 
  Web, 
  DataObject,
  Palette,
  Api,
  Hub
} from "@mui/icons-material";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { skills, categorizedSkills, USE_CATEGORIZED_SKILLS } from "../constants/skills";

// Map skill names to specific icons
const skillIconMap: Record<string, React.ComponentType> = {
  "React": Code,
  "Angular": Code,
  "TypeScript": DataObject,
  "Material UI": Palette,
  "Bootstrap": Web,
  "RxJS": Hub,
  "Node.js": Storage,
  "Zustand / Redux": Api,
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5 }
  }
};

// Reusable Skill Card Component
const SkillCard = ({ skill }: { skill: { name: string } }) => {
  const getIcon = (skillName: string) => {
    const IconComponent = skillIconMap[skillName] || Code;
    return <IconComponent />;
  };

  return (
    <Card
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        borderRadius: 4,
        boxShadow: (theme) =>
          theme.palette.mode === "light"
            ? "0px 4px 20px rgba(0, 0, 0, 0.08)"
            : "0px 4px 20px rgba(0, 0, 0, 0.5)",
        p: 3,
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        background: (theme) =>
          theme.palette.mode === "light"
            ? "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)"
            : "linear-gradient(135deg, #1a1f3a 0%, #0f1419 100%)",
        border: (theme) =>
          theme.palette.mode === "light"
            ? "1px solid rgba(25, 118, 210, 0.1)"
            : "1px solid rgba(66, 165, 245, 0.2)",
        "&:hover": {
          transform: "translateY(-8px) scale(1.03)",
          boxShadow: (theme) =>
            theme.palette.mode === "light"
              ? "0px 12px 40px rgba(25, 118, 210, 0.2)"
              : "0px 12px 40px rgba(66, 165, 245, 0.3)",
          border: (theme) =>
            theme.palette.mode === "light"
              ? "1px solid rgba(25, 118, 210, 0.3)"
              : "1px solid rgba(66, 165, 245, 0.4)",
        },
      }}
    >
      <Box 
        sx={{ 
          fontSize: 40, 
          mb: 2, 
          flexShrink: 0,
          color: "primary.main",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {getIcon(skill.name)}
      </Box>
      <CardContent sx={{ width: "100%", flexGrow: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          {skill.name}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default function Skills() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <Box
      id="skills"
      ref={ref}
      sx={{
        py: 10,
        px: { xs: 2, sm: 4, md: 8 },
        backgroundColor: (theme) => theme.palette.background.paper,
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
          Skills
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
          {USE_CATEGORIZED_SKILLS 
            ? "My technical skills organized by category"
            : "My technical skills"}
        </Typography>
      </motion.div>

      {USE_CATEGORIZED_SKILLS ? (
        // Categorized view
        <Box sx={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {categorizedSkills.map((category, categoryIndex) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: categoryIndex * 0.15, duration: 0.6 }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  mb: 3,
                  color: "text.primary",
                  fontSize: { xs: "1.25rem", md: "1.5rem" },
                }}
              >
                {category.name}
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 3,
                }}
              >
                {category.skills.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    variants={cardVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    transition={{ delay: categoryIndex * 0.15 + index * 0.1 }}
                    style={{ width: "100%" }}
                  >
                    <SkillCard skill={skill} />
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          ))}
        </Box>
      ) : (
        // Flat list view
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
          {skills.map((skill, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              transition={{ delay: index * 0.1 }}
              style={{ width: "100%" }}
            >
              <SkillCard skill={skill} />
            </motion.div>
          ))}
        </Box>
      )}
    </Box>
  );
}

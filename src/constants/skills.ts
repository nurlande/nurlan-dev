export interface Skill {
  name: string;
  level: number;
  iconType: "Code" | "Storage" | "Web" | "Build" | "Cloud" | "Security";
  category?: string;
}

export interface SkillCategory {
  name: string;
  skills: Skill[];
}

// Toggle this to switch between categorized and non-categorized view
// true = categorized, false = flat list
export const USE_CATEGORIZED_SKILLS = false;

export const skills: Skill[] = [
  { name: "React", level: 90, iconType: "Code", category: "Frontend Frameworks" },
  { name: "Angular", level: 85, iconType: "Code", category: "Frontend Frameworks" },
  { name: "TypeScript", level: 85, iconType: "Code", category: "Languages" },
  { name: "Material UI", level: 80, iconType: "Web", category: "UI Libraries" },
  { name: "Bootstrap", level: 80, iconType: "Web", category: "UI Libraries" },
  { name: "RxJS", level: 75, iconType: "Code", category: "Libraries" },
  { name: "Node.js", level: 75, iconType: "Storage", category: "Backend" },
  { name: "Zustand / Redux", level: 70, iconType: "Code", category: "State Management" },
];

// Group skills by category
export const categorizedSkills: SkillCategory[] = [
  {
    name: "Frontend Frameworks",
    skills: skills.filter(s => s.category === "Frontend Frameworks"),
  },
  {
    name: "Languages",
    skills: skills.filter(s => s.category === "Languages"),
  },
  {
    name: "State Management",
    skills: skills.filter(s => s.category === "State Management"),
  },
  {
    name: "UI Libraries",
    skills: skills.filter(s => s.category === "UI Libraries"),
  },
  {
    name: "Libraries",
    skills: skills.filter(s => s.category === "Libraries"),
  },
  {
    name: "Backend",
    skills: skills.filter(s => s.category === "Backend"),
  },
].filter(category => category.skills.length > 0);
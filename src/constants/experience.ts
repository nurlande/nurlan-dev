export interface Experience {
  title: string;
  company: string;
  period: string;
  /** Short bullets of what you owned in the role (not tech stack). */
  responsibilities: string[];
}

/** Newest roles first — append new entries at the top. */
export const experiences: Experience[] = [
  {
    title: "Team Lead, Frontend Developer",
    company: "C-Technology",
    period: "April 2024 – Present",
    responsibilities: [
      "Lead Corporate Internet Banking for corporate and retail customers",
      "Own authentication (PKCE) and frontend architecture",
      "Set delivery standards and review critical UI work",
    ],
  },
  {
    title: "Team Lead, Frontend Developer",
    company: "Cryxxen",
    period: "August 2023 – February 2024",
    responsibilities: [
      "Lead Window Manager — multi-window UI library for Electron apps",
      "Lead Graph Editor — canvas-based UI library (Figma-like workflows)",
      "Ship reusable packages used across desktop products",
    ],
  },
  {
    title: "Individual Entrepreneur, Frontend Developer",
    company: "Freelance",
    period: "February 2023 – Present",
    responsibilities: [
      "Ship delivery company site (amanatroad.kg)",
      "Build AmanatRoad CRM with map-based operations",
      "Deliver DMS Courier app — scanning, push, and field workflows",
    ],
  },
  {
    title: "Frontend Developer",
    company: "Noveo Limited",
    period: "February 2022 – December 2022",
    responsibilities: [
      "Develop agricultural cooperative and gamification products",
      "Run code reviews and break work into actionable tasks",
      "Improve release flow with Docker and GitLab CI/CD",
    ],
  },
  {
    title: "Frontend Developer",
    company: "SmartPost KG",
    period: "April 2021 – April 2022",
    responsibilities: [
      "Build logistics ops UI for orders, couriers, operators, and tariffs",
      "Implement auth and end-to-end CRUD for operations workflows",
      "Add real-time updates and map features",
    ],
  },
  {
    title: "Frontend Developer",
    company: "C-Technology, Demirbank",
    period: "October 2019 – April 2021",
    responsibilities: [
      "Ship demirbank.kg modules — service rating and call-back flows",
      "Build CardPlus admin/client tools for merchant management",
      "Create bank demo site with admin panel; mentor junior developers",
    ],
  },
];

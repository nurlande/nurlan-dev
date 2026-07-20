export type ProjectCategory = "commercial" | "library" | "personal";

export interface Project {
  title: string;
  description?: string;
  technologies?: string[];
  link?: string;
  demoLink?: string;
}

export interface ProjectSection {
  id: ProjectCategory;
  title: string;
  showNdaNotice?: boolean;
  columns?: { sm?: number; md?: number };
  projects: Project[];
}

export const NDA_NOTICE =
  "The most of my commercial projects protected by a Non-Disclosure Agreement (NDA)";

export const projectSections: ProjectSection[] = [
  {
    id: "commercial",
    title: "Commercial Projects",
    showNdaNotice: true,
    projects: [
      {
        title: "Gamification application",
        technologies: [
          "React",
          "Redux",
          "Typescript",
          "RTK",
          "Codecs",
          "SVG",
          "Figma",
          "Material UI",
          "Docker",
          "Gitlab CI/CD",
        ],
      },
      {
        title: "Logistic operations application",
        technologies: [
          "React",
          "Redux",
          "Fast API Python",
          "Websocket",
          "CoreUI",
          "Bootstrap",
          "Yandex Map",
          "JSPdf",
          "React-Select",
        ],
      },
      {
        title: "Agricultural cooperative application",
        technologies: ["React", "Redux", "Typescript", "RTK", "Lerna"],
      },
      {
        title: "Window Manager application",
        technologies: ["Angular", "RxJS", "Typescript"],
      },
      {
        title: "Graphics Editor application",
        technologies: ["Angular", "RxJS", "Typescript"],
      },
    ],
  },
  {
    id: "library",
    title: "Library projects",
    columns: { md: 1 },
    projects: [
      {
        title: "nn-loading-effect",
        description:
          "Npm package of loading animation effect with custom text for react",
        link: "https://github.com/nurlande/nn-loading-effect",
        demoLink: "https://nurlande.github.io/nn-loading-effect/",
      },
    ],
  },
  {
    id: "personal",
    title: "Personal Projects",
    projects: [
      // {
      //   title: "Jial-Jial Landing Page",
      // },
      // {
      //   title: "Chokoichum E-Commerce",
      // },
    ],
  },
];

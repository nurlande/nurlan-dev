# Nurlan Kurmanbekov - Portfolio Website

A modern, responsive portfolio website showcasing my projects, skills, and professional experience. Built with React, TypeScript, and Material UI.

## 🚀 Features

- **Modern Design**: Clean and professional UI with smooth animations
- **Dark/Light Mode**: Theme switching with persistent preference
- **Responsive Layout**: Fully responsive design that works on all devices
- **Smooth Animations**: Scroll-triggered animations using Framer Motion
- **Performance Optimized**: Code splitting and lazy loading for fast load times
- **SEO Optimized**: Meta tags and Open Graph tags for better discoverability
- **Accessible**: ARIA labels and keyboard navigation support

## 🛠️ Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Material UI (MUI)** - Component library
- **Framer Motion** - Animation library
- **React Scroll** - Smooth scrolling navigation

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/nurlande/nurlan-portfolio.git
cd nurlan-portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🏗️ Build

To build for production:

```bash
npm run build
```

The production build will be in the `dist` directory.

Preview the production build:

```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/      # React components
│   ├── About.tsx    # Hero/About section
│   ├── Projects.tsx # Projects showcase
│   ├── Skills.tsx   # Skills section
│   ├── Contact.tsx  # Contact/social links
│   ├── Navbar.tsx   # Navigation bar
│   └── Footer.tsx   # Footer component
├── constants/       # Data constants
│   ├── profile.ts   # Personal information
│   ├── projects.ts  # Project data
│   ├── skills.ts    # Skills data
│   └── contacts.ts  # Contact links
├── theme.ts         # Material UI theme configuration
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## 🎨 Customization

### Update Personal Information

Edit `src/constants/profile.ts`:
```typescript
export const profile = {
  name: "Your Name",
  surname: "Your Surname",
  title: "Hi, I'm Your Name 👋",
  jobTitle: "Your Job Title",
  description: "Your description...",
  location: "Your Location",
  email: "your.email@example.com",
  photo: "/your-photo.jpg", // Add photo to public folder
};
```

### Update Projects

Edit `src/constants/projects.ts`:
```typescript
export const projects: Project[] = [
  {
    title: "Project Name",
    description: "Project description",
    image: "/project-image.jpg",
    link: "https://project-url.com",
  },
  // Add more projects...
];
```

### Update Skills

Edit `src/constants/skills.ts`:
```typescript
export const skills: Skill[] = [
  {
    name: "Skill Name",
    level: 90,
    iconType: "Code", // Code, Storage, Web, Build, Cloud, Security
  },
  // Add more skills...
];
```

### Update Contact Links

Edit `src/constants/contacts.ts`:
```typescript
export const contacts = {
  githubLink: "https://github.com/yourusername",
  linkedinLink: "https://linkedin.com/in/yourusername",
  twitterLink: "https://x.com/yourusername",
  telegramLink: "https://t.me/yourusername",
  whatsappLink: "https://wa.me/yournumber",
};
```

### Theme Customization

Edit `src/theme.ts` to customize colors, typography, and other theme settings.

## 📊 Analytics

The portfolio includes built-in analytics support for tracking user interactions.

### Google Analytics 4

1. Create a `.env` file in the root directory
2. Add your Google Analytics Measurement ID:
```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```
3. Get your Measurement ID from [Google Analytics](https://analytics.google.com)

### Plausible Analytics (Privacy-friendly)

1. Add the Plausible script to `index.html` before the closing `</head>` tag:
```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

### Tracked Events

The portfolio automatically tracks:
- Page views
- Project clicks
- Social media link clicks
- Theme toggles (dark/light mode)

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Vercel will automatically detect Vite and deploy

### Netlify

1. Push your code to GitHub
2. Import your repository on [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `dist`

### GitHub Pages

1. Install `gh-pages`: `npm install --save-dev gh-pages`
2. Add to `package.json`:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```
3. Run: `npm run deploy`

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Nurlan Kurmanbekov**

- Portfolio: [nurlandev.com](https://nurlandev.com)
- GitHub: [@nurlande](https://github.com/nurlande)
- LinkedIn: [nurlande](https://linkedin.com/in/nurlande)

## 🙏 Acknowledgments

- Material UI for the component library
- Framer Motion for animations
- React team for the amazing framework

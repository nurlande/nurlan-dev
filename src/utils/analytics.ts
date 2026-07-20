/**
 * Analytics utility functions
 * Supports both Google Analytics and Plausible Analytics
 */

// Google Analytics 4
export const initGA = (measurementId: string) => {
  if (typeof window !== "undefined" && !window.gtag) {
    // Load Google Analytics script
    const script1 = document.createElement("script");
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script1);

    const script2 = document.createElement("script");
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}');
    `;
    document.head.appendChild(script2);
  }
};

// Track page views
export const trackPageView = (path: string) => {
  if (typeof window !== "undefined") {
    // Google Analytics
    if (window.gtag) {
      window.gtag("config", import.meta.env.VITE_GA_MEASUREMENT_ID || "", {
        page_path: path,
      });
    }

    // Plausible (automatically tracks pageviews if script is loaded)
    if (window.plausible) {
      window.plausible("pageview");
    }
  }
};

// Track custom events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== "undefined") {
    // Google Analytics
    if (window.gtag) {
      window.gtag("event", eventName, properties);
    }

    // Plausible
    if (window.plausible) {
      window.plausible(eventName, { props: properties });
    }
  }
};

// Track project clicks
export const trackProjectClick = (projectName: string) => {
  trackEvent("project_click", { project_name: projectName });
};

// Track social link clicks
export const trackSocialClick = (platform: string) => {
  trackEvent("social_click", { platform });
};

// Track theme toggle
export const trackThemeToggle = (theme: string) => {
  trackEvent("theme_toggle", { theme });
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    plausible?: (eventName: string, options?: { props?: Record<string, any> }) => void;
    dataLayer?: any[];
  }
}

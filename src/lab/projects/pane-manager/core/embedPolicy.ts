/**
 * Sites that refuse to be shown inside another page (X-Frame-Options or
 * CSP frame-ancestors). The browser blocks them silently, so we check up front.
 */
const BLOCKED_HOSTS = [
  "atlassian.com",
  "atlassian.net",
  "bing.com",
  "developer.mozilla.org",
  "duckduckgo.com",
  "figma.com",
  "github.com",
  "gitlab.com",
  "google.com",
  "jetbrains.com",
  "linear.app",
  "notion.so",
  "slack.com",
  "spotify.com",
  "youtrack.cloud",
  "youtube.com",
];

/** Paths on blocked hosts that are made for embedding. */
const EMBED_FRIENDLY_PATHS: { host: string; pathPrefix: string }[] = [
  { host: "youtube.com", pathPrefix: "/embed/" },
];

export interface UrlSuggestion {
  label: string;
  url: string;
}

export const EMBEDDABLE_SUGGESTIONS: UrlSuggestion[] = [
  { label: "Excalidraw", url: "https://excalidraw.com/" },
  { label: "TypeScript Playground", url: "https://www.typescriptlang.org/play" },
  { label: "StackBlitz", url: "https://stackblitz.com/" },
  { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Main_Page" },
  {
    label: "Map of Bishkek",
    url: "https://www.openstreetmap.org/export/embed.html?bbox=74.50,42.80,74.70,42.92&layer=mapnik",
  },
  { label: "React docs", url: "https://react.dev/" },
  { label: "Vite docs", url: "https://vite.dev/" },
];

/** Turns user input into an http(s) URL, or `null` if it can't be one. */
export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const hasHttpScheme = /^https?:\/\//i.test(trimmed);
  if (!hasHttpScheme && trimmed.includes("://")) return null;

  try {
    const url = new URL(hasHttpScheme ? trimmed : `https://${trimmed}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.href;
  } catch {
    return null;
  }
}

export function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function isKnownBlocked(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  const host = parsed.hostname.replace(/^www\./, "");
  const friendly = EMBED_FRIENDLY_PATHS.some(
    (rule) => host === rule.host && parsed.pathname.startsWith(rule.pathPrefix)
  );
  if (friendly) return false;

  return BLOCKED_HOSTS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`));
}

/**
 * Free Lectures — legitimate official free content for CA/CS/CMA students.
 * 
 * Only official channels and genuinely-free educator content.
 * No pirated or unauthorized "pro batch free" links.
 */

export interface LectureSource {
  id: string;
  name: string;
  description: string;
  url: string;
  type: "youtube" | "portal" | "app" | "telegram";
  courses: string[]; // e.g. ["CA Foundation", "CA Inter"]
  language: string;
  isPro?: boolean; // true = locked behind Pro
}

export const LECTURE_SOURCES: LectureSource[] = [
  // ── Free: official PW YouTube lectures ──
  {
    id: "pw-ca-youtube",
    name: "PW CA — Official YouTube",
    description: "PhysicsWallah's official free CA lectures — concepts, revisions & exam tips.",
    url: "https://www.youtube.com/results?search_query=pw+ca+official",
    type: "youtube",
    courses: ["CA Foundation", "CA Inter"],
    language: "Hindi / English",
  },
  // ── Pro: apne Telegram channels yahan add karo ──
  // EXAMPLE - apne asli channel link se replace karo:
  {
    id: "tg-inter-material",
    name: "CA Inter Material — Telegram",
    description: "Complete CA Inter lectures & notes on our Telegram channel. Pro members only.",
    url: "https://t.me/+4T4SFxPvHZQ3NWVl",
    type: "telegram",
    courses: ["CA Inter"],
    language: "Hindi / English",
    isPro: true,
  },
  {
    id: "tg-foundation-material",
    name: "CA Foundation Material — Telegram",
    description: "Complete CA Foundation lectures & notes on our Telegram channel. Pro members only.",
    url: "https://t.me/Z_Vertex_01",
    type: "telegram",
    courses: ["CA Foundation"],
    language: "Hindi / English",
    isPro: true,
  },
];

export function getFreeSources(): LectureSource[] {
  return LECTURE_SOURCES.filter((s) => !s.isPro);
}

export function getProSources(): LectureSource[] {
  return LECTURE_SOURCES.filter((s) => s.isPro);
}

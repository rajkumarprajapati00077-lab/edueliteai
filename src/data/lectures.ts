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
  type: "youtube" | "portal" | "app";
  courses: string[]; // e.g. ["CA Foundation", "CA Inter"]
  language: string;
  isPro?: boolean; // true = locked behind Pro
}

export const LECTURE_SOURCES: LectureSource[] = [
  {
    id: "icai-official",
    name: "ICAI Official YouTube",
    description: "ICAI's own channel — lectures, revision sessions, exam guidance from official faculty.",
    url: "https://www.youtube.com/@icaiorg",
    type: "youtube",
    courses: ["CA Foundation", "CA Inter", "CA Final"],
    language: "English / Hindi",
  },
  {
    id: "icai-bos",
    name: "ICAI BOS Knowledge Portal",
    description: "Board of Studies portal — free study material, video lectures, and updates.",
    url: "https://boslive.icai.org",
    type: "portal",
    courses: ["CA Foundation", "CA Inter", "CA Final"],
    language: "English / Hindi",
  },
  {
    id: "icai-mcq-portal",
    name: "ICAI MCQ Practice Portal",
    description: "Official MCQ practice platform for self-assessment within stipulated time.",
    url: "https://boslive.icai.org",
    type: "portal",
    courses: ["CA Foundation", "CA Inter", "CA Final"],
    language: "English",
  },
  // ── Pro-locked: curated free lecture playlists ──
  {
    id: "pw-ca-free",
    name: "PW CA — Free YouTube Lectures",
    description: "PhysicsWallah's official free CA lectures on YouTube — concepts, revisions & exam tips.",
    url: "https://www.youtube.com/results?search_query=pw+ca+free+lectures",
    type: "youtube",
    courses: ["CA Foundation", "CA Inter"],
    language: "Hindi / English",
    isPro: true,
  },
  {
    id: "revision-marathons",
    name: "Revision Marathon Playlists",
    description: "Curated one-shot revision marathons for every subject — perfect for last-month prep.",
    url: "https://www.youtube.com/results?search_query=ca+revision+marathon+one+shot",
    type: "youtube",
    courses: ["CA Foundation", "CA Inter", "CA Final"],
    language: "Hindi / English",
    isPro: true,
  },
  {
    id: "amendment-updates",
    name: "Amendment Update Lectures",
    description: "Latest amendments explained — stay updated for your attempt.",
    url: "https://www.youtube.com/results?search_query=ca+amendment+lectures+2026",
    type: "youtube",
    courses: ["CA Inter", "CA Final"],
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

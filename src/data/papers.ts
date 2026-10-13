/**
 * ICAI RTP / MTP / PYQ Papers data
 * 
 * RTP = Revision Test Papers (per attempt, per subject)
 * MTP = Mock Test Papers (Series I & II, per attempt)
 * PYQ = Previous Year Questions (past exam papers)
 * 
 * Sources: ICAI BOS Knowledge Portal (https://boslive.icai.org)
 *          ICAI CDN (https://resource.cdn.icai.org)
 * 
 * To add more papers: add entries to the papers array with direct PDF URLs.
 * For papers without direct links, use the BOS portal URL.
 */

export type PaperType = "rtp" | "mtp1" | "mtp2" | "pyq";
export type Course = "CA Foundation" | "CA Inter" | "CA Final";

export interface Paper {
  id: string;
  course: Course;
  subject: string;
  paperNo: string;
  type: PaperType;
  attempt: string; // e.g. "Nov 2026", "Sep 2026", "May 2026"
  title: string;
  pdfUrl: string;
  answerKeyUrl?: string;
  marks?: number;
  duration?: string; // e.g. "3 hours"
}

export const PAPER_TYPE_LABELS: Record<PaperType, string> = {
  rtp: "RTP",
  mtp1: "MTP Series I",
  mtp2: "MTP Series II",
  pyq: "PYQ",
};

export const PAPER_TYPE_DESCRIPTIONS: Record<PaperType, string> = {
  rtp: "Revision Test Papers — ICAI's official revision material per attempt",
  mtp1: "Mock Test Papers Series I — timed practice before exams",
  mtp2: "Mock Test Papers Series II — second round of mocks",
  pyq: "Previous Year Questions — actual past exam papers",
};

export const COURSES: Course[] = ["CA Foundation", "CA Inter", "CA Final"];

export const SUBJECTS: Record<Course, { paperNo: string; name: string }[]> = {
  "CA Foundation": [
    { paperNo: "P1", name: "Accounting" },
    { paperNo: "P2", name: "Business Laws" },
    { paperNo: "P3", name: "Quantitative Aptitude" },
    { paperNo: "P4", name: "Business Economics" },
  ],
  "CA Inter": [
    { paperNo: "P1", name: "Advanced Accounting" },
    { paperNo: "P2", name: "Corporate and Other Laws" },
    { paperNo: "P3", name: "Taxation" },
    { paperNo: "P4", name: "Cost and Management Accounting" },
    { paperNo: "P5", name: "Auditing and Ethics" },
    { paperNo: "P6", name: "Financial Management & Strategic Management" },
  ],
  "CA Final": [
    { paperNo: "P1", name: "Financial Reporting" },
    { paperNo: "P2", name: "Advanced Financial Management" },
    { paperNo: "P3", name: "Advanced Auditing, Assurance and Professional Ethics" },
    { paperNo: "P4", name: "Direct Tax Laws & International Taxation" },
    { paperNo: "P5", name: "Indirect Tax Laws" },
    { paperNo: "P6", name: "Integrated Business Solutions" },
  ],
};

export const BOS_PORTAL_URL = "https://boslive.icai.org";
export const BOS_MTP_PORTAL_URL = "https://bosmtp.icai.org";
// Answer keys: MTP keys on MTP portal (within 48 hrs), RTP answers included in RTP PDF,
// PYQ suggested answers on BOS portal
export const BOS_ANSWER_KEY_URL = "https://boslive.icai.org";

/**
 * Papers library — 8-year coverage target (2019–2026).
 * Add entries as you collect official PDFs per attempt.
 * pdfUrl can be a direct ICAI CDN link or the BOS portal.
 */
export const PAPERS: Paper[] = [
  // ══════════════════════════════════════════════════════════════
  // CA FINAL
  // ══════════════════════════════════════════════════════════════
  // ── Nov 2026 ──
  {
    id: "ca-final-nov26-mtp1",
    course: "CA Final",
    subject: "All Subjects",
    paperNo: "P1–P6",
    type: "mtp1",
    attempt: "Nov 2026",
    title: "CA Final MTP Series I — Nov 2026 (All Papers + Answer Keys)",
    pdfUrl: BOS_MTP_PORTAL_URL,
    answerKeyUrl: BOS_MTP_PORTAL_URL,
    marks: 100,
    duration: "3 hours",
  },
  {
    id: "ca-final-nov26-mtp2",
    course: "CA Final",
    subject: "All Subjects",
    paperNo: "P1–P6",
    type: "mtp2",
    attempt: "Nov 2026",
    title: "CA Final MTP Series II — Nov 2026 (All Papers + Answer Keys)",
    pdfUrl: BOS_MTP_PORTAL_URL,
    answerKeyUrl: BOS_MTP_PORTAL_URL,
    marks: 100,
    duration: "3 hours",
  },
  {
    id: "ca-final-nov26-rtp",
    course: "CA Final",
    subject: "All Subjects",
    paperNo: "P1–P6",
    type: "rtp",
    attempt: "Nov 2026",
    title: "CA Final RTP — Nov 2026 (All Subjects)",
    pdfUrl: BOS_PORTAL_URL,
    answerKeyUrl: BOS_ANSWER_KEY_URL,
  },
  // ── May 2026 ──
  {
    id: "ca-final-may26-rtp",
    course: "CA Final",
    subject: "All Subjects",
    paperNo: "P1–P6",
    type: "rtp",
    attempt: "May 2026",
    title: "CA Final RTP — May 2026 (All Subjects)",
    pdfUrl: BOS_PORTAL_URL,
    answerKeyUrl: BOS_ANSWER_KEY_URL,
  },
  {
    id: "ca-final-may26-mtp1",
    course: "CA Final",
    subject: "All Subjects",
    paperNo: "P1–P6",
    type: "mtp1",
    attempt: "May 2026",
    title: "CA Final MTP Series I — May 2026",
    pdfUrl: BOS_MTP_PORTAL_URL,
    answerKeyUrl: BOS_MTP_PORTAL_URL,
    marks: 100,
    duration: "3 hours",
  },
  {
    id: "ca-final-may26-mtp2",
    course: "CA Final",
    subject: "All Subjects",
    paperNo: "P1–P6",
    type: "mtp2",
    attempt: "May 2026",
    title: "CA Final MTP Series II — May 2026",
    pdfUrl: BOS_MTP_PORTAL_URL,
    answerKeyUrl: BOS_MTP_PORTAL_URL,
    marks: 100,
    duration: "3 hours",
  },
  {
    id: "ca-final-may26-pyq",
    course: "CA Final",
    subject: "All Subjects",
    paperNo: "P1–P6",
    type: "pyq",
    attempt: "May 2026",
    title: "CA Final PYQ — May 2026 Exam Papers",
    pdfUrl: BOS_PORTAL_URL,
    answerKeyUrl: BOS_ANSWER_KEY_URL,
    marks: 100,
    duration: "3 hours",
  },
  // ── Nov 2025 ──
  {
    id: "ca-final-nov25-rtp",
    course: "CA Final",
    subject: "All Subjects",
    paperNo: "P1–P6",
    type: "rtp",
    attempt: "Nov 2025",
    title: "CA Final RTP — Nov 2025 (All Subjects)",
    pdfUrl: BOS_PORTAL_URL,
    answerKeyUrl: BOS_ANSWER_KEY_URL,
  },
  {
    id: "ca-final-nov25-pyq",
    course: "CA Final",
    subject: "All Subjects",
    paperNo: "P1–P6",
    type: "pyq",
    attempt: "Nov 2025",
    title: "CA Final PYQ — Nov 2025 Exam Papers",
    pdfUrl: BOS_PORTAL_URL,
    answerKeyUrl: BOS_ANSWER_KEY_URL,
    marks: 100,
    duration: "3 hours",
  },
  // ── May 2025 ──
  {
    id: "ca-final-may25-rtp",
    course: "CA Final",
    subject: "All Subjects",
    paperNo: "P1–P6",
    type: "rtp",
    attempt: "May 2025",
    title: "CA Final RTP — May 2025 (All Subjects)",
    pdfUrl: BOS_PORTAL_URL,
    answerKeyUrl: BOS_ANSWER_KEY_URL,
  },
  {
    id: "ca-final-may25-pyq",
    course: "CA Final",
    subject: "All Subjects",
    paperNo: "P1–P6",
    type: "pyq",
    attempt: "May 2025",
    title: "CA Final PYQ — May 2025 Exam Papers",
    pdfUrl: BOS_PORTAL_URL,
    answerKeyUrl: BOS_ANSWER_KEY_URL,
    marks: 100,
    duration: "3 hours",
  },

  // ══════════════════════════════════════════════════════════════
  // CA INTER
  // ══════════════════════════════════════════════════════════════
  // ── Sep 2026 ──
  {
    id: "ca-inter-sep26-mtp1",
    course: "CA Inter",
    subject: "All Subjects",
    paperNo: "P1–P6",
    type: "mtp1",
    attempt: "Sep 2026",
    title: "CA Inter MTP Series I — Sep 2026 (All Papers + Answer Keys)",
    pdfUrl: BOS_MTP_PORTAL_URL,
    answerKeyUrl: BOS_MTP_PORTAL_URL,
    marks: 100,
    duration: "3 hours",
  },
  {
    id: "ca-inter-sep26-mtp2",
    course: "CA Inter",
    subject: "All Subjects",
    paperNo: "P1–P6",
    type: "mtp2",
    attempt: "Sep 2026",
    title: "CA Inter MTP Series II — Sep 2026 (All Papers + Answer Keys)",
    pdfUrl: BOS_MTP_PORTAL_URL,
    answerKeyUrl: BOS_MTP_PORTAL_URL,
    marks: 100,
    duration: "3 hours",
  },
  {
    id: "ca-inter-sep26-rtp",
    course: "CA Inter",
    subject: "All Subjects",
    paperNo: "P1–P6",
    type: "rtp",
    attempt: "Sep 2026",
    title: "CA Inter RTP — Sep 2026 (All Subjects)",
    pdfUrl: BOS_PORTAL_URL,
    answerKeyUrl: BOS_ANSWER_KEY_URL,
  },
  // ── May 2026 ──
  {
    id: "ca-inter-may26-rtp",
    course: "CA Inter",
    subject: "All Subjects",
    paperNo: "P1–P6",
    type: "rtp",
    attempt: "May 2026",
    title: "CA Inter RTP — May 2026 (All Subjects)",
    pdfUrl: BOS_PORTAL_URL,
    answerKeyUrl: BOS_ANSWER_KEY_URL,
  },
  {
    id: "ca-inter-may26-pyq",
    course: "CA Inter",
    subject: "All Subjects",
    paperNo: "P1–P6",
    type: "pyq",
    attempt: "May 2026",
    title: "CA Inter PYQ — May 2026 Exam Papers",
    pdfUrl: BOS_PORTAL_URL,
    answerKeyUrl: BOS_ANSWER_KEY_URL,
    marks: 100,
    duration: "3 hours",
  },
  // ── Jan 2026 ──
  {
    id: "ca-inter-jan26-rtp",
    course: "CA Inter",
    subject: "All Subjects",
    paperNo: "P1–P6",
    type: "rtp",
    attempt: "Jan 2026",
    title: "CA Inter RTP — Jan 2026 (All Subjects)",
    pdfUrl: BOS_PORTAL_URL,
    answerKeyUrl: BOS_ANSWER_KEY_URL,
  },
  {
    id: "ca-inter-jan26-pyq",
    course: "CA Inter",
    subject: "All Subjects",
    paperNo: "P1–P6",
    type: "pyq",
    attempt: "Jan 2026",
    title: "CA Inter PYQ — Jan 2026 Exam Papers",
    pdfUrl: BOS_PORTAL_URL,
    answerKeyUrl: BOS_ANSWER_KEY_URL,
    marks: 100,
    duration: "3 hours",
  },

  // ══════════════════════════════════════════════════════════════
  // CA FOUNDATION
  // ══════════════════════════════════════════════════════════════
  {
    id: "ca-foundation-sep26-rtp",
    course: "CA Foundation",
    subject: "All Subjects",
    paperNo: "P1–P4",
    type: "rtp",
    attempt: "Sep 2026",
    title: "CA Foundation RTP — Sep 2026 (All Subjects)",
    pdfUrl: BOS_PORTAL_URL,
    answerKeyUrl: BOS_ANSWER_KEY_URL,
  },
  {
    id: "ca-foundation-sep26-pyq",
    course: "CA Foundation",
    subject: "All Subjects",
    paperNo: "P1–P4",
    type: "pyq",
    attempt: "Sep 2026",
    title: "CA Foundation PYQ — Sep 2026 Exam Papers",
    pdfUrl: BOS_PORTAL_URL,
    answerKeyUrl: BOS_ANSWER_KEY_URL,
  },
];

/** All distinct attempts, newest first. */
export const ATTEMPTS: string[] = [
  "Nov 2026", "Sep 2026", "May 2026", "Jan 2026",
  "Nov 2025", "Sep 2025", "May 2025", "Jan 2025",
  "Nov 2024", "May 2024", "Nov 2023", "May 2023",
  "Nov 2022", "May 2022", "Dec 2021", "Jul 2021",
  "Nov 2020", "May 2019", "Nov 2019",
];

/**
 * Filter papers by course, type, subject, and attempt.
 */
export function getPapers(
  course: Course,
  type: PaperType,
  subject?: string,
  attempt?: string
): Paper[] {
  return PAPERS.filter(
    (p) =>
      p.course === course &&
      p.type === type &&
      (!subject || p.subject === subject || p.subject === "All Subjects") &&
      (!attempt || p.attempt === attempt)
  );
}

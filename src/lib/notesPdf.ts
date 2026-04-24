import jsPDF from "jspdf";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export type ChartSpec = {
  type: "bar" | "line" | "pie" | "doughnut";
  title?: string;
  labels: string[];
  datasets: { label?: string; data: number[] }[];
};

export type ParsedBlock =
  | { kind: "title"; text: string }
  | { kind: "para"; text: string }
  | { kind: "bullet"; text: string }
  | { kind: "chart"; spec: ChartSpec };

const PALETTE = [
  "#6366f1", "#22d3ee", "#f59e0b", "#ef4444",
  "#10b981", "#a855f7", "#0ea5e9", "#eab308",
];

// Sanitize raw AI text — strip stray hashtags, asterisks, code fences
const cleanLine = (s: string) =>
  s
    .replace(/^#+\s*/g, "")
    .replace(/\*\*/g, "")
    .replace(/[`]/g, "")
    .replace(/^\s*[-•]\s+/, "• ")
    .trim();

export function parseNotes(raw: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const lines = raw.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("CHART::")) {
      try {
        const spec = JSON.parse(line.slice(7)) as ChartSpec;
        if (spec && Array.isArray(spec.labels) && Array.isArray(spec.datasets)) {
          blocks.push({ kind: "chart", spec });
          continue;
        }
      } catch {
        // fall through and treat as paragraph
      }
    }

    const cleaned = cleanLine(line);
    if (!cleaned) continue;

    // ALL-CAPS short lines => titles
    const isTitle =
      cleaned.length <= 60 &&
      /^[A-Z0-9][A-Z0-9 ,&\/().:'-]+$/.test(cleaned) &&
      cleaned === cleaned.toUpperCase() &&
      !cleaned.startsWith("•");

    if (isTitle) {
      blocks.push({ kind: "title", text: cleaned });
    } else if (cleaned.startsWith("•")) {
      blocks.push({ kind: "bullet", text: cleaned.slice(1).trim() });
    } else {
      blocks.push({ kind: "para", text: cleaned });
    }
  }
  return blocks;
}

async function renderChartPng(spec: ChartSpec, w = 900, h = 480): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  // Off-screen render
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  const datasets = spec.datasets.map((d, i) => {
    if (spec.type === "pie" || spec.type === "doughnut") {
      return {
        label: d.label ?? "",
        data: d.data,
        backgroundColor: spec.labels.map((_, j) => PALETTE[j % PALETTE.length]),
        borderColor: "#ffffff",
        borderWidth: 2,
      };
    }
    const c = PALETTE[i % PALETTE.length];
    return {
      label: d.label ?? "",
      data: d.data,
      backgroundColor: spec.type === "line" ? c + "33" : c,
      borderColor: c,
      borderWidth: 2,
      tension: 0.35,
      fill: spec.type === "line",
    };
  });

  const chart = new Chart(ctx, {
    type: spec.type,
    data: { labels: spec.labels, datasets },
    options: {
      responsive: false,
      animation: false,
      devicePixelRatio: 2,
      plugins: {
        title: spec.title
          ? { display: true, text: spec.title, color: "#0f172a", font: { size: 18, weight: "bold" } }
          : { display: false },
        legend: { labels: { color: "#0f172a", font: { size: 12 } } },
      },
      scales:
        spec.type === "pie" || spec.type === "doughnut"
          ? undefined
          : {
              x: { ticks: { color: "#334155" }, grid: { color: "#e2e8f0" } },
              y: { ticks: { color: "#334155" }, grid: { color: "#e2e8f0" } },
            },
    },
  });

  // Chart.js renders synchronously when animation:false
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  const url = canvas.toDataURL("image/png");
  chart.destroy();
  return url;
}

export async function buildNotesPdf(opts: {
  course: string;
  level: string;
  subject: string;
  chapter: string;
  raw: string;
}): Promise<Blob> {
  const { course, level, subject, chapter, raw } = opts;
  const blocks = parseNotes(raw);

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 56;
  const contentW = pageW - margin * 2;
  let y = margin;

  const FONT = "times"; // built-in serif: professional, ligatures, no hashtag glyph
  const SANS = "helvetica";

  const ensureSpace = (need: number) => {
    if (y + need > pageH - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  // Cover header band
  pdf.setFillColor(15, 23, 42);
  pdf.rect(0, 0, pageW, 110, "F");
  pdf.setFillColor(99, 102, 241);
  pdf.rect(0, 110, pageW, 4, "F");

  pdf.setFont(SANS, "bold");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(11);
  pdf.text("EDUELITE • EXAM-READY NOTES", margin, 42);

  pdf.setFont(FONT, "bold");
  pdf.setFontSize(22);
  const titleLines = pdf.splitTextToSize(chapter, contentW);
  pdf.text(titleLines, margin, 72);

  pdf.setFont(SANS, "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(203, 213, 225);
  pdf.text(
    `${course} ${level}  •  ${subject}  •  Generated ${new Date().toLocaleDateString()}`,
    margin,
    98,
  );

  pdf.setTextColor(20, 24, 39);
  y = 150;

  for (const b of blocks) {
    if (b.kind === "title") {
      ensureSpace(40);
      pdf.setFont(SANS, "bold");
      pdf.setFontSize(13);
      pdf.setTextColor(99, 102, 241);
      pdf.text(b.text, margin, y);
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.5);
      pdf.line(margin, y + 4, pageW - margin, y + 4);
      y += 22;
      pdf.setTextColor(20, 24, 39);
    } else if (b.kind === "para") {
      pdf.setFont(FONT, "normal");
      pdf.setFontSize(11);
      const wrapped = pdf.splitTextToSize(b.text, contentW);
      for (const ln of wrapped) {
        ensureSpace(16);
        pdf.text(ln, margin, y);
        y += 15;
      }
      y += 4;
    } else if (b.kind === "bullet") {
      pdf.setFont(FONT, "normal");
      pdf.setFontSize(11);
      const wrapped = pdf.splitTextToSize(b.text, contentW - 16);
      ensureSpace(16);
      pdf.setFillColor(99, 102, 241);
      pdf.circle(margin + 3, y - 3, 1.6, "F");
      pdf.text(wrapped[0], margin + 14, y);
      y += 15;
      for (let i = 1; i < wrapped.length; i++) {
        ensureSpace(16);
        pdf.text(wrapped[i], margin + 14, y);
        y += 15;
      }
      y += 2;
    } else if (b.kind === "chart") {
      try {
        const png = await renderChartPng(b.spec);
        const imgW = contentW;
        const imgH = (imgW * 480) / 900;
        ensureSpace(imgH + 24);
        pdf.addImage(png, "PNG", margin, y, imgW, imgH, undefined, "FAST");
        y += imgH + 18;
      } catch (e) {
        console.warn("chart render failed", e);
      }
    }
  }

  // Footer with page numbers
  const total = pdf.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    pdf.setPage(i);
    pdf.setFont(SANS, "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`EduElite • ${course} ${level} • ${subject}`, margin, pageH - 22);
    pdf.text(`Page ${i} of ${total}`, pageW - margin, pageH - 22, { align: "right" });
  }

  return pdf.output("blob");
}
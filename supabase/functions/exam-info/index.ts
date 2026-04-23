// Pulls live exam date + news for ICAI / ICSI / ICMAI using Firecrawl, then has
// Lovable AI distill it into a clean JSON payload the dashboard can render.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SOURCES: Record<string, { label: string; urls: string[] }> = {
  CA: {
    label: "ICAI",
    urls: [
      "https://www.icai.org/post/announcements",
      "https://www.icai.org/category/students-announcements",
    ],
  },
  CS: {
    label: "ICSI",
    urls: [
      "https://www.icsi.edu/student/announcements/",
      "https://www.icsi.edu/home/",
    ],
  },
  CMA: {
    label: "ICMAI",
    urls: [
      "https://icmai.in/icmai/news/index.php",
      "https://icmai.in/studentswebsite/",
    ],
  },
};

// Simple in-memory cache (per-isolate) — resets on cold start, ~6h TTL
const cache = new Map<string, { at: number; data: unknown }>();
const TTL = 6 * 60 * 60 * 1000;

const trackForExam = (exam: string): "CA" | "CS" | "CMA" => {
  const u = exam.toUpperCase();
  if (u.startsWith("CS")) return "CS";
  if (u.startsWith("CMA")) return "CMA";
  return "CA";
};

async function firecrawlScrape(url: string, apiKey: string): Promise<string> {
  const r = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      formats: ["markdown"],
      onlyMainContent: true,
      waitFor: 1500,
    }),
  });
  if (!r.ok) {
    console.error("Firecrawl error", r.status, await r.text().catch(() => ""));
    return "";
  }
  const j = await r.json();
  return (j?.data?.markdown ?? j?.markdown ?? "") as string;
}

async function distill(exam: string, raw: string, apiKey: string) {
  const tools = [
    {
      type: "function",
      function: {
        name: "emit_exam_info",
        description:
          "Return the next exam attempt window for the given course and the latest news headlines.",
        parameters: {
          type: "object",
          additionalProperties: false,
          properties: {
            next_attempt_label: {
              type: "string",
              description:
                "Short label for the next attempt the student should target, e.g. 'May 2026' or 'June 2026'.",
            },
            next_attempt_iso: {
              type: "string",
              description:
                "ISO date (YYYY-MM-DD) of the FIRST exam day of that attempt window. If unknown, return an empty string.",
            },
            confidence: { type: "string", enum: ["high", "medium", "low"] },
            news: {
              type: "array",
              maxItems: 5,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  title: { type: "string" },
                  date: { type: "string" },
                  summary: { type: "string" },
                  url: { type: "string" },
                },
                required: ["title", "summary"],
              },
            },
          },
          required: ["next_attempt_label", "next_attempt_iso", "confidence", "news"],
        },
      },
    },
  ];

  const sys = `You are an Indian professional-exam analyst. From the scraped institute pages below, identify (a) the NEXT upcoming exam attempt window for "${exam}" (e.g. "May 2026", "Dec 2026", "June 2026") with its first exam date if you can find it, and (b) up to 5 recent student-facing news / announcement headlines (admit cards, results, schedule, syllabus). Be conservative — if a date is not clearly stated, set confidence to "low" and leave next_attempt_iso empty. Today is ${new Date().toISOString().slice(0, 10)}.`;

  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: raw.slice(0, 18000) },
      ],
      tools,
      tool_choice: { type: "function", function: { name: "emit_exam_info" } },
    }),
  });
  if (!r.ok) throw new Error(`AI distill failed ${r.status}`);
  const j = await r.json();
  const args = j?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  return args ? JSON.parse(args) : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const exam = url.searchParams.get("exam") ?? "CA Final";
    const track = trackForExam(exam);

    const cacheKey = `${track}::${exam}`;
    const hit = cache.get(cacheKey);
    if (hit && Date.now() - hit.at < TTL) {
      return new Response(JSON.stringify({ ...(hit.data as object), cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const FIRECRAWL = Deno.env.get("FIRECRAWL_API_KEY");
    const LOVABLE = Deno.env.get("LOVABLE_API_KEY");
    if (!FIRECRAWL) throw new Error("FIRECRAWL_API_KEY not configured");
    if (!LOVABLE) throw new Error("LOVABLE_API_KEY not configured");

    const src = SOURCES[track];
    const pages = await Promise.all(src.urls.map((u) => firecrawlScrape(u, FIRECRAWL)));
    const raw = pages.filter(Boolean).join("\n\n---\n\n");

    let result: any = {
      source: src.label,
      exam,
      next_attempt_label: "",
      next_attempt_iso: "",
      confidence: "low",
      news: [],
    };

    if (raw.trim()) {
      try {
        const distilled = await distill(exam, raw, LOVABLE);
        if (distilled) result = { source: src.label, exam, ...distilled };
      } catch (e) {
        console.error("distill failed", e);
      }
    }

    cache.set(cacheKey, { at: Date.now(), data: result });
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("exam-info error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
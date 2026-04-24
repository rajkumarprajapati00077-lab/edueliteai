import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { course, level, subject, chapter, topics } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    if (!course || !level || !subject || !chapter) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const topicLine = Array.isArray(topics) && topics.length ? `Sub-topics: ${topics.join("; ")}.` : "";
    const prompt = `Write a concise, exam-ready chapter summary for an Indian professional exam (${course} — ${level}).
Subject: ${subject}
Chapter: ${chapter}
${topicLine}

Format strictly as:
1) Overview (3-4 lines, plain English).
2) Key Concepts (5-8 short bullets, no asterisks).
3) Important Provisions / Formulas (numbered list, with section/standard references where applicable).
4) Common Pitfalls (3-4 bullets).
5) Exam Tip (one line, decisive).

Rules: do NOT use markdown hashtags or asterisks. Keep professional tone. Indian context. Under 380 words.`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a senior CA/CS/CMA faculty with 15+ years of teaching experience. Write crisp, exam-grade summaries." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      console.error("AI gateway error:", r.status, text);
      if (r.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Try again in a minute." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (r.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI request failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await r.json();
    const summary: string = data?.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chapter-summary error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
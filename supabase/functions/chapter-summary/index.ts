import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function requireUser(req: Request): Promise<Response | null> {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const token = authHeader.slice("Bearer ".length);
  const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
  const { data, error } = await supa.auth.getUser(token);
  if (error || !data?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const unauth = await requireUser(req);
    if (unauth) return unauth;

    const { course, level, subject, chapter, topics } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const isStr = (v: unknown, max: number) => typeof v === "string" && v.length > 0 && v.length <= max;
    if (!isStr(course, 50) || !isStr(level, 50) || !isStr(subject, 200) || !isStr(chapter, 300)) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (topics !== undefined && (!Array.isArray(topics) || topics.length > 50 || topics.some((t) => typeof t !== "string" || t.length > 200))) {
      return new Response(JSON.stringify({ error: "Invalid topics" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
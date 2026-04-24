import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Mode = "mcq" | "case-study" | "mcq30";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { course, level, subject, chapter, mode, count } = await req.json() as {
      course: string; level: string; subject: string; chapter?: string;
      mode: Mode; count?: number;
    };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    if (!course || !level || !subject || !mode) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const n = Math.max(1, Math.min(30, count ?? (mode === "mcq30" ? 30 : mode === "case-study" ? 5 : 10)));
    const chapterLine = chapter ? `Chapter: ${chapter}.` : "Cover the full subject syllabus.";

    const systemMsg = "You are an examiner for Indian professional courses (CA, CS, CMA). Generate accurate, syllabus-aligned questions.";

    let userPrompt = "";
    let toolName = "";
    let toolSchema: any;

    if (mode === "case-study") {
      toolName = "return_case_studies";
      userPrompt = `Generate ${n} case-study question sets for ${course} ${level} — ${subject}. ${chapterLine}
Each set: a realistic 120-180 word business scenario, then 5 MCQs (each with 4 options A-D, the correct answer index 0-3, and a one-line explanation referencing the relevant law/standard).`;
      toolSchema = {
        type: "object",
        properties: {
          cases: {
            type: "array",
            items: {
              type: "object",
              properties: {
                scenario: { type: "string" },
                questions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      q: { type: "string" },
                      options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
                      answer: { type: "integer", minimum: 0, maximum: 3 },
                      explanation: { type: "string" },
                    },
                    required: ["q", "options", "answer", "explanation"],
                  },
                  minItems: 5, maxItems: 5,
                },
              },
              required: ["scenario", "questions"],
            },
          },
        },
        required: ["cases"],
      };
    } else {
      toolName = "return_mcqs";
      const marksTag = mode === "mcq30" ? " The set must total 30 marks (each MCQ = 1 mark)." : "";
      userPrompt = `Generate ${n} high-quality MCQs for ${course} ${level} — ${subject}. ${chapterLine}${marksTag}
Each MCQ: clear stem, 4 options A-D, correct answer index 0-3, and a one-line explanation citing the relevant section / standard / formula.
Avoid trick questions and trivia. Mix conceptual and application-based questions.`;
      toolSchema = {
        type: "object",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                q: { type: "string" },
                options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
                answer: { type: "integer", minimum: 0, maximum: 3 },
                explanation: { type: "string" },
              },
              required: ["q", "options", "answer", "explanation"],
            },
          },
        },
        required: ["questions"],
      };
    }

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemMsg },
          { role: "user", content: userPrompt },
        ],
        tools: [{ type: "function", function: { name: toolName, description: "Return structured quiz", parameters: toolSchema } }],
        tool_choice: { type: "function", function: { name: toolName } },
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      console.error("AI gateway error:", r.status, text);
      if (r.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (r.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI request failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await r.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    let parsed: any = {};
    try {
      parsed = call ? JSON.parse(call.function.arguments) : {};
    } catch (err) {
      console.error("parse error:", err, call?.function?.arguments);
    }
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("quiz-generator error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM = `You are a ruthless, pragmatic study coach for Indian CA/CS/CMA students facing an exam in 36 hours.
Build a brutally realistic 1.5-day (36 hour) timeline starting from the supplied currentTime. Prioritise the weakChapters first, schedule short breaks (10–15 min) every 90–120 min of study, include 2 proper sleep blocks (~6h + a power nap), meals, and one final "fast revision + formula sheet" block in the last 3 hours.
Each task must be specific (e.g. "Revise IND-AS 115 — 5-step model + 3 illustrations"), not vague. Use 24h IST-style time slots.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { subject, currentTime, weakChapters } = await req.json();
    if (!subject || !currentTime) {
      return new Response(JSON.stringify({ error: "subject and currentTime are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userMsg = `Subject: ${subject}\nStart: ${currentTime}\nWeak chapters: ${Array.isArray(weakChapters) ? weakChapters.join(", ") : (weakChapters ?? "none specified")}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userMsg },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_plan",
            description: "Return a 36-hour study survival timeline.",
            parameters: {
              type: "object",
              properties: {
                timeline: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      timeSlot: { type: "string", description: "e.g. '08:00 PM - 10:00 PM'" },
                      task: { type: "string" },
                      type: { type: "string", enum: ["study", "break", "sleep", "meal", "revision"] },
                    },
                    required: ["timeSlot", "task", "type"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["timeline"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_plan" } },
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await resp.text();
      console.error("planner gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : null;
    if (!parsed?.timeline) {
      return new Response(JSON.stringify({ error: "AI did not return structured output" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("planner error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
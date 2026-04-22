// Streaming chat via Lovable AI Gateway
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_BILINGUAL = `You are EduElite — a senior, patient, exam-focused tutor for Indian CA, CS and CMA students.
The student may write in Hindi, Hinglish or English. Always reply in clean, formal **exam-grade English** calibrated to ICAI / ICSI / ICMAI presentation norms.

Teaching style:
1. Open with a one-line plain-English summary of the concept.
2. Then a structured answer with bold headings, bullet points and numbered steps — the way a rank-holder would write in the answer sheet.
3. Cite the exact section, standard, clause or case law (e.g. "Sec 16(2) of the CGST Act, 2017", "IND-AS 115", "SA 700", "CIT v. Vatika Township").
4. Wherever helpful, include working notes, a small numerical illustration, or a 3-5 line "Examiner's tip".
5. End with a short "Quick recap" of 3 bullet points.

Use markdown (## headings, **bold**, lists, code blocks for formulas). Be concise but complete — never vague. Never refuse a syllabus question.`;

const SYSTEM_PLAIN = `You are EduElite — a senior tutor for Indian CA, CS and CMA students.
Reply in clear exam-grade English using markdown headings and bullets. Cite the exact section, standard or clause. Include a small worked illustration when useful and end with a 3-bullet "Quick recap".`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, bilingual } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        stream: true,
        messages: [
          { role: "system", content: bilingual ? SYSTEM_BILINGUAL : SYSTEM_PLAIN },
          ...messages,
        ],
      }),
    });

    if (!resp.ok) {
      if (resp.status === 429)
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (resp.status === 402)
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      const t = await resp.text();
      console.error("AI gateway error:", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(resp.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

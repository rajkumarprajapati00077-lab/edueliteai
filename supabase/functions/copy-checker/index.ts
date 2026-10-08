import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders as cors } from "npm:@supabase/supabase-js@2/cors";

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

type F = { name: string; type: string; data: string };
const part = (f: F) =>
  f.type === "application/pdf"
    ? { type: "input_file", filename: f.name || "file.pdf", file_data: `data:application/pdf;base64,${f.data}` }
    : { type: "input_image", image_url: `data:${f.type};base64,${f.data}`, detail: "high" };
const okFile = (f: any) =>
  f && typeof f.data === "string" && f.data.length < 14_000_000 &&
  typeof f.type === "string" && (f.type === "application/pdf" || /^image\/(png|jpeg|webp)$/.test(f.type));

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["readable", "total_obtained", "total_max", "percentage", "result", "summary", "questions", "presentation", "advice"],
  properties: {
    readable: { type: "boolean" },
    total_obtained: { type: "number" },
    total_max: { type: "number" },
    percentage: { type: "number" },
    result: { type: "string", enum: ["Pass", "Fail", "Unreadable"] },
    summary: { type: "string" },
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["number", "topic", "obtained", "max", "verdict", "points", "examiner_note", "ideal_approach"],
        properties: {
          number: { type: "string" },
          topic: { type: "string" },
          obtained: { type: "number" },
          max: { type: "number" },
          verdict: { type: "string", enum: ["correct", "partial", "wrong", "unanswered"] },
          points: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["text", "status", "marks"],
              properties: {
                text: { type: "string" },
                status: { type: "string", enum: ["right", "wrong", "missing"] },
                marks: { type: "number" },
              },
            },
          },
          examiner_note: { type: "string" },
          ideal_approach: { type: "string" },
        },
      },
    },
    presentation: { type: "string" },
    advice: { type: "array", items: { type: "string" } },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: u } = await admin.auth.getUser(auth.slice(7));
    if (!u?.user) return json({ error: "Unauthorized" }, 401);

    const { count } = await admin.from("copy_checks").select("id", { count: "exact", head: true }).eq("user_id", u.user.id);
    if ((count ?? 0) >= 1) return json({ error: "Your free check is used. Upgrade to Pro to continue.", pro: true }, 403);

    const { paper, questionPaper, answerCopy } = await req.json();
    if (typeof paper !== "string" || !paper || paper.length > 200 || !okFile(questionPaper) || !okFile(answerCopy))
      return json({ error: "Upload the question paper, your answer copy and select a paper." }, 400);

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) throw new Error("LOVABLE_API_KEY not configured");

    const instructions = `You are a senior examiner appointed by ICAI / ICSI / ICMAI for "${paper}", with 20 years of evaluation experience, and a caring teacher.
Evaluate the student's answer copy strictly against the uploaded question paper, exactly as an official examiner does using the institute's Suggested Answers / marking scheme:
1. Read the whole question paper first. Note every question number, sub-part (a, b, c, i, ii) and its marks. Respect "attempt any" choices — only count the best qualifying attempts.
2. Locate each answer in the copy and map it to its question number even if written out of order. Unattempted = 0.
3. Step marking: award marks per correct step, working note, formula, journal entry, computation, and final answer. A wrong final figure still earns step marks for correct method. Carry-forward errors are penalised only once.
4. Theory / law: marks for correct provision (Section / Rule / Ind AS / AS / SA / SEBI / GST / Companies Act citation), analysis of facts, and a clear conclusion. Missing conclusion loses marks. CS answers need case law / provisions; CMA answers need cost concepts and formats.
5. Presentation: proper formats (ledger, statements, schedules), working notes, underlined keywords, units.
6. Be strict but fair — never inflate. Do not award marks for content you cannot actually see.
For every question list the individual marking points: what the student got right (status "right" with marks awarded), errors (status "wrong", 0 marks) and expected points absent from the answer (status "missing", 0 marks). Points' marks must add up to "obtained".
total_obtained = sum of obtained; total_max = paper maximum (usually 100). Pass needs 40%.
If either file is unreadable, set readable=false, result "Unreadable", explain in summary, and return empty questions. Never guess.
Write plain sentences, no markdown.`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key, Authorization: `Bearer ${key}`, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "high" },
        instructions,
        text: { format: { type: "json_schema", name: "checked_copy", strict: true, schema } },
        input: [{
          role: "user",
          content: [
            { type: "input_text", text: `PAPER: ${paper}\nQUESTION PAPER:` }, part(questionPaper),
            { type: "input_text", text: "STUDENT ANSWER COPY:" }, part(answerCopy),
            { type: "input_text", text: "Evaluate this copy now as the official examiner." },
          ],
        }],
      }),
    });
    if (!r.ok || !r.body) {
      const t = await r.text();
      console.error("gateway", r.status, t);
      const msg = r.status === 429 ? "Too many requests, try again shortly." : r.status === 402 ? "AI credits exhausted." : "Evaluation failed. Please try again.";
      return json({ error: msg }, r.status >= 400 ? r.status : 500);
    }

    let text = "", buf = "";
    const reader = r.body.getReader(); const dec = new TextDecoder();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n"); buf = lines.pop() ?? "";
      for (const l of lines) {
        if (!l.startsWith("data:")) continue;
        try {
          const e = JSON.parse(l.slice(5).trim());
          if (e.type === "response.output_text.delta") text += e.delta;
        } catch { /* ignore */ }
      }
    }
    let parsed: any;
    try { parsed = JSON.parse(text); } catch { return json({ error: "The AI could not evaluate this copy. Try clearer scans." }, 502); }
    if (!parsed.readable) return json({ error: parsed.summary || "Files were not readable. Upload clearer scans." }, 422);

    parsed.paper = paper;
    parsed.checked_at = new Date().toISOString();
    const result = JSON.stringify(parsed);
    await admin.from("copy_checks").insert({ user_id: u.user.id, paper, result });
    return json({ result });
  } catch (e) {
    console.error(e);
    return json({ error: "Something went wrong." }, 500);
  }
});

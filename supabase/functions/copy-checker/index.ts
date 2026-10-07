import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });

type F = { name: string; type: string; data: string };
const part = (f: F) =>
  f.type === "application/pdf"
    ? { type: "input_file", filename: f.name || "file.pdf", file_data: `data:application/pdf;base64,${f.data}` }
    : { type: "input_image", image_url: `data:${f.type};base64,${f.data}` };
const okFile = (f: any) =>
  f && typeof f.data === "string" && f.data.length < 14_000_000 &&
  typeof f.type === "string" && (f.type === "application/pdf" || /^image\/(png|jpeg|webp)$/.test(f.type));

serve(async (req) => {
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

    const instructions = `You are a senior ICAI/ICSI/ICMAI examiner and a caring teacher. Evaluate a student's handwritten answer copy strictly against the uploaded question paper for "${paper}", following ICAI evaluation standards: step marking, working notes, correct presentation/format, relevant section/standard citations (Ind AS/AS/SA/Act sections), conclusions, and keyword usage. Match each answer to its question number; mark unanswered questions as 0.
Write plain text (no markdown symbols like # or *). Structure:
OVERALL: marks obtained / total, percentage, result (Pass needs 40%).
QUESTION-WISE: for each question — "Q<no>: x / y", what was correct, missing points, mistakes, and the ideal approach in 2-4 lines.
PRESENTATION: handwriting, structure, working notes feedback.
TEACHER'S ADVICE: 4-6 specific improvement steps.
If a file is unreadable, say so honestly instead of guessing.`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key, Authorization: `Bearer ${key}`, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "medium" },
        instructions,
        input: [{
          role: "user",
          content: [
            { type: "input_text", text: "QUESTION PAPER:" }, part(questionPaper),
            { type: "input_text", text: "STUDENT ANSWER COPY:" }, part(answerCopy),
            { type: "input_text", text: "Evaluate now." },
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
    if (!text.trim()) return json({ error: "The AI could not evaluate this copy. Try clearer scans." }, 502);

    await admin.from("copy_checks").insert({ user_id: u.user.id, paper, result: text });
    return json({ result: text });
  } catch (e) {
    console.error(e);
    return json({ error: "Something went wrong." }, 500);
  }
});

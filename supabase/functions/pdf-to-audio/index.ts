import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Curated multilingual ElevenLabs voices.
// All four work with eleven_multilingual_v2; the *_multi voices handle
// Hindi / Hinglish (Devanagari + Latin script) more naturally.
const VOICE_MAP: Record<string, string> = {
  female_en: "EXAVITQu4vr4xnSDxMaL", // Sarah - warm English teacher
  male_en: "JBFqnCBsd6RMkjVDRZzb",   // George - warm English narrator
  female_multi: "XrExE9yKIg1WjnnlVkGX", // Matilda - multilingual, handles Hindi
  male_multi: "onwK4e9ZLuTAKqWW03F9",   // Daniel - multilingual narrator
};

function pickVoice(voice: string | undefined, language: string | undefined) {
  const lang = (language || "en").toLowerCase();
  // Hindi OR bilingual (Hinglish) → multilingual-tuned voice
  const needsMulti = lang === "hi" || lang.startsWith("bi") || lang === "hinglish";
  if (voice === "male") return needsMulti ? VOICE_MAP.male_multi : VOICE_MAP.male_en;
  return needsMulti ? VOICE_MAP.female_multi : VOICE_MAP.female_en;
}

type Section = {
  heading: string;
  bullets: string[];
  narration: string;
  start_seconds?: number;
};
type AiResult = {
  title: string;
  summary: string;
  key_points: string[];
  sections: Section[];
};

async function aiSummarize(pdfBase64: string, language: string): Promise<AiResult> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

  const langInstruction =
    language === "hi"
      ? "Write summary, bullets and narration in natural Hindi (Devanagari script). Keep technical CA/CS/CMA terms in English where standard."
      : language === "bilingual" || language === "hinglish"
      ? "Write in natural Hinglish (mix of Hindi in Devanagari script + English technical terms) the way an Indian CA teacher actually speaks in class. About 60% Hindi, 40% English keywords."
      : "Write in clear, simple Indian English.";

  const sys = `You are a top CA/CS/CMA teacher creating a STRUCTURED audiobook for an Indian student.
You MUST call the build_audiobook tool. Rules:
- ${langInstruction}
- Break the chapter into 5-8 logical SECTIONS, each with a short heading, 3-6 bullet notes, and a narration paragraph.
- Each section's narration should be 150-300 words, warm, conversational, with rhetorical questions, small recaps, real-world CA examples, and natural pauses (use commas and periods).
- TOTAL narration across all sections: 1500-2500 words.
- Avoid robotic or textbook reading. Sound like a live class.
- Do NOT include markdown, asterisks, or symbols in narration — only spoken text.`;

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: sys },
        {
          role: "user",
          content: [
            { type: "text", text: "Turn this study PDF into a structured teaching audiobook with sections." },
            { type: "file", file: { filename: "doc.pdf", file_data: `data:application/pdf;base64,${pdfBase64}` } },
          ],
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "build_audiobook",
            description: "Return a structured audiobook with sections, each having a heading, bullets and narration.",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                summary: { type: "string", description: "3-5 paragraph overall chapter summary" },
                key_points: { type: "array", items: { type: "string" }, description: "8-15 most important concepts" },
                sections: {
                  type: "array",
                  description: "5-8 sections covering the chapter",
                  items: {
                    type: "object",
                    properties: {
                      heading: { type: "string" },
                      bullets: { type: "array", items: { type: "string" } },
                      narration: { type: "string", description: "150-300 word spoken text for TTS" },
                    },
                    required: ["heading", "bullets", "narration"],
                  },
                },
              },
              required: ["title", "summary", "key_points", "sections"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "build_audiobook" } },
    }),
  });

  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`AI summarize failed ${resp.status}: ${t}`);
  }
  const data = await resp.json();
  const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) throw new Error("AI returned no structured output");
  const parsed = JSON.parse(args) as AiResult;
  if (!parsed.sections || parsed.sections.length === 0) {
    throw new Error("AI returned no sections");
  }
  return parsed;
}

async function ttsOne(text: string, voiceId: string, prev?: string, next?: string): Promise<Uint8Array> {
  const key = Deno.env.get("ELEVENLABS_API_KEY");
  if (!key) throw new Error("ELEVENLABS_API_KEY missing");

  // ElevenLabs has a per-request character cap (~5000 for multilingual_v2).
  // Trim defensively so a long narration never 422s.
  const MAX_CHARS = 4500;
  const safeText = text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) : text;
  const safePrev = prev ? prev.slice(-800) : undefined;
  const safeNext = next ? next.slice(0, 800) : undefined;

  const body = {
    text: safeText,
    model_id: "eleven_multilingual_v2",
    previous_text: safePrev,
    next_text: safeNext,
    // NOTE: do NOT send `speed` — not accepted on multilingual_v2 and causes 422.
    voice_settings: {
      stability: 0.45,
      similarity_boost: 0.8,
      style: 0.4,
      use_speaker_boost: true,
    },
  };

  let lastErr = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "xi-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    if (r.ok) return new Uint8Array(await r.arrayBuffer());
    lastErr = await r.text();
    // Retry only on transient errors
    if (r.status !== 429 && r.status < 500) {
      throw new Error(`ElevenLabs TTS ${r.status}: ${lastErr.slice(0, 300)}`);
    }
    await new Promise((res) => setTimeout(res, 800 * (attempt + 1)));
  }
  throw new Error(`ElevenLabs TTS failed after retries: ${lastErr.slice(0, 300)}`);
}

/** Generate TTS for each section in parallel (limited concurrency)
 *  and return concatenated MP3 plus per-section start offsets (estimated). */
async function ttsSections(
  sections: Section[],
  voiceId: string,
): Promise<{ mp3: Uint8Array; sectionsWithTime: Section[]; totalSeconds: number }> {
  const CONCURRENCY = 3;
  const buffers: Uint8Array[] = new Array(sections.length);
  let i = 0;
  async function worker() {
    while (true) {
      const idx = i++;
      if (idx >= sections.length) return;
      const prev = sections[idx - 1]?.narration;
      const next = sections[idx + 1]?.narration;
      buffers[idx] = await ttsOne(sections[idx].narration, voiceId, prev, next);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, sections.length) }, worker));

  // Estimate duration of each MP3 chunk from its byte length.
  // mp3_44100_128 ≈ 16,000 bytes/sec.
  const BYTES_PER_SEC = 16000;
  const sectionsWithTime: Section[] = [];
  let runningSec = 0;
  let totalLen = 0;
  for (let idx = 0; idx < sections.length; idx++) {
    const seconds = buffers[idx].length / BYTES_PER_SEC;
    sectionsWithTime.push({ ...sections[idx], start_seconds: Math.floor(runningSec) });
    runningSec += seconds;
    totalLen += buffers[idx].length;
  }
  const mp3 = new Uint8Array(totalLen);
  let off = 0;
  for (const b of buffers) {
    mp3.set(b, off);
    off += b.length;
  }
  return { mp3, sectionsWithTime, totalSeconds: Math.floor(runningSec) };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(supabaseUrl, anon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = userRes.user;
    const admin = createClient(supabaseUrl, service);

    const body = await req.json();
    const {
      pdf_base64,
      title,
      course = "CA",
      level = "Foundation",
      subject = "General",
      chapter = "Chapter 1",
      voice = "female",
      language = "en",
    } = body || {};

    if (typeof pdf_base64 !== "string" || pdf_base64.length < 100) {
      return new Response(JSON.stringify({ error: "pdf_base64 required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (pdf_base64.length > 20_000_000) {
      return new Response(JSON.stringify({ error: "PDF too large (max ~15MB)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create row in pending state
    const { data: row, error: insErr } = await admin
      .from("audiobooks")
      .insert({
        user_id: user.id,
        course, level, subject, chapter,
        title: title || "Untitled chapter",
        voice, language,
        status: "processing",
      })
      .select()
      .single();
    if (insErr) throw insErr;

    try {
      const ai = await aiSummarize(pdf_base64, language);
      const voiceId = pickVoice(voice, language);
      const { mp3, sectionsWithTime, totalSeconds } = await ttsSections(ai.sections, voiceId);

      const path = `${user.id}/${row.id}.mp3`;
      const { error: upErr } = await admin.storage.from("audiobooks").upload(path, mp3, {
        contentType: "audio/mpeg",
        upsert: true,
      });
      if (upErr) throw upErr;

      await admin
        .from("audiobooks")
        .update({
          title: title || ai.title,
          summary: ai.summary,
          key_points: ai.key_points,
          sections: sectionsWithTime,
          duration_seconds: totalSeconds,
          audio_path: path,
          status: "ready",
        })
        .eq("id", row.id);

      return new Response(JSON.stringify({ id: row.id, status: "ready" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      await admin.from("audiobooks").update({ status: "failed", error: msg }).eq("id", row.id);
      return new Response(JSON.stringify({ id: row.id, status: "failed", error: msg }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const VOICE_MAP: Record<string, string> = {
  female: "EXAVITQu4vr4xnSDxMaL", // Sarah - warm female teacher
  male: "JBFqnCBsd6RMkjVDRZzb",   // George - warm male teacher
  female_in: "XrExE9yKIg1WjnnlVkGX", // Matilda - friendly
  male_in: "onwK4e9ZLuTAKqWW03F9",   // Daniel - clear narrator
};

function pickVoice(voice: string | undefined, language: string | undefined) {
  const isHindi = (language || "").toLowerCase().startsWith("hi");
  if (voice === "male") return isHindi ? VOICE_MAP.male_in : VOICE_MAP.male;
  return isHindi ? VOICE_MAP.female_in : VOICE_MAP.female;
}

async function aiSummarize(pdfBase64: string, language: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

  const sys = `You are a top CA/CS/CMA teacher creating an audiobook script for an Indian student.
Produce JSON via the provided tool. The narration_script must:
- Sound like a real teacher explaining live in class (warm, expressive, natural)
- Use simple words and frequent pauses (use commas and full stops naturally)
- Avoid sounding robotic or like reading; use rhetorical questions and small recaps
- ${language === "hi" ? "Mix Hindi + English (Hinglish), default Hindi" : language === "bilingual" ? "Naturally mix Hindi and English (Hinglish) suitable for Indian CA/CS/CMA students" : "Use clear Indian-English"}
- Length: 600-1200 words narration_script.`;

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: sys },
        {
          role: "user",
          content: [
            { type: "text", text: "Summarize this study PDF chapter-wise into a teaching audiobook." },
            { type: "file", file: { filename: "doc.pdf", file_data: `data:application/pdf;base64,${pdfBase64}` } },
          ],
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "build_audiobook",
            description: "Return summary, key points, and a teacher-style narration script.",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                summary: { type: "string", description: "3-5 paragraph chapter-wise summary" },
                key_points: { type: "array", items: { type: "string" }, description: "8-15 important concepts/points" },
                narration_script: { type: "string", description: "Spoken script for TTS, teacher tone" },
              },
              required: ["title", "summary", "key_points", "narration_script"],
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
  return JSON.parse(args) as {
    title: string;
    summary: string;
    key_points: string[];
    narration_script: string;
  };
}

async function tts(text: string, voiceId: string): Promise<Uint8Array> {
  const key = Deno.env.get("ELEVENLABS_API_KEY");
  if (!key) throw new Error("ELEVENLABS_API_KEY missing");

  // Chunk to keep each request fast & under limits
  const chunks: string[] = [];
  const sentences = text.replace(/\s+/g, " ").split(/(?<=[.!?])\s+/);
  let cur = "";
  for (const s of sentences) {
    if ((cur + " " + s).length > 1800) {
      if (cur) chunks.push(cur.trim());
      cur = s;
    } else {
      cur = cur ? cur + " " + s : s;
    }
  }
  if (cur.trim()) chunks.push(cur.trim());

  const buffers: Uint8Array[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const prev = chunks[i - 1];
    const next = chunks[i + 1];
    const r = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "xi-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify({
          text: chunks[i],
          model_id: "eleven_multilingual_v2",
          previous_text: prev,
          next_text: next,
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.8,
            style: 0.55,
            use_speaker_boost: true,
            speed: 1.0,
          },
        }),
      }
    );
    if (!r.ok) {
      const t = await r.text();
      throw new Error(`ElevenLabs TTS failed ${r.status}: ${t}`);
    }
    buffers.push(new Uint8Array(await r.arrayBuffer()));
  }

  const total = buffers.reduce((n, b) => n + b.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const b of buffers) {
    out.set(b, offset);
    offset += b.length;
  }
  return out;
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
      const summary = await aiSummarize(pdf_base64, language);
      const voiceId = pickVoice(voice, language);
      const mp3 = await tts(summary.narration_script, voiceId);

      const path = `${user.id}/${row.id}.mp3`;
      const { error: upErr } = await admin.storage.from("audiobooks").upload(path, mp3, {
        contentType: "audio/mpeg",
        upsert: true,
      });
      if (upErr) throw upErr;

      await admin
        .from("audiobooks")
        .update({
          title: title || summary.title,
          summary: summary.summary,
          key_points: summary.key_points,
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
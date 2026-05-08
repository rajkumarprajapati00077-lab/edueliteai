import { useEffect, useMemo, useRef, useState } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileNav } from "@/components/MobileNav";
import { PageTransition } from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Headphones, Upload, Loader2, Play, Pause, Bookmark, Download, Trash2,
  Volume2, FileAudio, Sparkles, ListTree, Languages, FileText, FileDown,
} from "lucide-react";

type Section = {
  heading: string;
  bullets: string[];
  narration?: string;
  start_seconds?: number;
};

type Audiobook = {
  id: string;
  course: string; level: string; subject: string; chapter: string;
  title: string;
  summary: string | null;
  key_points: string[] | null;
  sections: Section[] | null;
  audio_path: string | null;
  voice: string | null;
  language: string | null;
  status: "pending" | "processing" | "ready" | "failed";
  error: string | null;
  duration_seconds: number;
  created_at: string;
};

const COURSES = ["CA", "CS", "CMA"];
const LEVELS = ["Foundation", "Inter", "Final", "Executive", "Professional"];

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  // Chunked base64 to avoid call-stack limits
  const bytes = new Uint8Array(buf);
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + CHUNK)) as unknown as number[]);
  }
  return btoa(binary);
}

const Player = ({ book }: { book: Audiobook }) => {
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [pos, setPos] = useState(0);
  const [dur, setDur] = useState(0);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [showNotes, setShowNotes] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [bilingual, setBilingual] = useState<
    { heading_en: string; heading_hi: string; bullets: { en: string; hi: string }[] }[] | null
  >(null);
  const [showExport, setShowExport] = useState(false);

  const sections = (book.sections ?? []).filter((s) => s && s.heading);
  const activeIdx = sections.findIndex((s, i) => {
    const start = s.start_seconds ?? 0;
    const next = sections[i + 1]?.start_seconds ?? Infinity;
    return pos >= start && pos < next;
  });

  useEffect(() => {
    if (!book.audio_path) return;
    let active = true;
    (async () => {
      const { data, error } = await supabase.storage
        .from("audiobooks")
        .createSignedUrl(book.audio_path!, 60 * 60);
      if (!active) return;
      if (error) {
        toast.error("Could not load audio");
        return;
      }
      setUrl(data.signedUrl);
    })();
    return () => { active = false; };
  }, [book.audio_path]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("audiobook_progress")
        .select("position_seconds, bookmarks")
        .eq("user_id", user.id)
        .eq("audiobook_id", book.id)
        .maybeSingle();
      if (data) {
        if (audioRef.current) audioRef.current.currentTime = data.position_seconds || 0;
        setBookmarks(Array.isArray(data.bookmarks) ? (data.bookmarks as number[]) : []);
      }
    })();
  }, [book.id, user]);

  const persist = async (position: number, bm: number[]) => {
    if (!user) return;
    await supabase.from("audiobook_progress").upsert(
      { user_id: user.id, audiobook_id: book.id, position_seconds: Math.floor(position), bookmarks: bm },
      { onConflict: "user_id,audiobook_id" }
    );
  };

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
  };

  const addBookmark = async () => {
    const next = [...bookmarks, Math.floor(pos)].sort((a, b) => a - b);
    setBookmarks(next);
    await persist(pos, next);
    toast.success("Bookmarked");
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60); const ss = Math.floor(s % 60);
    return `${m}:${ss.toString().padStart(2, "0")}`;
  };

  const jumpTo = (sec: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = sec;
    if (!playing) audioRef.current.play();
  };

  const ensureBilingual = async () => {
    if (bilingual) return bilingual;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Please sign in"); return null; }
    setExporting(true);
    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bilingual-notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            title: book.title,
            sections: sections.map((s) => ({ heading: s.heading, bullets: s.bullets ?? [] })),
          }),
        },
      );
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to translate");
      const out = Array.isArray(data?.sections) ? data.sections : [];
      if (!out.length) throw new Error("Empty translation");
      setBilingual(out);
      return out;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
      return null;
    } finally {
      setExporting(false);
    }
  };

  const downloadTxt = async () => {
    const data = await ensureBilingual();
    if (!data) return;
    const lines: string[] = [];
    lines.push(book.title);
    lines.push("=".repeat(book.title.length));
    lines.push("");
    data.forEach((s, i) => {
      lines.push(`${i + 1}. ${s.heading_en}  /  ${s.heading_hi}`);
      lines.push("-".repeat(40));
      s.bullets.forEach((b) => {
        lines.push(`• EN: ${b.en}`);
        lines.push(`  HI: ${b.hi}`);
        lines.push("");
      });
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${book.title} — bilingual notes.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
    setShowExport(false);
    toast.success("Downloaded notes");
  };

  const downloadPdf = async () => {
    const data = await ensureBilingual();
    if (!data) return;
    const esc = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const html = `<!doctype html><html><head><meta charset="utf-8"/>
<title>${esc(book.title)} — Bilingual Notes</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&family=Noto+Sans+Devanagari:wght@400;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 18mm; }
  body { font-family: 'Noto Sans', system-ui, sans-serif; color: #111; line-height: 1.45; }
  h1 { font-size: 22px; margin: 0 0 6px; }
  .meta { color: #666; font-size: 12px; margin-bottom: 18px; }
  h2 { font-size: 15px; margin: 18px 0 6px; padding-bottom: 4px; border-bottom: 1px solid #ddd; }
  .hi { font-family: 'Noto Sans Devanagari', 'Noto Sans', serif; }
  ul { padding-left: 18px; margin: 4px 0 10px; }
  li { margin: 4px 0; font-size: 12.5px; }
  .label { color: #2563eb; font-weight: 700; margin-right: 4px; }
  .label-hi { color: #b91c1c; }
  @media print { .noprint { display: none; } }
  .noprint { position: fixed; top: 12px; right: 12px; }
  button { padding: 8px 14px; border-radius: 8px; border: 0; background: #111; color: #fff; cursor: pointer; }
</style></head><body>
<div class="noprint"><button onclick="window.print()">Print / Save as PDF</button></div>
<h1>${esc(book.title)}</h1>
<div class="meta">${esc(book.course)} · ${esc(book.level)} · ${esc(book.subject)} · ${esc(book.chapter)} — Bilingual study notes (English + हिन्दी)</div>
${data
  .map(
    (s, i) => `
<h2>${i + 1}. ${esc(s.heading_en)} <span class="hi">/ ${esc(s.heading_hi)}</span></h2>
<ul>
${s.bullets
  .map(
    (b) => `<li>
  <span class="label">EN:</span>${esc(b.en)}<br/>
  <span class="label label-hi">HI:</span><span class="hi">${esc(b.hi)}</span>
</li>`,
  )
  .join("")}
</ul>`,
  )
  .join("")}
<script>setTimeout(()=>window.print(),600);</script>
</body></html>`;
    const w = window.open("", "_blank");
    if (!w) { toast.error("Popup blocked — allow popups to export PDF"); return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
    setShowExport(false);
  };

  if (!book.audio_path) return null;

  return (
    <div className="rounded-2xl glass p-4 mt-3 space-y-3">
      {url && (
        <audio
          ref={audioRef}
          src={url}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
          onTimeUpdate={(e) => {
            const t = e.currentTarget.currentTime;
            setPos(t);
            if (Math.floor(t) % 5 === 0) persist(t, bookmarks);
          }}
        />
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="h-11 w-11 rounded-full bg-gradient-primary text-primary-foreground grid place-items-center glow-primary"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </button>
        <div className="flex-1">
          <input
            type="range"
            min={0} max={dur || 0} value={pos}
            onChange={(e) => { if (audioRef.current) audioRef.current.currentTime = Number(e.target.value); }}
            className="w-full"
          />
          <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
            <span>{fmt(pos)}</span><span>{fmt(dur)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-muted-foreground" />
          <select
            value={speed}
            onChange={(e) => {
              const v = Number(e.target.value); setSpeed(v);
              if (audioRef.current) audioRef.current.playbackRate = v;
            }}
            className="bg-secondary/60 rounded-md text-xs px-2 py-1"
          >
            {[0.75, 1, 1.25, 1.5, 1.75, 2].map((s) => <option key={s} value={s}>{s}x</option>)}
          </select>
          <button onClick={addBookmark} className="h-9 w-9 rounded-lg hover:bg-secondary/60 grid place-items-center" title="Bookmark">
            <Bookmark className="h-4 w-4" />
          </button>
          {sections.length > 0 && (
            <button
              onClick={() => setShowNotes((v) => !v)}
              className={`h-9 w-9 rounded-lg grid place-items-center ${showNotes ? "bg-primary/20 text-primary" : "hover:bg-secondary/60"}`}
              title="Sections & notes"
            >
              <ListTree className="h-4 w-4" />
            </button>
          )}
          {url && (
            <a href={url} download={`${book.title}.mp3`} className="h-9 w-9 rounded-lg hover:bg-secondary/60 grid place-items-center" title="Download">
              <Download className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
      {bookmarks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {bookmarks.map((b, i) => (
            <button
              key={i}
              onClick={() => { if (audioRef.current) audioRef.current.currentTime = b; }}
              className="text-[11px] px-2 py-1 rounded-md bg-secondary/60 hover:bg-secondary"
            >
              ⭐ {fmt(b)}
            </button>
          ))}
        </div>
      )}

      {showNotes && sections.length > 0 && (
        <div className="rounded-xl bg-background/40 border border-border/50 p-3 space-y-3 max-h-96 overflow-y-auto">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Chapter sections — tap to jump</div>
          {sections.map((s, i) => (
            <div
              key={i}
              className={`rounded-lg p-3 border transition ${
                i === activeIdx ? "border-primary/60 bg-primary/5" : "border-border/40 bg-secondary/20"
              }`}
            >
              <button
                onClick={() => jumpTo(s.start_seconds ?? 0)}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="text-sm font-semibold">{i + 1}. {s.heading}</span>
                <span className="text-[11px] text-muted-foreground tabular-nums">▶ {fmt(s.start_seconds ?? 0)}</span>
              </button>
              {s.bullets && s.bullets.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {s.bullets.map((b, j) => <li key={j}>• {b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AudiobookLibrary = () => {
  const { user, session } = useAuth();
  const [books, setBooks] = useState<Audiobook[]>([]);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState("CA");
  const [level, setLevel] = useState("Final");
  const [subject, setSubject] = useState("Direct Tax");
  const [chapter, setChapter] = useState("Chapter 1");
  const [title, setTitle] = useState("");
  const [voice, setVoice] = useState<"female" | "male">("female");
  const [language, setLanguage] = useState<"en" | "hi" | "bilingual">("bilingual");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("audiobooks")
      .select("*")
      .order("created_at", { ascending: false });
    setBooks(((data ?? []) as unknown) as Audiobook[]);
    setLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user]);

  // Refresh while any book is processing
  useEffect(() => {
    if (!books.some((b) => b.status === "processing" || b.status === "pending")) return;
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [books]);

  const submit = async () => {
    if (!file) return toast.error("Choose a PDF first");
    if (!session) return toast.error("Please sign in");
    if (file.size > 15 * 1024 * 1024) return toast.error("PDF must be under 15MB");
    setUploading(true);
    try {
      const pdf_base64 = await fileToBase64(file);
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pdf-to-audio`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          pdf_base64, title: title || file.name.replace(/\.pdf$/i, ""),
          course, level, subject, chapter, voice, language,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed");
      toast.success("Audiobook generation started");
      setFile(null); setTitle("");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to start");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string, audio_path: string | null) => {
    if (!confirm("Delete this audiobook?")) return;
    if (audio_path) await supabase.storage.from("audiobooks").remove([audio_path]);
    await supabase.from("audiobooks").delete().eq("id", id);
    setBooks((b) => b.filter((x) => x.id !== id));
  };

  // Group by Course → Subject → Chapter
  const grouped = useMemo(() => {
    const map = new Map<string, Map<string, Map<string, Audiobook[]>>>();
    for (const b of books) {
      if (!map.has(b.course)) map.set(b.course, new Map());
      const sub = map.get(b.course)!;
      if (!sub.has(b.subject)) sub.set(b.subject, new Map());
      const ch = sub.get(b.subject)!;
      if (!ch.has(b.chapter)) ch.set(b.chapter, []);
      ch.get(b.chapter)!.push(b);
    }
    return map;
  }, [books]);

  return (
    <PageTransition>
      <div className="min-h-screen flex">
        <DashboardSidebar />
        <MobileNav />
        <main className="flex-1 lg:ml-72 p-6 lg:p-10">
          <div className="max-w-5xl mx-auto space-y-8 pt-12 lg:pt-0">
            <div>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-primary grid place-items-center glow-primary">
                  <Headphones className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-display font-bold">Audiobook Library</h1>
                  <p className="text-muted-foreground text-sm">Upload a PDF — get a teacher-style audio explanation in Hindi or English.</p>
                </div>
              </div>
            </div>

            {/* Upload card */}
            <div className="rounded-2xl glass-strong p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                Upload PDF → AI summary → human-like narration (powered by ElevenLabs)
              </div>
              <div className="grid md:grid-cols-4 gap-3">
                <select value={course} onChange={(e) => setCourse(e.target.value)} className="bg-secondary/60 rounded-xl px-3 py-2 text-sm">
                  {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={level} onChange={(e) => setLevel(e.target.value)} className="bg-secondary/60 rounded-xl px-3 py-2 text-sm">
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="bg-secondary/60 rounded-xl px-3 py-2 text-sm" />
                <input value={chapter} onChange={(e) => setChapter(e.target.value)} placeholder="Chapter" className="bg-secondary/60 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" className="bg-secondary/60 rounded-xl px-3 py-2 text-sm md:col-span-1" />
                <select value={voice} onChange={(e) => setVoice(e.target.value as "female" | "male")} className="bg-secondary/60 rounded-xl px-3 py-2 text-sm">
                  <option value="female">Female teacher voice</option>
                  <option value="male">Male teacher voice</option>
                </select>
                <select value={language} onChange={(e) => setLanguage(e.target.value as "en" | "hi" | "bilingual")} className="bg-secondary/60 rounded-xl px-3 py-2 text-sm">
                  <option value="bilingual">Bilingual (Hinglish)</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/60 cursor-pointer text-sm">
                  <Upload className="h-4 w-4" />
                  <span>{file ? file.name : "Choose PDF (≤15MB)"}</span>
                  <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                </label>
                <button
                  disabled={uploading || !file}
                  onClick={submit}
                  className="btn-3d inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground glow-primary disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileAudio className="h-4 w-4" />}
                  Generate audiobook
                </button>
              </div>
            </div>

            {/* Library */}
            {loading ? (
              <div className="text-muted-foreground text-sm">Loading…</div>
            ) : books.length === 0 ? (
              <div className="rounded-2xl glass p-8 text-center text-muted-foreground text-sm">
                No audiobooks yet. Upload your first PDF above.
              </div>
            ) : (
              <div className="space-y-6">
                {Array.from(grouped.entries()).map(([c, subjects]) => (
                  <section key={c} className="space-y-3">
                    <h2 className="text-lg font-semibold text-gradient">{c}</h2>
                    {Array.from(subjects.entries()).map(([s, chapters]) => (
                      <div key={s} className="rounded-2xl glass p-4 space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground">{s}</h3>
                        {Array.from(chapters.entries()).map(([ch, list]) => (
                          <div key={ch} className="space-y-2">
                            <div className="text-xs uppercase tracking-wider text-muted-foreground/70">{ch}</div>
                            {list.map((b) => (
                              <div key={b.id} className="rounded-xl bg-secondary/30 p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="font-medium truncate">{b.title}</div>
                                    {b.summary && (
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{b.summary}</p>
                                    )}
                                    {b.key_points && b.key_points.length > 0 && (
                                      <ul className="mt-2 grid sm:grid-cols-2 gap-1 text-[11px] text-muted-foreground">
                                        {b.key_points.slice(0, 6).map((k, i) => (
                                          <li key={i} className="truncate">• {k}</li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] uppercase px-2 py-1 rounded-md ${
                                      b.status === "ready" ? "bg-emerald-500/15 text-emerald-400" :
                                      b.status === "failed" ? "bg-red-500/15 text-red-400" :
                                      "bg-amber-500/15 text-amber-400"
                                    }`}>{b.status}</span>
                                    <button onClick={() => remove(b.id, b.audio_path)} className="h-8 w-8 rounded-lg hover:bg-secondary grid place-items-center" title="Delete">
                                      <Trash2 className="h-4 w-4 text-red-400" />
                                    </button>
                                  </div>
                                </div>
                                {b.status === "ready" && <Player book={b} />}
                                {b.status === "failed" && b.error && (
                                  <div className="mt-2 text-xs text-red-400">Error: {b.error}</div>
                                )}
                                {(b.status === "processing" || b.status === "pending") && (
                                  <div className="mt-2 text-xs text-muted-foreground inline-flex items-center gap-2">
                                    <Loader2 className="h-3 w-3 animate-spin" /> Generating narration… (this can take 1–2 minutes)
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </section>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default AudiobookLibrary;
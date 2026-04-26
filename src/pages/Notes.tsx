import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileNav } from "@/components/MobileNav";
import { PageTransition } from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { FileText, Upload, Sparkles, Download, Trash2, Loader2, Lock, User as UserIcon, Users } from "lucide-react";
import { buildNotesPdf } from "@/lib/notesPdf";

type Note = {
  id: string; uploaded_by: string; course: string; level: string;
  subject: string; chapter: string; title: string;
  file_path: string | null; is_ai_generated: boolean; is_private: boolean;
};

const COURSES = ["CA", "CS", "CMA"];
const LEVELS = ["Foundation", "Inter", "Final", "Executive", "Professional"];

type ModelOption = {
  id: string;
  label: string;
  blurb: string;
  accent: string;
};

const MODELS: ModelOption[] = [
  { id: "google/gemini-2.5-pro",       label: "Gemini 2.5 Pro",   blurb: "Deepest reasoning • best for Final-level chapters", accent: "from-indigo-500 to-purple-500" },
  { id: "google/gemini-2.5-flash",     label: "Gemini 2.5 Flash", blurb: "Balanced speed and depth",                          accent: "from-cyan-500 to-blue-500" },
  { id: "openai/gpt-5",                label: "GPT-5",            blurb: "Premium accuracy • nuanced citations",              accent: "from-emerald-500 to-teal-500" },
  { id: "openai/gpt-5-mini",           label: "GPT-5 Mini",       blurb: "Fast drafts of revision notes",                     accent: "from-amber-500 to-orange-500" },
];

const Notes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState("CA");
  const [level, setLevel] = useState("Final");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [ownerScope, setOwnerScope] = useState<"mine" | "all">("mine");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("notes").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setNotes((data ?? []) as Note[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file || !subject || !chapter || !title) return toast.error("Fill all fields and pick a PDF");
    setUploading(true);
    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("notes").upload(path, file, { contentType: "application/pdf" });
    if (upErr) { setUploading(false); return toast.error(upErr.message); }
    const { error } = await supabase.from("notes").insert({
      uploaded_by: user.id, course, level, subject, chapter, title, file_path: path,
    });
    setUploading(false);
    if (error) return toast.error(error.message);
    toast.success("Note uploaded");
    setFile(null); setTitle(""); setChapter(""); setSubject("");
    load();
  };

  const aiGenerate = async (modelId: string) => {
    if (!user || !subject || !chapter) return toast.error("Pick subject and chapter first");
    setGeneratingId(modelId);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("chat", {
        body: {
          purpose: "notes",
          model: modelId,
          messages: [
            {
              role: "user",
              content:
                `Produce premium exam-ready chapter notes.\n` +
                `Course: ${course}\nLevel: ${level}\nSubject: ${subject}\nChapter: ${chapter}\n\n` +
                `Follow the EduElite Notes Engine output rules strictly. ` +
                `Include real statutory references, one solved illustration if numerical, ` +
                `and emit CHART:: lines only where a chart genuinely improves understanding.`,
            },
          ],
        },
      });
      if (fnErr) throw fnErr;
      const body: string = (data as any)?.content ?? "";
      if (!body) throw new Error("Empty response from AI");

      const blob = await buildNotesPdf({ course, level, subject, chapter, raw: body });
      const fname = `${course}-${level}-${chapter.replace(/\s+/g, "-")}.pdf`;
      const path = `${user.id}/ai-${Date.now()}-${fname}`;
      const { error: upErr } = await supabase.storage.from("notes").upload(path, blob, { contentType: "application/pdf" });
      if (upErr) throw upErr;
      const modelLabel = MODELS.find((m) => m.id === modelId)?.label ?? "AI";
      const { error } = await supabase.from("notes").insert({
        uploaded_by: user.id, course, level, subject, chapter,
        title: `${chapter} — ${modelLabel} notes`, file_path: path, is_ai_generated: true, is_private: false,
      });
      if (error) throw error;
      toast.success(`Notes generated with ${modelLabel}`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGeneratingId(null);
    }
  };

  const canAccess = (n: Note) => !n.is_private || n.uploaded_by === user?.id;

  const download = async (n: Note) => {
    if (!n.file_path) return;
    if (!canAccess(n)) {
      toast.error("This note is private to its owner.");
      return;
    }
    const { data, error } = await supabase.storage.from("notes").createSignedUrl(n.file_path, 300);
    if (error || !data?.signedUrl) {
      toast.error("You don't have access to this file.");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const remove = async (n: Note) => {
    if (n.uploaded_by !== user?.id) return;
    if (n.file_path) await supabase.storage.from("notes").remove([n.file_path]);
    await supabase.from("notes").delete().eq("id", n.id);
    setNotes((x) => x.filter((m) => m.id !== n.id));
  };

  const filtered = notes.filter((n) =>
    n.course === course &&
    n.level === level &&
    (ownerScope === "all" || n.uploaded_by === user?.id)
  );

  return (
    <PageTransition>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar />
        <MobileNav />
        <main className="flex-1 px-6 lg:px-10 py-8 max-w-6xl mx-auto w-full">
          <h1 className="font-display text-3xl font-bold tracking-tight">Notes Library</h1>
          <p className="text-sm text-muted-foreground mt-1">Browse chapter PDFs or generate fresh AI notes for any chapter.</p>

          <div className="mt-6 grid lg:grid-cols-3 gap-5">
            <form onSubmit={upload} className="glass-strong rounded-2xl p-5 space-y-3 lg:col-span-1">
              <h2 className="font-semibold flex items-center gap-2"><Upload className="h-4 w-4 text-primary" /> Add note</h2>
              <div className="grid grid-cols-2 gap-2">
                <select value={course} onChange={(e) => setCourse(e.target.value)} className="glass rounded-lg px-3 py-2 text-sm bg-transparent">
                  {COURSES.map((c) => <option key={c} className="bg-background">{c}</option>)}
                </select>
                <select value={level} onChange={(e) => setLevel(e.target.value)} className="glass rounded-lg px-3 py-2 text-sm bg-transparent">
                  {LEVELS.map((c) => <option key={c} className="bg-background">{c}</option>)}
                </select>
              </div>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject (e.g. Audit)" className="w-full glass rounded-lg px-3 py-2 text-sm bg-transparent outline-none" />
              <input value={chapter} onChange={(e) => setChapter(e.target.value)} placeholder="Chapter (e.g. SA 700)" className="w-full glass rounded-lg px-3 py-2 text-sm bg-transparent outline-none" />
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title shown in library" className="w-full glass rounded-lg px-3 py-2 text-sm bg-transparent outline-none" />
              <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="w-full text-xs" />
              <button disabled={uploading} className="btn-3d w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary py-2.5 text-sm font-semibold text-primary-foreground glow-primary disabled:opacity-50">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload PDF
              </button>

              <div className="pt-2">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-accent" /> Generate AI notes with…
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {MODELS.map((m) => {
                    const busy = generatingId === m.id;
                    const otherBusy = generatingId !== null && !busy;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => aiGenerate(m.id)}
                        disabled={busy || otherBusy}
                        className={`group relative overflow-hidden rounded-xl border border-border/50 bg-card/40 px-3 py-2.5 text-left transition-all hover:border-primary/40 hover:bg-card/70 disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${m.accent}`} />
                        <div className="pl-2 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{m.label}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{m.blurb}</p>
                          </div>
                          {busy ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                          ) : (
                            <Sparkles className="h-4 w-4 text-accent shrink-0 opacity-70 group-hover:opacity-100" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>

            <div className="lg:col-span-2 glass-strong rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-primary" />
                <h2 className="font-semibold">{course} · {level}</h2>
                <div className="ml-auto flex items-center gap-1 rounded-full glass p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setOwnerScope("mine")}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full transition ${
                      ownerScope === "mine" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <UserIcon className="h-3 w-3" /> Mine
                  </button>
                  <button
                    type="button"
                    onClick={() => setOwnerScope("all")}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full transition ${
                      ownerScope === "all" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Users className="h-3 w-3" /> All shared
                  </button>
                  <span className="px-2 text-muted-foreground">{filtered.length}</span>
                </div>
              </div>
              {loading ? <p className="text-sm text-muted-foreground">Loading…</p> : filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {ownerScope === "mine"
                    ? "You haven't added any notes for this filter yet. Upload one or generate with AI."
                    : "No shared notes for this filter."}
                </p>
              ) : (
                <ul className="space-y-2">
                  {filtered.map((n) => {
                    const accessible = canAccess(n);
                    const mine = n.uploaded_by === user?.id;
                    return (
                      <li
                        key={n.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border bg-card/40 ${
                          accessible ? "border-border/50" : "border-border/30 opacity-60"
                        }`}
                      >
                        <div className="h-9 w-9 rounded-lg bg-secondary grid place-items-center">
                          {accessible ? <FileText className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate flex items-center gap-1.5">
                            {n.title}
                            {n.is_private && <Lock className="h-3 w-3 text-muted-foreground shrink-0" />}
                          </p>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            {n.subject} · {n.chapter}
                            {n.is_ai_generated ? " · AI" : ""}
                            {!mine && " · shared"}
                            {!accessible && " · inaccessible"}
                          </p>
                        </div>
                        <button
                          onClick={() => download(n)}
                          disabled={!accessible}
                          title={accessible ? "Download" : "Private to its owner"}
                          className="text-muted-foreground hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {mine && (
                          <button onClick={() => remove(n)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};
export default Notes;
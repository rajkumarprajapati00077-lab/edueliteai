import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, Send, Sparkles, User, ArrowLeft, Plus, MessageSquare, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string };
type Conv = { id: string; title: string; created_at: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const CHAT_MODELS = [
  { id: "google/gemini-2.5-pro",   label: "Gemini Pro",   tag: "Deep" },
  { id: "google/gemini-2.5-flash", label: "Gemini Flash", tag: "Fast" },
  { id: "openai/gpt-5",            label: "GPT-5",        tag: "Premium" },
  { id: "openai/gpt-5-mini",       label: "GPT-5 Mini",   tag: "Quick" },
] as const;

const Chat = () => {
  const { user } = useAuth();
  const [convs, setConvs] = useState<Conv[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [bilingual, setBilingual] = useState(true);
  const [model, setModel] = useState<string>(CHAT_MODELS[0].id);
  const [streaming, setStreaming] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streaming]);

  // Load conversations
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase.from("conversations")
        .select("id,title,created_at").order("created_at", { ascending: false });
      if (error) return toast.error(error.message);
      setConvs((data ?? []) as Conv[]);
      if (data && data[0] && !activeId) setActiveId(data[0].id);
    })();
  // eslint-disable-next-line
  }, [user]);

  // Load messages for active conv
  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    (async () => {
      const { data, error } = await supabase.from("messages")
        .select("role,content").eq("conversation_id", activeId).order("created_at");
      if (error) return toast.error(error.message);
      setMessages((data ?? []).filter((m: any) => m.role !== "system") as Msg[]);
    })();
  }, [activeId]);

  const newChat = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("conversations")
      .insert({ user_id: user.id, title: "New chat" }).select().single();
    if (error) return toast.error(error.message);
    setConvs((c) => [data as Conv, ...c]);
    setActiveId(data.id);
    setMessages([]);
  };

  const ensureConv = async (firstUserText: string): Promise<string> => {
    if (activeId) return activeId;
    if (!user) throw new Error("Not signed in");
    const title = firstUserText.slice(0, 60);
    const { data, error } = await supabase.from("conversations")
      .insert({ user_id: user.id, title }).select().single();
    if (error) throw error;
    setConvs((c) => [data as Conv, ...c]);
    setActiveId(data.id);
    return data.id;
  };

  const send = async () => {
    if (!input.trim() || streaming || !user) return;
    const text = input.trim();
    setInput("");
    const userMsg: Msg = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setStreaming(true);

    let convId: string;
    try {
      convId = await ensureConv(text);
      await supabase.from("messages").insert({ conversation_id: convId, user_id: user.id, role: "user", content: text });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
      setStreaming(false);
      return;
    }

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        toast.error("Please sign in again to continue.");
        setStreaming(false);
        return;
      }
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg], bilingual, model }),
      });
      if (resp.status === 429) { toast.error("Rate limit — try again in a moment."); setStreaming(false); return; }
      if (resp.status === 402) { toast.error("AI credits exhausted. Add credits in Workspace → Usage."); setStreaming(false); return; }
      if (!resp.ok || !resp.body) { toast.error("Chat failed"); setStreaming(false); return; }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = ""; let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl); buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch { buf = line + "\n" + buf; break; }
        }
      }

      if (assistantSoFar) {
        await supabase.from("messages").insert({
          conversation_id: convId, user_id: user.id, role: "assistant", content: assistantSoFar,
        });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Stream error");
    } finally {
      setStreaming(false);
    }
  };

  const suggestions = [
    "Explain SA 700 vs SA 705 in simple Hindi, give exam answer in English",
    "GST: Input Tax Credit conditions under Sec 16 — short note",
    "IND-AS 115 ke 5 steps Hindi me batao, English me likh ke do",
  ];

  return (
    <PageTransition>
      <div className="min-h-screen flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 shrink-0 flex-col glass-strong border-r border-border/40 px-3 py-5">
          <Link to="/dashboard" className="flex items-center gap-2 px-2 mb-4 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <button onClick={newChat} className="mb-4 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary py-2 text-sm font-semibold text-primary-foreground glow-primary">
            <Plus className="h-4 w-4" /> New chat
          </button>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 mb-2">Conversations</div>
          <nav className="flex-1 overflow-y-auto flex flex-col gap-1">
            {convs.length === 0 && <p className="px-2 text-xs text-muted-foreground">No conversations yet.</p>}
            {convs.map((c) => (
              <button key={c.id} onClick={() => setActiveId(c.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-left text-sm truncate ${activeId === c.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"}`}>
                <MessageSquare className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{c.title}</span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 glass-strong border-b border-border/40">
            <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center glow-primary">
                  <Languages className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="leading-tight">
                  <p className="font-display font-semibold text-sm">EduElite AI Tutor</p>
                  <p className="text-[10px] text-muted-foreground">Hindi or English in · exam-grade English out</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setBilingual((b) => !b)} className="flex items-center gap-2 glass rounded-full pl-3 pr-1 py-1 text-xs" aria-pressed={bilingual}>
                <span className="text-muted-foreground hidden sm:inline">Hindi → English</span>
                <span className={`relative h-6 w-11 rounded-full transition-colors ${bilingual ? "bg-gradient-primary" : "bg-secondary"}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform ${bilingual ? "translate-x-5" : "translate-x-0.5"}`} />
                </span>
                </button>
              </div>
            </div>
            <div className="max-w-4xl mx-auto px-4 pb-3 flex items-center gap-2 overflow-x-auto">
              <Bot className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">Model</span>
              {CHAT_MODELS.map((m) => {
                const active = model === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setModel(m.id)}
                    disabled={streaming}
                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors ${
                      active
                        ? "bg-gradient-primary text-primary-foreground glow-primary"
                        : "glass text-muted-foreground hover:text-foreground"
                    } disabled:opacity-50`}
                    aria-pressed={active}
                  >
                    <span className="font-medium">{m.label}</span>
                    <span className={`text-[9px] uppercase tracking-wider ${active ? "text-primary-foreground/80" : "text-muted-foreground/70"}`}>{m.tag}</span>
                  </button>
                );
              })}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
              {messages.length === 0 && !streaming && (
                <div className="text-center py-16">
                  <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-primary glow-primary items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold">How can I help you study today?</h2>
                  <p className="text-sm text-muted-foreground mt-1">Write in Hindi, Hinglish or English — I'll reply in exam-grade English.</p>
                </div>
              )}
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                    className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`h-8 w-8 shrink-0 rounded-lg grid place-items-center ${m.role === "user" ? "bg-secondary" : "bg-gradient-primary glow-primary"}`}>
                      {m.role === "user" ? <User className="h-4 w-4 text-foreground" /> : <Sparkles className="h-4 w-4 text-primary-foreground" />}
                    </div>
                    <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-gradient-primary text-primary-foreground rounded-tr-sm whitespace-pre-wrap" : "glass-strong rounded-tl-sm"}`}>
                      {m.role === "assistant" && <p className="text-[10px] uppercase tracking-widest text-accent mb-1">EduElite Tutor · ICAI tone</p>}
                      {m.role === "user" && <p className="text-[10px] uppercase tracking-widest text-primary-foreground/70 mb-1">You</p>}
                      {m.role === "assistant" ? (
                        <div className="prose prose-sm prose-invert max-w-none prose-headings:font-display prose-headings:mt-3 prose-headings:mb-1 prose-p:my-1.5 prose-li:my-0.5 prose-strong:text-foreground">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                        </div>
                      ) : m.content}
                    </div>
                  </motion.div>
                ))}
                {streaming && messages[messages.length - 1]?.role === "user" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center glow-primary"><Sparkles className="h-4 w-4 text-primary-foreground" /></div>
                    <div className="glass-strong rounded-2xl rounded-tl-sm px-4 py-3 text-sm flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" style={{ animationDelay: "0.2s" }} />
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" style={{ animationDelay: "0.4s" }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={endRef} />
            </div>
          </main>

          <div className="sticky bottom-0 glass-strong border-t border-border/40">
            <div className="max-w-3xl mx-auto px-4 py-4">
              {messages.length === 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {suggestions.map((s) => (
                    <button key={s} onClick={() => setInput(s)} className="text-xs glass rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">{s}</button>
                  ))}
                </div>
              )}
              <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-end gap-2 glass-strong rounded-2xl p-2 focus-within:ring-2 focus-within:ring-primary/50">
                <textarea value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  rows={1} placeholder={bilingual ? "Hindi me likhiye — for example: GST ka composition scheme samjhao…" : "Type your question…"}
                  className="flex-1 bg-transparent resize-none outline-none px-3 py-2 text-sm placeholder:text-muted-foreground max-h-32" />
                <button type="submit" disabled={!input.trim() || streaming}
                  className="h-10 w-10 shrink-0 rounded-xl bg-gradient-primary grid place-items-center text-primary-foreground glow-primary disabled:opacity-40 hover:scale-105 active:scale-95 transition-transform">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
export default Chat;

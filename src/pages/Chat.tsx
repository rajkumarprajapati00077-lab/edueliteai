import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, Send, Sparkles, User, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";

type Msg = { role: "user" | "ai"; content: string };

const seed: Msg[] = [
  {
    role: "user",
    content:
      "Sir, mujhe Section 80C samjhao — kaun kaun se investments aate hain aur maximum kitna deduction milta hai?",
  },
  {
    role: "ai",
    content:
      "Section 80C of the Income-tax Act, 1961 permits an aggregate deduction of up to ₹1,50,000 from Gross Total Income for specified investments and payments made by an individual or HUF. Eligible items include: contributions to PPF, EPF and recognised superannuation funds; life insurance premium (subject to the 10% sum-assured cap); ELSS units; principal repayment of housing loan; tuition fees for up to two children; 5-year tax-saver fixed deposits; Sukanya Samriddhi Yojana; and NSC. The deduction is available only under the old tax regime and is subject to the overall ceiling under Section 80CCE.",
  },
];

const Chat = () => {
  const [messages, setMessages] = useState<Msg[]>(seed);
  const [input, setInput] = useState("");
  const [bilingual, setBilingual] = useState(true);
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const send = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setMessages((m) => [
        ...m,
        {
          role: "ai",
          content: bilingual
            ? "As per the relevant ICAI study material and applicable provisions, the answer would be presented as follows: [Demo response] — connect Lovable Cloud + Lovable AI to enable live, exam-grade English answers calibrated to ICAI presentation norms."
            : "[Demo response] Enable Lovable Cloud to power the live AI translator with section-grade citations.",
        },
      ]);
    }, 900);
  };

  const suggestions = [
    "Explain SA 700 vs SA 705 in simple Hindi, give exam answer in English",
    "GST: Input Tax Credit conditions under Sec 16 — short note",
    "IND-AS 115 ke 5 steps Hindi me batao, English me likh ke do",
  ];

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 glass-strong border-b border-border/40">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center glow-primary">
                <Languages className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="leading-tight">
                <p className="font-semibold text-sm">Bilingual Translator</p>
                <p className="text-[10px] text-muted-foreground">Hindi prompt → ICAI-grade English answer</p>
              </div>
            </div>
            {/* Toggle */}
            <button
              onClick={() => setBilingual((b) => !b)}
              className="flex items-center gap-2 glass rounded-full pl-3 pr-1 py-1 text-xs"
              aria-pressed={bilingual}
            >
              <span className="text-muted-foreground hidden sm:inline">Hindi → English</span>
              <span
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  bilingual ? "bg-gradient-primary" : "bg-secondary"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform ${
                    bilingual ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </span>
            </button>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`h-8 w-8 shrink-0 rounded-lg grid place-items-center ${
                      m.role === "user"
                        ? "bg-secondary"
                        : "bg-gradient-primary glow-primary"
                    }`}
                  >
                    {m.role === "user" ? (
                      <User className="h-4 w-4 text-foreground" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-primary-foreground" />
                    )}
                  </div>
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-gradient-primary text-primary-foreground rounded-tr-sm"
                        : "glass-strong rounded-tl-sm"
                    }`}
                  >
                    {m.role === "ai" && (
                      <p className="text-[10px] uppercase tracking-widest text-accent mb-1">AI Response · ICAI tone</p>
                    )}
                    {m.role === "user" && (
                      <p className="text-[10px] uppercase tracking-widest text-primary-foreground/70 mb-1">User Prompt</p>
                    )}
                    {m.content}
                  </div>
                </motion.div>
              ))}
              {thinking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center glow-primary">
                    <Sparkles className="h-4 w-4 text-primary-foreground" />
                  </div>
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

        {/* Composer */}
        <div className="sticky bottom-0 glass-strong border-t border-border/40">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-xs glass rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-end gap-2 glass-strong rounded-2xl p-2 focus-within:ring-2 focus-within:ring-primary/50"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder={bilingual ? "Hindi me likhiye — for example: GST ka composition scheme samjhao…" : "Type your question…"}
                className="flex-1 bg-transparent resize-none outline-none px-3 py-2 text-sm placeholder:text-muted-foreground max-h-32"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="h-10 w-10 shrink-0 rounded-xl bg-gradient-primary grid place-items-center text-primary-foreground glow-primary disabled:opacity-40 disabled:glow-primary-none hover:scale-105 active:scale-95 transition-transform"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              Demo mode — connect Lovable Cloud + Lovable AI to power live, exam-grade responses.
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Chat;
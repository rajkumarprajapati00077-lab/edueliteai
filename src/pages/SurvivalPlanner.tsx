import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Clock, Coffee, BookOpen, Moon, Utensils, Zap, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileNav } from "@/components/MobileNav";
import { Navbar } from "@/components/Navbar";
import { PageTransition } from "@/components/PageTransition";

type Block = { timeSlot: string; task: string; type: "study" | "break" | "sleep" | "meal" | "revision" };

const styleFor = (t: Block["type"]) => {
  switch (t) {
    case "study": return { Icon: BookOpen, ring: "ring-primary/40", dot: "bg-primary", chip: "bg-primary/15 text-primary" };
    case "revision": return { Icon: Zap, ring: "ring-amber-400/40", dot: "bg-amber-400", chip: "bg-amber-400/15 text-amber-300" };
    case "break": return { Icon: Coffee, ring: "ring-emerald-400/40", dot: "bg-emerald-400", chip: "bg-emerald-400/15 text-emerald-300" };
    case "sleep": return { Icon: Moon, ring: "ring-violet-400/40", dot: "bg-violet-400", chip: "bg-violet-400/15 text-violet-300" };
    case "meal": return { Icon: Utensils, ring: "ring-orange-400/40", dot: "bg-orange-400", chip: "bg-orange-400/15 text-orange-300" };
  }
};

const localNow = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export default function SurvivalPlanner() {
  const [subject, setSubject] = useState("");
  const [currentTime, setCurrentTime] = useState(localNow());
  const [weak, setWeak] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState<Block[] | null>(null);

  const generate = async () => {
    if (!subject.trim()) { toast.error("Subject is required"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("planner", {
        body: {
          subject,
          currentTime,
          weakChapters: weak.split(",").map((s) => s.trim()).filter(Boolean),
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setTimeline((data as any).timeline as Block[]);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to build plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex flex-1">
          <DashboardSidebar />
        <MobileNav />
          <main className="flex-1 px-4 md:px-10 py-8 max-w-5xl mx-auto w-full">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-muted-foreground mb-3">
                <Clock className="h-3.5 w-3.5 text-primary" /> 1.5-Day Survival Planner
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-gradient">36 hours. One ruthless plan.</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Tell us the subject, when you're starting, and your weakest chapters. We'll craft a brutally realistic minute-by-minute survival schedule.
              </p>
            </div>

            <Card className="p-6 glass-strong mb-8">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">Subject</Label>
                  <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Direct Tax Laws" disabled={loading} />
                </div>
                <div>
                  <Label className="mb-2 block">Start date & time</Label>
                  <Input type="datetime-local" value={currentTime} onChange={(e) => setCurrentTime(e.target.value)} disabled={loading} />
                </div>
                <div className="md:col-span-2">
                  <Label className="mb-2 block">Weak chapters (comma-separated)</Label>
                  <Textarea value={weak} onChange={(e) => setWeak(e.target.value)} placeholder="e.g. Capital Gains, TDS, Assessment Procedure" disabled={loading} rows={3} />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <Button onClick={generate} disabled={loading} size="lg" className="bg-gradient-primary glow-primary">
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Building plan…</> : "Generate Plan"}
                </Button>
                {timeline && (
                  <Button variant="outline" size="lg" onClick={generate} disabled={loading}>
                    <RefreshCw className="h-4 w-4 mr-2" /> Recalculate
                  </Button>
                )}
              </div>
            </Card>

            {timeline && (
              <div className="relative pl-6">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-primary/60 via-border to-transparent" />
                <div className="flex flex-col gap-4">
                  {timeline.map((b, i) => {
                    const s = styleFor(b.type);
                    const Icon = s.Icon;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="relative"
                      >
                        <span className={`absolute -left-[18px] top-5 h-3 w-3 rounded-full ${s.dot} ring-4 ${s.ring}`} />
                        <Card className={`p-4 glass shadow-3d ring-1 ${s.ring}`}>
                          <div className="flex items-start gap-3">
                            <div className="h-9 w-9 rounded-lg bg-secondary/60 flex items-center justify-center shrink-0">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-3 flex-wrap">
                                <p className="font-mono text-sm text-muted-foreground">{b.timeSlot}</p>
                                <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${s.chip}`}>{b.type}</span>
                              </div>
                              <p className="mt-1 font-medium leading-snug">{b.task}</p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </PageTransition>
  );
}
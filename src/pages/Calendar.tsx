import { useEffect, useMemo, useState } from "react";
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns";
import { CheckCircle2, Circle, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileNav } from "@/components/MobileNav";
import { PageTransition } from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Target = { id: string; target_date: string; module: string; topic: string; done: boolean };

const modules = ["Financial Reporting","Audit","SFM","Direct Tax","Indirect Tax","Costing","Law","Economics","Other"];

const StudyCalendar = () => {
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selected, setSelected] = useState<Date>(new Date());
  const [items, setItems] = useState<Target[]>([]);
  const [module, setModule] = useState(modules[0]);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(true);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const selectedISO = format(selected, "yyyy-MM-dd");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const from = format(weekStart, "yyyy-MM-dd");
    const to = format(addDays(weekStart, 6), "yyyy-MM-dd");
    const { data, error } = await supabase
      .from("study_targets")
      .select("*")
      .gte("target_date", from)
      .lte("target_date", to)
      .order("created_at");
    if (error) toast.error(error.message);
    else setItems((data ?? []) as Target[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user, weekStart]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !user) return;
    const { data, error } = await supabase.from("study_targets")
      .insert({ user_id: user.id, target_date: selectedISO, module, topic: topic.trim(), done: false })
      .select().single();
    if (error) return toast.error(error.message);
    setItems((x) => [...x, data as Target]);
    setTopic("");
  };

  const toggle = async (t: Target) => {
    const next = !t.done;
    setItems((xs) => xs.map((x) => (x.id === t.id ? { ...x, done: next } : x)));
    const { error } = await supabase.from("study_targets").update({ done: next }).eq("id", t.id);
    if (error) toast.error(error.message);
  };

  const remove = async (id: string) => {
    setItems((xs) => xs.filter((x) => x.id !== id));
    const { error } = await supabase.from("study_targets").delete().eq("id", id);
    if (error) toast.error(error.message);
  };

  const todays = items.filter((i) => i.target_date === selectedISO);
  const countFor = (d: Date) => items.filter((i) => i.target_date === format(d, "yyyy-MM-dd")).length;
  const doneFor = (d: Date) => items.filter((i) => i.target_date === format(d, "yyyy-MM-dd") && i.done).length;

  return (
    <PageTransition>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar />
        <MobileNav />
        <main className="flex-1 px-6 lg:px-10 py-8 max-w-6xl mx-auto w-full">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Study calendar</h1>
              <p className="text-sm text-muted-foreground mt-1">Plan and check off your daily ICAI targets.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="h-9 w-9 grid place-items-center glass rounded-lg hover:bg-secondary/60">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-muted-foreground tabular-nums">
                {format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d, yyyy")}
              </span>
              <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="h-9 w-9 grid place-items-center glass rounded-lg hover:bg-secondary/60">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-7 gap-2">
            {days.map((d) => {
              const total = countFor(d);
              const done = doneFor(d);
              const pct = total ? (done / total) * 100 : 0;
              const isSel = isSameDay(d, selected);
              const isToday = isSameDay(d, new Date());
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => setSelected(d)}
                  className={`rounded-2xl p-3 text-left transition-all border ${
                    isSel ? "bg-gradient-primary text-primary-foreground glow-primary border-transparent"
                          : "glass-strong border-border/40 hover:border-primary/50"
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-widest opacity-80">{format(d, "EEE")}</p>
                  <p className="text-2xl font-bold mt-1 tabular-nums">{format(d, "d")}</p>
                  <div className={`mt-2 h-1.5 rounded-full overflow-hidden ${isSel ? "bg-primary-foreground/20" : "bg-secondary"}`}>
                    <div className={`h-full ${isSel ? "bg-primary-foreground" : "bg-gradient-primary"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] mt-1 opacity-80 tabular-nums">{done}/{total}{isToday ? " · today" : ""}</p>
                </button>
              );
            })}
          </div>

          <section className="mt-6 grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 glass-strong rounded-2xl p-6">
              <h2 className="font-semibold mb-4">{format(selected, "EEEE, d MMM yyyy")}</h2>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : todays.length === 0 ? (
                <p className="text-sm text-muted-foreground">No targets yet for this day. Add one →</p>
              ) : (
                <ul className="space-y-2">
                  {todays.map((t) => (
                    <li key={t.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/40">
                      <button onClick={() => toggle(t)}>
                        {t.done ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.topic}</p>
                        <p className="text-[10px] uppercase tracking-widest text-accent">{t.module}</p>
                      </div>
                      <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form onSubmit={add} className="glass-strong rounded-2xl p-6 space-y-3 h-fit">
              <h2 className="font-semibold">Add target</h2>
              <label className="block">
                <span className="text-xs text-muted-foreground">Module</span>
                <select value={module} onChange={(e) => setModule(e.target.value)} className="mt-1 w-full glass rounded-xl px-3 py-2.5 text-sm bg-transparent outline-none">
                  {modules.map((m) => <option key={m} value={m} className="bg-background">{m}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-muted-foreground">Topic</span>
                <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. SA 700 — Modified Opinions"
                  className="mt-1 w-full glass rounded-xl px-3 py-2.5 text-sm bg-transparent outline-none placeholder:text-muted-foreground" />
              </label>
              <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary py-2.5 text-sm font-semibold text-primary-foreground glow-primary hover:scale-[1.01] active:scale-95 transition-transform">
                <Plus className="h-4 w-4" /> Add for {format(selected, "MMM d")}
              </button>
            </form>
          </section>
        </main>
      </div>
    </PageTransition>
  );
};
export default StudyCalendar;

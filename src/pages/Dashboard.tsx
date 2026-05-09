import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, Circle, Flame, Sparkles, TrendingUp, Plus,
  Target, Clock, CalendarDays, ArrowUpRight,
} from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileNav } from "@/components/MobileNav";
import { CountdownRing } from "@/components/CountdownRing";
import { PageTransition } from "@/components/PageTransition";
import { useProfile } from "@/hooks/useProfile";
import { useStreak } from "@/hooks/useStreak";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import { ExamNewsCard } from "@/components/ExamNewsCard";
import { useExamInfo } from "@/hooks/useExamInfo";

type Target = { id: string; topic: string; module: string; done: boolean; target_date: string };

const Dashboard = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const streak = useStreak();
  const exam = profile?.exam_track ?? "CA Final";
  const live = useExamInfo(exam);
  const [targets, setTargets] = useState<Target[]>([]);
  const [week, setWeek] = useState<{ d: string; minutes: number }[]>([]);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [quickTopic, setQuickTopic] = useState("");
  const today = format(new Date(), "yyyy-MM-dd");

  const load = async () => {
    if (!user) return;
    const { data: t } = await supabase
      .from("study_targets").select("*").eq("target_date", today).order("created_at");
    setTargets((t ?? []) as Target[]);
    const since = format(subDays(new Date(), 6), "yyyy-MM-dd");
    const { data: logs } = await supabase
      .from("daily_goal_log").select("log_date,minutes").gte("log_date", since);
    const map = new Map<string, number>();
    (logs ?? []).forEach((l: any) => map.set(l.log_date, l.minutes));
    const wk = Array.from({ length: 7 }, (_, i) => {
      const d = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
      return { d, minutes: map.get(d) ?? 0 };
    });
    setWeek(wk);
    setTodayMinutes(map.get(today) ?? 0);
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user]);

  const completed = targets.filter((t) => t.done).length;

  const toggle = async (t: Target) => {
    const next = !t.done;
    setTargets((xs) => xs.map((x) => (x.id === t.id ? { ...x, done: next } : x)));
    await supabase.from("study_targets").update({ done: next }).eq("id", t.id);
  };

  const addQuick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTopic.trim() || !user) return;
    const { data, error } = await supabase.from("study_targets")
      .insert({ user_id: user.id, target_date: today, module: "General", topic: quickTopic.trim(), done: false })
      .select().single();
    if (error) return toast.error(error.message);
    setTargets((x) => [...x, data as Target]);
    setQuickTopic("");
  };

  const logMinutes = async (delta: number) => {
    if (!user) return;
    const next = Math.max(0, todayMinutes + delta);
    setTodayMinutes(next);
    await supabase.from("daily_goal_log").upsert(
      { user_id: user.id, log_date: today, minutes: next },
      { onConflict: "user_id,log_date" }
    );
    load();
  };

  const goal = profile?.daily_minutes_goal ?? 120;
  const goalPct = Math.min(100, Math.round((todayMinutes / goal) * 100));
  const attemptIso = profile?.attempt_date || live.data?.next_attempt_iso || null;
  const attempt = attemptIso
    ? new Date(attemptIso + (attemptIso.length === 10 ? "T09:00:00" : "")).getTime()
    : new Date("2027-01-15").getTime();
  const daysLeft = Math.max(0, Math.ceil((attempt - Date.now()) / 86400000));
  const syllabusPct = Math.min(99, 100 - Math.round((daysLeft / 365) * 100));
  const maxMin = Math.max(60, ...week.map((w) => w.minutes));
  const targetPct = targets.length ? Math.round((completed / targets.length) * 100) : 0;

  const stats = [
    { icon: Flame,        label: "Streak",        value: `${streak}d`,             tint: "text-accent" },
    { icon: Target,       label: "Targets",       value: `${completed}/${targets.length || 0}`, tint: "text-primary" },
    { icon: Clock,        label: "Today",         value: `${todayMinutes}m`,       tint: "text-success" },
    { icon: CalendarDays, label: "To attempt",    value: `${daysLeft}d`,           tint: "text-accent" },
  ];

  return (
    <PageTransition>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar />
        <MobileNav />

        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 lg:py-10 pt-20 lg:pt-10 max-w-7xl mx-auto w-full">
          {/* Hero */}
          <motion.section
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/15 via-background to-accent/15 p-6 sm:p-8 mb-6 shadow-3d"
          >
            <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/25 blur-3xl" />
            <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Welcome back</p>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mt-2">
                  Hi {profile?.display_name ?? "Student"}, <span className="text-gradient italic">stay sharp.</span>
                </h1>
                <p className="text-sm text-muted-foreground mt-2 max-w-xl">
                  Your <span className="text-foreground font-medium">{exam}</span> command centre — track today's focus, momentum and what's coming next.
                </p>
              </div>
              <a href="/ai-tools" className="btn-3d inline-flex items-center gap-2 rounded-2xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground glow-primary self-start md:self-auto">
                <Sparkles className="h-4 w-4" /> Open AI Tools
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

            {/* Stat strip */}
            <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 mt-7">
              {stats.map((s) => (
                <div key={s.label} className="rounded-2xl glass p-3 sm:p-4 flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl bg-secondary/70 grid place-items-center ${s.tint}`}>
                    <s.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</p>
                    <p className="font-display text-lg font-bold tabular-nums truncate">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Main grid */}
          <div className="grid lg:grid-cols-3 gap-5 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="lg:col-span-2 glass-strong rounded-3xl p-6 shadow-3d"
            >
              <CountdownRing progress={syllabusPct} exam={exam} attemptDate={attemptIso} />
              {!profile?.attempt_date && live.data?.next_attempt_label && (
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Auto-detected from {live.data.source}: <span className="text-foreground font-medium">{live.data.next_attempt_label}</span>. Set your own date in Settings to override.
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass-strong rounded-3xl p-6 shadow-3d flex flex-col"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Daily goal</p>
                <Clock className="h-4 w-4 text-success" />
              </div>
              <p className="mt-3 font-display text-4xl font-bold tabular-nums">
                {todayMinutes}<span className="text-muted-foreground text-base">/{goal}m</span>
              </p>
              <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-gradient-accent transition-all" style={{ width: `${goalPct}%` }} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <button onClick={() => logMinutes(15)} className="btn-3d glass rounded-lg py-2 text-xs font-medium">+15m</button>
                <button onClick={() => logMinutes(30)} className="btn-3d glass rounded-lg py-2 text-xs font-medium">+30m</button>
                <button onClick={() => logMinutes(-15)} className="btn-3d glass rounded-lg py-2 text-xs font-medium">−15m</button>
              </div>

              <div className="mt-5 pt-5 border-t border-border/40">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Target completion</p>
                <p className="mt-2 font-display text-2xl font-bold tabular-nums">{targetPct}%</p>
                <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-gradient-primary transition-all" style={{ width: `${targetPct}%` }} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Targets + chart */}
          <div className="grid lg:grid-cols-3 gap-5">
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="lg:col-span-2 glass-strong rounded-3xl p-6 shadow-3d"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <h2 className="font-display font-semibold">Today's Targets</h2>
                </div>
                <span className="text-xs text-muted-foreground">{format(new Date(), "EEEE, d MMM")}</span>
              </div>

              <form onSubmit={addQuick} className="flex gap-2 mb-4">
                <input
                  value={quickTopic}
                  onChange={(e) => setQuickTopic(e.target.value)}
                  placeholder="Add a target (e.g. SA 700 — Modified Opinions)"
                  className="flex-1 glass rounded-xl px-4 py-2.5 text-sm bg-transparent outline-none focus:ring-2 focus:ring-primary/50 transition"
                />
                <button className="btn-3d inline-flex items-center gap-1 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground glow-primary">
                  <Plus className="h-4 w-4" /> Add
                </button>
              </form>

              <ul className="space-y-2">
                {targets.length === 0 && (
                  <li className="text-sm text-muted-foreground text-center py-8 rounded-xl border border-dashed border-border/50">
                    No targets yet for today. Add one above to start your streak.
                  </li>
                )}
                {targets.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => toggle(t)}
                      className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border border-border/50 transition-all btn-3d ${
                        t.done ? "bg-secondary/40" : "bg-card/40 hover:bg-secondary/40"
                      }`}
                    >
                      {t.done ? (
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                      <span className={`flex-1 text-sm ${t.done ? "line-through text-muted-foreground" : ""}`}>
                        {t.topic}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-accent">{t.module}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="glass-strong rounded-3xl p-6 shadow-3d"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold">Study minutes</h2>
                <span className="text-[10px] text-success inline-flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {goalPct}%</span>
              </div>
              <p className="text-xs text-muted-foreground mb-5">Last 7 days</p>
              <div className="grid grid-cols-7 gap-2">
                {week.map((w) => (
                  <div key={w.d} className="flex flex-col items-center gap-2">
                    <div className="h-20 w-full rounded-lg border border-border/50 grid place-items-end p-1 bg-secondary/40 overflow-hidden">
                      <div
                        className="w-full bg-gradient-primary rounded transition-all"
                        style={{ height: `${(w.minutes / maxMin) * 100}%` }}
                        title={`${w.minutes} min`}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{format(new Date(w.d), "EEE")[0]}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 border border-border/40 p-4">
                <p className="text-xs text-muted-foreground">Days to attempt</p>
                <p className="font-display font-bold text-3xl text-gradient mt-1 tabular-nums">{daysLeft}</p>
                <p className="text-xs text-muted-foreground">{exam}</p>
              </div>
            </motion.div>
          </div>

          <div className="mt-6">
            <ExamNewsCard exam={exam} />
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Dashboard;

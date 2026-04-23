import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Flame, BookOpen, Sparkles, TrendingUp, Plus } from "lucide-react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
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
    const { data: t } = await supabase.from("study_targets").select("*").eq("target_date", today).order("created_at");
    setTargets((t ?? []) as Target[]);
    const since = format(subDays(new Date(), 6), "yyyy-MM-dd");
    const { data: logs } = await supabase.from("daily_goal_log").select("log_date,minutes").gte("log_date", since);
    const map = new Map<string, number>();
    (logs ?? []).forEach((l: any) => map.set(l.log_date, l.minutes));
    const wk = Array.from({ length: 7 }, (_, i) => {
      const d = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
      return { d, minutes: map.get(d) ?? 0 };
    });
    setWeek(wk);
    setTodayMinutes(map.get(today) ?? 0);
  };
  useEffect(() => { load(); }, [user]);

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
  // Prefer the user's own attempt_date; fall back to live institute data; finally a sensible default.
  const attemptIso = profile?.attempt_date || live.data?.next_attempt_iso || null;
  const attempt = attemptIso
    ? new Date(attemptIso + (attemptIso.length === 10 ? "T09:00:00" : "")).getTime()
    : new Date("2027-01-15").getTime();
  const daysLeft = Math.max(0, Math.ceil((attempt - Date.now()) / 86400000));
  const syllabusPct = Math.min(99, 100 - Math.round((daysLeft / 365) * 100));
  const maxMin = Math.max(60, ...week.map((w) => w.minutes));

  return (
    <PageTransition>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar />

        <main className="flex-1 px-6 lg:px-10 py-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-sm text-muted-foreground">Good evening, {profile?.display_name ?? "Student"} 👋</p>
              <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mt-1">
                Your <span className="italic text-gradient">{exam}</span> command centre.
              </h1>
            </div>
            <div className="flex items-center gap-2 glass rounded-full px-4 py-2 text-sm">
              <Flame className="h-4 w-4 text-accent" /> {streak}-day streak active
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-5 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 glass-strong rounded-2xl p-6 shadow-3d"
            >
              <CountdownRing progress={syllabusPct} exam={exam} attemptDate={attemptIso} />
              {!profile?.attempt_date && live.data?.next_attempt_label && (
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Auto-detected from {live.data.source}: <span className="text-foreground font-medium">{live.data.next_attempt_label}</span>. Set your own date in Settings to override.
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-strong rounded-2xl p-6 flex flex-col shadow-3d"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Today's targets</p>
                <Sparkles className="h-4 w-4 text-accent" />
              </div>
              <p className="mt-3 font-display text-4xl font-bold tabular-nums">
                {completed}<span className="text-muted-foreground">/{targets.length || 0}</span>
              </p>
              <p className="text-sm text-muted-foreground">completed</p>
              <div className="mt-4 h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-gradient-primary transition-all"
                  style={{ width: `${targets.length ? (completed / targets.length) * 100 : 0}%` }}
                />
              </div>
              <div className="mt-5 pt-4 border-t border-border/40">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Daily study goal</p>
                <p className="mt-1 font-display text-2xl font-bold tabular-nums">{todayMinutes}<span className="text-muted-foreground text-base">/{goal} min</span></p>
                <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-gradient-accent transition-all" style={{ width: `${goalPct}%` }} />
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => logMinutes(15)} className="btn-3d flex-1 glass rounded-lg py-1.5 text-xs">+15m</button>
                  <button onClick={() => logMinutes(30)} className="btn-3d flex-1 glass rounded-lg py-1.5 text-xs">+30m</button>
                  <button onClick={() => logMinutes(-15)} className="btn-3d flex-1 glass rounded-lg py-1.5 text-xs">-15m</button>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 glass-strong rounded-2xl p-6 shadow-3d">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <h2 className="font-display font-semibold">Today's Targets</h2>
                </div>
                <span className="text-xs text-muted-foreground">{format(new Date(), "EEEE, d MMM")}</span>
              </div>

              <form onSubmit={addQuick} className="flex gap-2 mb-3">
                <input value={quickTopic} onChange={(e) => setQuickTopic(e.target.value)}
                  placeholder="Add a target for today (e.g. SA 700 — Modified Opinions)"
                  className="flex-1 glass rounded-xl px-3 py-2.5 text-sm bg-transparent outline-none" />
                <button className="btn-3d inline-flex items-center gap-1 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground glow-primary">
                  <Plus className="h-4 w-4" /> Add
                </button>
              </form>

              <ul className="space-y-2">
                {targets.length === 0 && (
                  <li className="text-sm text-muted-foreground px-1 py-3">No targets yet for today. Add one above to start your streak.</li>
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
            </div>

            <div className="glass-strong rounded-2xl p-6 shadow-3d">
              <h2 className="font-display font-semibold mb-1">Study minutes</h2>
              <p className="text-xs text-muted-foreground mb-5">Last 7 days</p>
              <div className="grid grid-cols-7 gap-2">
                {week.map((w) => (
                  <div key={w.d} className="flex flex-col items-center gap-2">
                    <div className="h-16 w-full rounded-lg border border-border/50 grid place-items-end p-1 bg-secondary/40 overflow-hidden">
                      <div className="w-full bg-gradient-primary rounded" style={{ height: `${(w.minutes / maxMin) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{format(new Date(w.d), "EEE")[0]}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl glass p-4 shadow-3d">
                <p className="text-xs text-muted-foreground">Days to attempt</p>
                <p className="font-display font-bold text-2xl text-gradient mt-1">{daysLeft} days</p>
                <p className="text-xs text-muted-foreground">{exam}</p>
                <div className="mt-3 flex items-center gap-1 text-[10px] text-success">
                  <TrendingUp className="h-3 w-3" /> {goalPct}% of today's goal
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <ExamNewsCard exam={exam} />
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
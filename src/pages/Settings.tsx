import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileNav } from "@/components/MobileNav";
import { PageTransition } from "@/components/PageTransition";
import { Target, Palette, Timer, Check, CalendarIcon, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { useTheme, THEMES, ThemeName } from "@/contexts/ThemeContext";
import { useExamInfo } from "@/hooks/useExamInfo";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

const Settings = () => {
  const { profile, update, loading } = useProfile();
  const { theme, setTheme } = useTheme();
  const live = useExamInfo(profile?.exam_track);

  if (loading || !profile) {
    return (
      <PageTransition>
        <div className="flex min-h-screen w-full bg-background">
          <DashboardSidebar />
        <MobileNav />
          <main className="flex-1 px-6 lg:px-10 py-8"><p className="text-sm text-muted-foreground">Loading…</p></main>
        </div>
      </PageTransition>
    );
  }

  const save = async (patch: Parameters<typeof update>[0]) => {
    try { await update(patch); toast.success("Saved"); } catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); }
  };

  const pickTheme = (t: ThemeName) => { setTheme(t); save({ theme: t }); };

  const isAuto = !profile.attempt_date;
  const liveIso = live.data?.next_attempt_iso ?? null;
  const effectiveIso = profile.attempt_date || liveIso;
  const effectiveDate = effectiveIso ? parseISO(effectiveIso) : undefined;

  const useAuto = () => save({ attempt_date: null });
  const pickDate = (d: Date | undefined) => {
    if (!d) return;
    save({ attempt_date: format(d, "yyyy-MM-dd") });
  };

  return (
    <PageTransition>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar />
        <MobileNav />
        <main className="flex-1 px-6 lg:px-10 py-8 max-w-3xl mx-auto w-full">
          <h1 className="font-display text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Tune EduElite to your study style. Account &amp; sign-in details live on the <a href="/profile" className="underline">Profile</a> page.</p>

          <section className="mt-8 glass-strong rounded-2xl p-6 space-y-5 shadow-3d">
            <h2 className="font-semibold flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Exam target</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs text-muted-foreground">Course</span>
                <select
                  value={profile.exam_track}
                  onChange={(e) => save({ exam_track: e.target.value })}
                  className="mt-1 w-full glass rounded-xl px-3 py-2.5 text-sm bg-transparent outline-none"
                >
                  {["CA Foundation","CA Inter","CA Final","CS Executive","CS Professional","CMA Inter","CMA Final"].map(x => (
                    <option key={x} value={x} className="bg-background">{x}</option>
                  ))}
                </select>
              </label>
              <div className="block">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Attempt date</span>
                  <span className={cn(
                    "text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full",
                    isAuto ? "bg-primary/15 text-primary" : "bg-accent/15 text-accent"
                  )}>
                    {isAuto ? "Auto-set" : "Manual"}
                  </span>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "btn-3d mt-1 w-full glass rounded-xl px-3 py-2.5 text-sm bg-transparent outline-none flex items-center gap-2 text-left",
                        !effectiveDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="h-4 w-4 opacity-70" />
                      {effectiveDate ? format(effectiveDate, "PPP") : "Pick a date"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={effectiveDate}
                      onSelect={pickDate}
                      disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                {!isAuto && (
                  <button
                    type="button"
                    onClick={useAuto}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                  >
                    <Wand2 className="h-3 w-3" /> Reset to auto-detected date
                  </button>
                )}
              </div>
            </div>
            {live.data?.next_attempt_label && (
              <p className="text-[11px] text-muted-foreground">
                Auto from {live.data.source}: next attempt looks like <span className="text-foreground font-medium">{live.data.next_attempt_label}</span>
                {live.data.next_attempt_iso && ` (${live.data.next_attempt_iso})`}.
                {isAuto ? " This is currently being used on your dashboard." : " Pick a date to override, or reset to auto."}
              </p>
            )}
          </section>

          <section className="mt-5 glass-strong rounded-2xl p-6 space-y-4 shadow-3d">
            <h2 className="font-semibold flex items-center gap-2"><Timer className="h-4 w-4 text-primary" /> Daily study goal</h2>
            <input
              type="number" min={15} max={720} step={15}
              value={profile.daily_minutes_goal}
              onChange={(e) => save({ daily_minutes_goal: Number(e.target.value) })}
              className="w-32 glass rounded-xl px-3 py-2.5 text-sm bg-transparent outline-none"
            />
            <span className="text-xs text-muted-foreground ml-2">minutes per day</span>
          </section>

          <section className="mt-5 glass-strong rounded-2xl p-6 shadow-3d">
            <h2 className="font-semibold flex items-center gap-2 mb-4"><Palette className="h-4 w-4 text-primary" /> Theme</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {THEMES.map((t) => (
                <button key={t.id} onClick={() => pickTheme(t.id)}
                  className={`btn-3d text-left rounded-2xl p-4 border transition-all ${theme === t.id ? "border-primary bg-gradient-primary text-primary-foreground glow-primary" : "border-border bg-card/40 hover:border-primary/50"}`}>
                  <div className="flex items-center justify-between">
                    <p className="font-display font-semibold">{t.label}</p>
                    {theme === t.id && <Check className="h-4 w-4" />}
                  </div>
                  <p className={`text-xs mt-1 ${theme === t.id ? "opacity-90" : "text-muted-foreground"}`}>{t.tagline}</p>
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>
    </PageTransition>
  );
};
export default Settings;

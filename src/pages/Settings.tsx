import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { PageTransition } from "@/components/PageTransition";
import { Bell, Languages, Moon, Target } from "lucide-react";
import { toast } from "sonner";

type Prefs = { bilingual: boolean; notifications: boolean; theme: "dark" | "light"; targetExam: string; targetDate: string };
const KEY = "aurum.prefs";
const defaults: Prefs = { bilingual: true, notifications: true, theme: "dark", targetExam: "CA Final", targetDate: "2027-01-15" };

const Toggle = ({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={() => onChange(!on)}
    className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-gradient-primary" : "bg-secondary"}`}
  >
    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
  </button>
);

const Settings = () => {
  const [p, setP] = useState<Prefs>(defaults);

  useEffect(() => {
    try { const s = localStorage.getItem(KEY); if (s) setP({ ...defaults, ...JSON.parse(s) }); } catch {}
  }, []);

  const save = (next: Prefs) => {
    setP(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    toast.success("Preferences saved");
  };

  return (
    <PageTransition>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar />
        <main className="flex-1 px-6 lg:px-10 py-8 max-w-3xl mx-auto w-full">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Tune Aurum AI to your study style.</p>

          <section className="mt-8 glass-strong rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Exam target</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs text-muted-foreground">Course</span>
                <select
                  value={p.targetExam}
                  onChange={(e) => save({ ...p, targetExam: e.target.value })}
                  className="mt-1 w-full glass rounded-xl px-3 py-2.5 text-sm bg-transparent outline-none"
                >
                  {["CA Foundation","CA Inter","CA Final","CS Executive","CS Professional","CMA Inter","CMA Final"].map(x => (
                    <option key={x} value={x} className="bg-background">{x}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs text-muted-foreground">Attempt date</span>
                <input
                  type="date" value={p.targetDate}
                  onChange={(e) => save({ ...p, targetDate: e.target.value })}
                  className="mt-1 w-full glass rounded-xl px-3 py-2.5 text-sm bg-transparent outline-none"
                />
              </label>
            </div>
          </section>

          <section className="mt-5 glass-strong rounded-2xl p-6 divide-y divide-border/40">
            <Row icon={Languages} title="Bilingual translator default" desc="Auto-translate Hindi prompts into ICAI-grade English.">
              <Toggle on={p.bilingual} onChange={(v) => save({ ...p, bilingual: v })} />
            </Row>
            <Row icon={Bell} title="Daily target reminders" desc="Push a nudge if today's targets aren't done by 8 PM.">
              <Toggle on={p.notifications} onChange={(v) => save({ ...p, notifications: v })} />
            </Row>
            <Row icon={Moon} title="Dark theme" desc="Aurum AI is optimised for late-night revision.">
              <Toggle on={p.theme === "dark"} onChange={(v) => save({ ...p, theme: v ? "dark" : "light" })} />
            </Row>
          </section>
        </main>
      </div>
    </PageTransition>
  );
};

const Row = ({ icon: Icon, title, desc, children }: { icon: any; title: string; desc: string; children: React.ReactNode }) => (
  <div className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
    <div className="h-9 w-9 rounded-xl bg-secondary grid place-items-center"><Icon className="h-4 w-4 text-primary" /></div>
    <div className="flex-1">
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
    {children}
  </div>
);

export default Settings;

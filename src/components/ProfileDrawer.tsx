import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { LogOut, LayoutDashboard, Settings as SettingsIcon, Palette, Target, Flame, X, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useStreak } from "@/hooks/useStreak";
import { useTheme, THEMES, ThemeName } from "@/contexts/ThemeContext";
import { useExamInfo } from "@/hooks/useExamInfo";
import { toast } from "sonner";

type Props = { open: boolean; onClose: () => void };

export const ProfileDrawer = ({ open, onClose }: Props) => {
  const { user, signOut } = useAuth();
  const { profile, update } = useProfile();
  const streak = useStreak();
  const { theme, setTheme } = useTheme();
  const exam = profile?.exam_track ?? "CA Final";
  const info = useExamInfo(open ? exam : undefined);
  const nav = useNavigate();

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [open, onClose]);

  const initials = ((profile?.display_name ?? user?.email) ?? "?").slice(0, 2).toUpperCase();

  const liveDate = info.data?.next_attempt_iso || profile?.attempt_date;
  const target = liveDate ? new Date(liveDate + (liveDate.length === 10 ? "T09:00:00" : "")).getTime() : null;
  const daysLeft = target ? Math.max(0, Math.ceil((target - Date.now()) / 86400000)) : null;

  const pickTheme = async (t: ThemeName) => {
    setTheme(t);
    try { await update({ theme: t }); } catch { /* silent */ }
  };

  const out = async () => {
    await signOut();
    onClose();
    toast.success("Signed out");
    nav("/");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "-110%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-110%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="fixed top-0 left-0 z-[70] h-full w-[88vw] max-w-sm glass-strong border-r border-border/40 p-5 overflow-y-auto"
            role="dialog" aria-label="Profile drawer"
          >
            <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Your workspace</p>
              <button onClick={onClose} aria-label="Close" className="btn-3d glass rounded-lg p-1.5">
                <X className="h-4 w-4" />
              </button>
            </div>

            {!user ? (
              <div className="space-y-4">
                <div className="rounded-2xl glass p-5 shadow-3d">
                  <p className="font-display text-xl font-bold">Sign in to EduElite</p>
                  <p className="text-xs text-muted-foreground mt-1">Save your daily targets, streaks and notes across devices.</p>
                  <Link to="/auth" onClick={onClose}
                    className="btn-3d mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground glow-primary">
                    Sign in / Sign up
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-primary grid place-items-center glow-primary text-lg font-display font-bold text-primary-foreground">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-semibold truncate">{profile?.display_name ?? user.email}</p>
                    <p className="text-xs text-muted-foreground truncate">{exam}</p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <motion.div whileHover={{ y: -2 }} className="rounded-xl glass p-3 shadow-3d">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Flame className="h-3 w-3 text-accent" /> Streak</p>
                    <p className="font-display text-2xl font-bold text-gradient mt-0.5">{streak}d</p>
                  </motion.div>
                  <motion.div whileHover={{ y: -2 }} className="rounded-xl glass p-3 shadow-3d">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Target className="h-3 w-3 text-primary" /> To attempt</p>
                    <p className="font-display text-2xl font-bold text-gradient mt-0.5">{daysLeft === null ? "—" : `${daysLeft}d`}</p>
                  </motion.div>
                </div>

                {info.data?.next_attempt_label && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-3 rounded-xl glass p-3 text-xs"
                  >
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Live · {info.data.source}</p>
                    <p className="mt-0.5">Next attempt: <span className="font-semibold text-foreground">{info.data.next_attempt_label}</span></p>
                  </motion.div>
                )}

                <div className="mt-6">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-1 mb-2">Quick links</p>
                  <div className="space-y-1">
                    {[
                      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
                      { to: "/profile", label: "Edit profile", icon: SettingsIcon },
                      { to: "/settings", label: "Settings", icon: SettingsIcon },
                    ].map((it) => (
                      <Link key={it.to} to={it.to} onClick={onClose}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-secondary/70 transition-colors">
                        <it.icon className="h-4 w-4 text-muted-foreground" />
                        {it.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-1 mb-2 flex items-center gap-1">
                    <Palette className="h-3 w-3" /> Theme
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {THEMES.map((t) => (
                      <button key={t.id} onClick={() => pickTheme(t.id)}
                        className={`btn-3d rounded-xl p-2 text-[10px] border transition-all ${theme === t.id ? "border-primary bg-gradient-primary text-primary-foreground" : "border-border bg-card/40"}`}>
                        {t.label.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-xl glass p-3 text-[11px] text-muted-foreground flex gap-2">
                  <ShieldCheck className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <span>EduElite uses AI strictly to help students prepare for their exams. Your notes and chats are private to your account.</span>
                </div>

                <button onClick={out}
                  className="btn-3d mt-5 inline-flex w-full items-center justify-center gap-2 glass rounded-xl px-4 py-2.5 text-sm">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
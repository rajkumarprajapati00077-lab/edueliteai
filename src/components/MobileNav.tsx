import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, LayoutDashboard, MessageSquareCode, CalendarDays, User as UserIcon, Settings, FileText, Library, Network, Timer, Music as MusicIcon, Brain, Sparkles, FileCheck2 } from "lucide-react";

const items = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { to: "/chat", icon: MessageSquareCode, label: "AI Tutor" },
  { to: "/ai-tools", icon: Sparkles, label: "AI Tools Hub" },
  { to: "/calendar", icon: CalendarDays, label: "Study Calendar" },
  { to: "/notes", icon: FileText, label: "Notes Library" },
  { to: "/syllabus", icon: Library, label: "Syllabus Sheets" },
  { to: "/inter-linkage", icon: Network, label: "Inter-Linkage" },
  { to: "/survival-planner", icon: Timer, label: "Survival Planner" },
  { to: "/quiz", icon: Brain, label: "Quizzes" },
  { to: "/copy-checker", icon: FileCheck2, label: "Copy Checker" },
  { to: "/pro", icon: MusicIcon, label: "Focus Music · Pro" },
  { to: "/profile", icon: UserIcon, label: "Profile" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="fixed left-4 z-40 h-11 w-11 rounded-xl glass-strong grid place-items-center shadow-3d top-[max(1rem,env(safe-area-inset-top))]"
      >
        <Menu className="h-5 w-5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-md" onClick={() => setOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] glass-strong border-r border-border/40 px-4 py-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <span className="font-display text-lg font-bold text-gradient">EduElite</span>
              <button onClick={() => setOpen(false)} aria-label="Close" className="h-9 w-9 rounded-xl hover:bg-secondary/70 grid place-items-center">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 overflow-y-auto">
              {items.map((it) => {
                const active = pathname === it.to;
                return (
                  <Link
                    key={it.label}
                    to={it.to}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      active
                        ? "bg-gradient-primary text-primary-foreground glow-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                    }`}
                  >
                    <it.icon className="h-4 w-4" />
                    {it.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
};

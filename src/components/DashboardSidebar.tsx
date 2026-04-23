import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquareCode, CalendarDays, User as UserIcon, Settings, FileText, Library } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useStreak } from "@/hooks/useStreak";

const items = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { to: "/chat", icon: MessageSquareCode, label: "AI Tutor" },
  { to: "/calendar", icon: CalendarDays, label: "Study Calendar" },
  { to: "/notes", icon: FileText, label: "Notes Library" },
  { to: "/syllabus", icon: Library, label: "Syllabus Sheets" },
  { to: "/profile", icon: UserIcon, label: "Profile" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export const DashboardSidebar = () => {
  const { pathname } = useLocation();
  const streak = useStreak();
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col glass-strong border-r border-border/40 px-4 py-6">
      <div className="px-2 mb-8">
        <Logo />
      </div>

      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 mb-2">Workspace</div>
      <nav className="flex flex-col gap-1">
        {items.map((it) => {
          const active = pathname === it.to;
          return (
            <Link
              key={it.label}
              to={it.to}
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

      <div className="mt-auto">
        <div className="rounded-xl glass p-4 shadow-3d">
          <p className="text-xs text-muted-foreground">Streak</p>
          <p className="font-display text-2xl font-bold text-gradient">{streak} day{streak === 1 ? "" : "s"} 🔥</p>
          <p className="text-xs text-muted-foreground mt-1">Don't break the chain.</p>
        </div>
      </div>
    </aside>
  );
};
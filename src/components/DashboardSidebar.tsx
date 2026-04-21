import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquareCode, CalendarDays, User as UserIcon, Settings, Sparkles } from "lucide-react";

const items = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { to: "/chat", icon: MessageSquareCode, label: "AI Translator" },
  { to: "/calendar", icon: CalendarDays, label: "Study Calendar" },
  { to: "/profile", icon: UserIcon, label: "Profile" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export const DashboardSidebar = () => {
  const { pathname } = useLocation();
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col glass-strong border-r border-border/40 px-4 py-6">
      <Link to="/" className="flex items-center gap-2 px-2 mb-8">
        <div className="h-9 w-9 rounded-lg bg-gradient-primary grid place-items-center glow-primary">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-bold tracking-tight text-lg">
          Aurum<span className="text-gradient">AI</span>
        </span>
      </Link>

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
        <div className="rounded-xl glass p-4">
          <p className="text-xs text-muted-foreground">Streak</p>
          <p className="text-2xl font-bold text-gradient">14 days 🔥</p>
          <p className="text-xs text-muted-foreground mt-1">Don't break the chain.</p>
        </div>
      </div>
    </aside>
  );
};
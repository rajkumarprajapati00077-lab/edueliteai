import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/chat", label: "AI Translator" },
];

export const Navbar = () => {
  const { pathname } = useLocation();
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div className="mx-auto mt-4 max-w-6xl px-4">
        <nav className="glass-strong rounded-2xl px-5 py-3 flex items-center justify-between shadow-elevated">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary grid place-items-center glow-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold tracking-tight text-lg">
              Aurum<span className="text-gradient">AI</span>
            </span>
          </Link>
          <ul className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    pathname === l.to
                      ? "text-foreground bg-secondary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/dashboard"
            className="relative inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground glow-primary hover:scale-[1.03] active:scale-95 transition-transform"
          >
            Start Free Trial
          </Link>
        </nav>
      </div>
    </motion.header>
  );
};
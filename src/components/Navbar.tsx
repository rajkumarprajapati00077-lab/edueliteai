import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";

const links = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/chat", label: "AI Tutor" },
  { to: "/notes", label: "Notes" },
];

export const Navbar = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const cta = user ? { to: "/dashboard", label: "Open workspace" } : { to: "/auth", label: "Start Free Trial" };
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div className="mx-auto mt-4 max-w-6xl px-4">
        <nav className="glass-strong rounded-2xl px-5 py-3 flex items-center justify-between shadow-elevated">
          <Logo />
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
            to={cta.to}
            className="btn-3d inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground glow-primary"
          >
            {cta.label}
          </Link>
        </nav>
      </div>
    </motion.header>
  );
};
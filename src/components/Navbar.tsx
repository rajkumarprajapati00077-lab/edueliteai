import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/chat", label: "AI Tutor" },
  { to: "/notes", label: "Notes" },
];

export const Navbar = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const cta = user ? { to: "/dashboard", label: "Open workspace" } : { to: "/auth", label: "Sign in" };
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 inset-x-0 z-50"
    >
      <div className="mx-auto mt-3 max-w-7xl px-3 sm:px-6">
        <nav className="glass-strong flex items-center justify-between rounded-2xl px-4 py-2.5 shadow-elevated sm:px-5">
          <Logo />
          <ul className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
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
            <div className="flex items-center gap-1 sm:gap-2">
              <Button asChild size="sm" className="btn-3d min-h-11 rounded-full bg-gradient-primary font-semibold shadow-3d">
               <Link to={cta.to}>{cta.label}</Link>
             </Button>
           </div>
        </nav>
      </div>
    </motion.header>
  );
};
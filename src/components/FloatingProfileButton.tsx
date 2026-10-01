import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { ProfileDrawer } from "@/components/ProfileDrawer";
import { User } from "lucide-react";

/** Floating avatar button on the landing page that opens the side profile drawer. */
export const FloatingProfileButton = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { profile } = useProfile();
  const initials = ((profile?.display_name ?? user?.email) ?? "").slice(0, 2).toUpperCase();

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 18 }}
        aria-label={user ? "Open profile" : "Sign in"}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[55] h-12 w-12 rounded-2xl glass-strong shadow-elevated grid place-items-center group"
      >
        <span className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-0 group-hover:opacity-30 transition-opacity blur-md" />
        {user && initials ? (
          <span className="relative font-display font-bold text-sm text-gradient">{initials}</span>
        ) : (
          <User className="relative h-5 w-5 text-foreground" />
        )}
        <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-success ring-2 ring-background" />
      </motion.button>
      <ProfileDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
};
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { PageTransition } from "@/components/PageTransition";
import { LogoMark } from "@/components/Logo";
import { toast } from "sonner";

const Auth = () => {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: { pathname?: string } } };
  const redirect = loc.state?.from?.pathname || "/dashboard";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("If this email belongs to an account, a reset link is on its way.");
        setMode("signin");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        toast.success("Check your email to confirm — or sign in directly if confirmations are off.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        nav(redirect, { replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/dashboard`,
    });
    if (res.error) toast.error(res.error.message);
    if (!res.redirected) setBusy(false);
  };

  return (
    <PageTransition>
      <div className="min-h-screen grid place-items-center px-6 bg-gradient-hero relative">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-md glass-strong rounded-3xl p-8"
        >
          <Link to="/" className="flex items-center gap-2.5 mb-6">
            <LogoMark size={36} />
            <span className="font-display font-bold tracking-tight text-xl">Edu<span className="text-gradient">Elite</span></span>
          </Link>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset your password"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin" ? "Sign in to your study workspace." : mode === "signup" ? "Start your CA / CS / CMA prep with EduElite." : "Enter your account email to receive a reset link."}
          </p>

          {mode !== "forgot" && <Button
            onClick={google}
            disabled={busy}
            variant="outline" className="btn-3d mt-6 w-full min-h-11"
          >
            Continue with Google
          </Button>}

          {mode !== "forgot" && <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className="flex-1 h-px bg-border" /> or email <span className="flex-1 h-px bg-border" />
          </div>}

          <form onSubmit={submit} className={mode === "forgot" ? "mt-6 space-y-3" : "space-y-3"}>
             <label className="block">
              <div className="flex items-center gap-2 glass rounded-xl px-3 py-2.5">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                />
              </div>
            </label>
             {mode !== "forgot" && <label className="block">
              <div className="flex items-center gap-2 glass rounded-xl px-3 py-2.5">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <input
                  type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 6 chars)"
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                />
              </div>
             </label>}
             {mode === "signin" && <div className="text-right"><Button type="button" variant="link" className="h-9 px-0 text-xs" onClick={() => setMode("forgot")}>Forgot password?</Button></div>}
             <Button
              type="submit" disabled={busy}
              className="btn-3d w-full min-h-11 bg-gradient-primary font-semibold glow-primary"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
              <ArrowRight className="h-4 w-4" />
             </Button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            {mode === "signin" ? "New to EduElite? " : mode === "signup" ? "Already have an account? " : "Remembered your password? "}
            <Button variant="link" className="h-9 px-1 text-xs" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
              {mode === "signin" ? "Create one" : "Sign in"}
            </Button>
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
};
export default Auth;

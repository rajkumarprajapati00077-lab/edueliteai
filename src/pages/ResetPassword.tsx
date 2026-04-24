import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageTransition } from "@/components/PageTransition";
import { LogoMark } from "@/components/Logo";
import { toast } from "sonner";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    // Supabase puts the recovery session in the URL hash on landing.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated. Redirecting…");
      setTimeout(() => nav("/dashboard", { replace: true }), 800);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen grid place-items-center px-6 bg-gradient-hero">
        <div className="w-full max-w-md glass-strong rounded-3xl p-8">
          <LogoMark size={36} />
          <h1 className="font-display text-2xl font-bold mt-3">Set a new password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {ready ? "Choose a strong password you haven't used before." : "Validating reset link…"}
          </p>
          <form onSubmit={submit} className="mt-5 space-y-3">
            <div className="flex items-center gap-2 glass rounded-xl px-3 py-2.5">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <input
                type="password" required minLength={6}
                value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="New password (min 6 chars)"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
            </div>
            <button
              type="submit" disabled={busy || !ready}
              className="btn-3d w-full rounded-xl bg-gradient-primary py-2.5 font-semibold text-primary-foreground glow-primary disabled:opacity-50"
            >
              {busy ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
};

export default ResetPassword;
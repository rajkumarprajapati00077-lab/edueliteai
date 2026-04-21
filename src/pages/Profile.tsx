import { useAuth } from "@/contexts/AuthContext";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { PageTransition } from "@/components/PageTransition";
import { User, Mail, Calendar, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Profile = () => {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const initials = (user?.email ?? "?").slice(0, 2).toUpperCase();
  const created = user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—";

  const out = async () => {
    await signOut();
    toast.success("Signed out");
    nav("/");
  };

  return (
    <PageTransition>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar />
        <main className="flex-1 px-6 lg:px-10 py-8 max-w-4xl mx-auto w-full">
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your Aurum AI identity.</p>

          <div className="mt-8 glass-strong rounded-2xl p-8 flex items-center gap-5">
            <div className="h-20 w-20 rounded-2xl bg-gradient-primary grid place-items-center glow-primary text-2xl font-bold text-primary-foreground">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-lg truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">CA / CS / CMA aspirant</p>
            </div>
            <button
              onClick={out}
              className="inline-flex items-center gap-2 glass rounded-xl px-4 py-2 text-sm hover:bg-secondary/60"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <div className="glass-strong rounded-2xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> Email
              </div>
              <p className="mt-2 text-sm break-all">{user?.email}</p>
            </div>
            <div className="glass-strong rounded-2xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" /> Member since
              </div>
              <p className="mt-2 text-sm">{created}</p>
            </div>
            <div className="glass-strong rounded-2xl p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <User className="h-3.5 w-3.5" /> User ID
              </div>
              <p className="mt-2 text-xs text-muted-foreground break-all">{user?.id}</p>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};
export default Profile;

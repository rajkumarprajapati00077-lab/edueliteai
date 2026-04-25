import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { MobileNav } from "@/components/MobileNav";
import { PageTransition } from "@/components/PageTransition";
import { Mail, Calendar, LogOut, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { profile, update } = useProfile();
  const nav = useNavigate();
  const [name, setName] = useState("");
  useEffect(() => { setName(profile?.display_name ?? ""); }, [profile?.display_name]);
  const initials = ((profile?.display_name ?? user?.email) ?? "?").slice(0, 2).toUpperCase();
  const created = user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—";

  const out = async () => {
    await signOut();
    toast.success("Signed out");
    nav("/");
  };

  const saveName = async () => {
    try { await update({ display_name: name }); toast.success("Profile updated"); }
    catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); }
  };

  return (
    <PageTransition>
      <div className="flex min-h-screen w-full bg-background">
        <DashboardSidebar />
        <MobileNav />
        <main className="flex-1 px-6 lg:px-10 py-8 max-w-4xl mx-auto w-full">
          <h1 className="font-display text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your EduElite identity.</p>

          <div className="mt-8 glass-strong rounded-2xl p-8 flex items-center gap-5 shadow-3d">
            <div className="h-20 w-20 rounded-2xl bg-gradient-primary grid place-items-center glow-primary text-2xl font-display font-bold text-primary-foreground">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-lg truncate">{profile?.display_name ?? user?.email}</p>
              <p className="text-xs text-muted-foreground">{profile?.exam_track ?? "CA / CS / CMA aspirant"}</p>
            </div>
            <button
              onClick={out}
              className="btn-3d inline-flex items-center gap-2 glass rounded-xl px-4 py-2 text-sm"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <div className="glass-strong rounded-2xl p-5 sm:col-span-2 shadow-3d">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Display name</p>
              <div className="mt-2 flex items-center gap-2">
                <input value={name} onChange={(e) => setName(e.target.value)}
                  className="flex-1 glass rounded-xl px-3 py-2.5 text-sm bg-transparent outline-none" />
                <button onClick={saveName} className="btn-3d inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground glow-primary">
                  <Save className="h-4 w-4" /> Save
                </button>
              </div>
            </div>
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
          </div>
        </main>
      </div>
    </PageTransition>
  );
};
export default Profile;

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Profile = {
  id: string;
  user_id: string;
  display_name: string | null;
  exam_track: string;
  attempt_date: string | null;
  theme: string;
  daily_minutes_goal: number;
};

// Tiny global event bus so any component that updates the profile
// causes every other consumer to refetch and stay in sync.
const listeners = new Set<() => void>();
export const broadcastProfileChange = () => listeners.forEach((l) => l());

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) { setProfile(null); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
    if (data) setProfile(data as Profile);
    else {
      // Fallback: create one if the trigger somehow missed (e.g. legacy users)
      const { data: created } = await supabase.from("profiles")
        .insert({ user_id: user.id, display_name: user.email?.split("@")[0] ?? "Student" })
        .select().single();
      if (created) setProfile(created as Profile);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
    const fn = () => load();
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, [load]);

  const update = useCallback(async (patch: Partial<Profile>) => {
    if (!user || !profile) return;
    // Optimistic update
    setProfile({ ...profile, ...patch });
    const { error } = await supabase.from("profiles").update(patch).eq("user_id", user.id);
    if (error) { await load(); throw error; }
    broadcastProfileChange();
  }, [user, profile, load]);

  return { profile, loading, update, refresh: load };
};
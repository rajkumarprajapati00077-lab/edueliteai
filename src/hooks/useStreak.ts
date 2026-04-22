import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays } from "date-fns";

/** Counts consecutive days ending today (or yesterday) where the user
 * either logged minutes or completed at least one study target. */
export const useStreak = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const since = format(subDays(new Date(), 60), "yyyy-MM-dd");
      const [{ data: targets }, { data: logs }] = await Promise.all([
        supabase.from("study_targets").select("target_date,done").eq("user_id", user.id).gte("target_date", since),
        supabase.from("daily_goal_log").select("log_date,minutes").eq("user_id", user.id).gte("log_date", since),
      ]);
      const active = new Set<string>();
      (targets ?? []).forEach((t: any) => { if (t.done) active.add(t.target_date); });
      (logs ?? []).forEach((l: any) => { if ((l.minutes ?? 0) > 0) active.add(l.log_date); });
      let s = 0;
      let d = new Date();
      const todayKey = format(d, "yyyy-MM-dd");
      if (!active.has(todayKey)) d = subDays(d, 1); // grace for today
      while (active.has(format(d, "yyyy-MM-dd"))) {
        s += 1;
        d = subDays(d, 1);
      }
      setStreak(s);
    })();
  }, [user]);

  return streak;
};
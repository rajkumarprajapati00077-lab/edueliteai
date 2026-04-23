import { motion } from "framer-motion";
import { Newspaper, ExternalLink, RefreshCw } from "lucide-react";
import { useExamInfo } from "@/hooks/useExamInfo";

export const ExamNewsCard = ({ exam }: { exam: string }) => {
  const { data, loading, error } = useExamInfo(exam);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl p-6 shadow-3d"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-primary" />
          <h2 className="font-display font-semibold">Live from {data?.source ?? "ICAI / ICSI / ICMAI"}</h2>
        </div>
        {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
      </div>
      <p className="text-xs text-muted-foreground">Auto-fetched announcements & next attempt window</p>

      {data?.next_attempt_label && (
        <div className="mt-4 rounded-xl glass p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Next attempt</p>
          <p className="font-display text-lg font-bold text-gradient">{data.next_attempt_label}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Confidence: {data.confidence}</p>
        </div>
      )}

      <ul className="mt-4 space-y-2">
        {(!data || data.news.length === 0) && !loading && (
          <li className="text-xs text-muted-foreground py-2">
            {error ? "Couldn't reach the institute right now. Try again in a moment." : "No fresh announcements indexed yet."}
          </li>
        )}
        {data?.news.slice(0, 5).map((n, i) => (
          <motion.li
            key={`${n.title}-${i}`}
            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border/50 p-3 bg-card/40"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium leading-snug">{n.title}</p>
              {n.url && (
                <a href={n.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground shrink-0">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{n.summary}</p>
            {n.date && <p className="text-[10px] text-muted-foreground mt-1">{n.date}</p>}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};
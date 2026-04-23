import { useEffect, useState } from "react";

export type NewsItem = { title: string; date?: string; summary: string; url?: string };
export type ExamInfo = {
  source: "ICAI" | "ICSI" | "ICMAI" | string;
  exam: string;
  next_attempt_label: string;
  next_attempt_iso: string;
  confidence: "high" | "medium" | "low";
  news: NewsItem[];
  cached?: boolean;
};

const CACHE_KEY = (e: string) => `eduelite.exam-info.${e}`;
const CACHE_TTL = 6 * 60 * 60 * 1000;

export const useExamInfo = (exam: string | undefined) => {
  const [data, setData] = useState<ExamInfo | null>(() => {
    if (!exam || typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(CACHE_KEY(exam));
      if (!raw) return null;
      const { at, data } = JSON.parse(raw);
      if (Date.now() - at < CACHE_TTL) return data;
    } catch { /* noop */ }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!exam) return;
    const cached = (() => {
      try {
        const raw = localStorage.getItem(CACHE_KEY(exam));
        if (!raw) return null;
        const { at, data } = JSON.parse(raw);
        if (Date.now() - at < CACHE_TTL) return data as ExamInfo;
      } catch { /* noop */ }
      return null;
    })();
    if (cached) { setData(cached); return; }

    let cancelled = false;
    const run = async () => {
      setLoading(true); setError(null);
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/exam-info?exam=${encodeURIComponent(exam)}`;
        const r = await fetch(url, {
          headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = (await r.json()) as ExamInfo;
        if (cancelled) return;
        setData(json);
        localStorage.setItem(CACHE_KEY(exam), JSON.stringify({ at: Date.now(), data: json }));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [exam]);

  return { data, loading, error };
};
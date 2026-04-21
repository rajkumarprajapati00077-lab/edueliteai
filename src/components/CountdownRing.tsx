import { useEffect, useState } from "react";

const TARGET = new Date("2027-01-15T09:00:00").getTime();

export const CountdownRing = ({ progress = 42 }: { progress?: number }) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = Math.max(0, TARGET - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const mins = Math.floor((diff / 60000) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  const radius = 78;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (progress / 100) * circ;

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-44 w-44 shrink-0">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 180 180">
          <defs>
            <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(220 100% 62%)" />
              <stop offset="100%" stopColor="hsl(270 95% 65%)" />
            </linearGradient>
          </defs>
          <circle cx="90" cy="90" r={radius} stroke="hsl(var(--border))" strokeWidth="10" fill="none" />
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="url(#ring)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="text-3xl font-bold text-gradient">{progress}%</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Syllabus</p>
          </div>
        </div>
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Target attempt</p>
        <p className="text-2xl font-bold mt-1">CA Final · Jan 2027</p>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            { v: days, l: "Days" },
            { v: hours, l: "Hrs" },
            { v: mins, l: "Min" },
            { v: secs, l: "Sec" },
          ].map((s) => (
            <div key={s.l} className="rounded-lg glass px-3 py-2 text-center min-w-14">
              <p className="text-lg font-bold tabular-nums">{String(s.v).padStart(2, "0")}</p>
              <p className="text-[10px] uppercase text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
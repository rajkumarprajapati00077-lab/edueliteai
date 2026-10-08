/** Animated pencil-style overlay: laptop with live chart + paper planes crossing. */
export const SketchMotion = () => (
  <svg viewBox="0 0 1536 768" className="sketch-motion pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true"
    fill="none" stroke="hsl(var(--foreground))" strokeLinecap="round" strokeLinejoin="round">
    {/* Laptop */}
    <g transform="translate(70 520)" strokeWidth="3">
      <rect x="0" y="0" width="230" height="140" rx="8" fill="hsl(var(--background))" />
      <path d="M-25 152 h280 l-18 18 h-244 z" fill="hsl(var(--background))" />
      <path d="M14 120 h202 M14 30 v90" strokeWidth="1" opacity=".35" />
      <path className="chart-line" pathLength={1} d="M18 108 L45 92 L66 100 L92 70 L114 82 L140 46 L162 60 L186 30 L212 18" stroke="hsl(var(--success))" strokeWidth="3.5" />
      <path className="chart-line chart-down" pathLength={1} d="M18 40 L44 52 L70 44 L96 72 L120 64 L146 92 L170 84 L212 110" stroke="hsl(var(--destructive))" strokeWidth="2.5" />
    </g>
    {/* Planes */}
    <path id="flyR" d="M-80 180 C 400 60, 900 260, 1620 120" stroke="none" />
    <path id="flyL" d="M1620 330 C 1100 230, 600 420, -80 280" stroke="none" />
    <g className="plane">
      <path d="M-18 -8 L22 0 L-18 8 L-8 0 Z" fill="hsl(var(--background))" strokeWidth="2.5" />
      <animateMotion dur="14s" repeatCount="indefinite" rotate="auto"><mpath href="#flyR" /></animateMotion>
    </g>
    <g className="plane">
      <path d="M-18 -8 L22 0 L-18 8 L-8 0 Z" fill="hsl(var(--background))" strokeWidth="2.5" />
      <animateMotion dur="18s" begin="4s" repeatCount="indefinite" rotate="auto"><mpath href="#flyL" /></animateMotion>
    </g>
  </svg>
);

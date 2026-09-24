import { forwardRef, useId } from "react";
import { Link } from "react-router-dom";

/** EduElite mark — stylized "E" laurel + diamond. Pure SVG, theme-aware. */
export const LogoMark = forwardRef<SVGSVGElement, { size?: number; className?: string }>(
  ({ size = 36, className = "" }, ref) => {
    const gradientId = useId();
    return (
  <svg ref={ref} width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
    <defs>
      <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="hsl(var(--primary))" />
        <stop offset="100%" stopColor="hsl(var(--accent))" />
      </linearGradient>
    </defs>
    <path d="M32 4 55 13v17c0 14-9.3 24.6-23 30C18.3 54.6 9 44 9 30V13L32 4Z" fill="hsl(var(--card))" stroke={`url(#${gradientId})`} strokeWidth="2" />
    <path d="M22 20h22M22 31h17M22 42h22" stroke={`url(#${gradientId})`} strokeWidth="3.5" strokeLinecap="round" />
    <path d="m17 16 5 4-5 4m0 14 5 4-5 4" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
    );
  },
);
LogoMark.displayName = "LogoMark";

export const Logo = ({ to = "/", size = 32 }: { to?: string; size?: number }) => (
  <Link to={to} className="flex items-center gap-2.5 group">
    <LogoMark size={size} className="transition-transform group-hover:rotate-6" />
    <span className="font-display font-bold tracking-tight text-xl">
      Edu<span className="text-gradient">Elite</span>
    </span>
  </Link>
);
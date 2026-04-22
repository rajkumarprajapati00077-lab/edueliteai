import { Link } from "react-router-dom";

/** EduElite mark — stylized "E" laurel + diamond. Pure SVG, theme-aware. */
export const LogoMark = ({ size = 36, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
    <defs>
      <linearGradient id="el-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="hsl(var(--primary))" />
        <stop offset="100%" stopColor="hsl(var(--accent))" />
      </linearGradient>
      <filter id="el-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" />
      </filter>
    </defs>
    <rect x="4" y="4" width="56" height="56" rx="14" fill="hsl(var(--card))" stroke="url(#el-grad)" strokeWidth="2" />
    <path d="M32 12 L40 22 L32 32 L24 22 Z" fill="url(#el-grad)" opacity="0.25" />
    <path d="M20 22 H44 M20 32 H38 M20 42 H44" stroke="url(#el-grad)" strokeWidth="3.5" strokeLinecap="round" />
    <circle cx="46" cy="44" r="3" fill="url(#el-grad)" filter="url(#el-glow)" />
  </svg>
);

export const Logo = ({ to = "/", size = 32 }: { to?: string; size?: number }) => (
  <Link to={to} className="flex items-center gap-2.5 group">
    <LogoMark size={size} className="transition-transform group-hover:rotate-6" />
    <span className="font-display font-bold tracking-tight text-xl">
      Edu<span className="text-gradient">Elite</span>
    </span>
  </Link>
);
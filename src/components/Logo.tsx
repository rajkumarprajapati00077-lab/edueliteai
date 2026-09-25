import { Link } from "react-router-dom";
import logoSymbol from "@/assets/eduelite-logo-concept-a.png";

/** EduElite's open-book E: learning, progress, and achievement in one symbol. */
export const LogoMark = ({ size = 36, className = "" }: { size?: number; className?: string }) => (
  <img
    src={logoSymbol}
    alt=""
    aria-hidden="true"
    width={size}
    height={size}
    className={`object-contain ${className}`}
  />
);

export const Logo = ({ to = "/", size = 32 }: { to?: string; size?: number }) => (
  <Link to={to} className="group flex items-center gap-2.5" aria-label="EduElite home">
    <LogoMark size={size} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105" />
    <span className="font-display text-lg font-bold sm:text-xl">
      Edu<span className="text-primary">Elite</span>
    </span>
  </Link>
);
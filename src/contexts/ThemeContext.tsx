import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeName = "premium-dark" | "minimal-modern" | "academic-editorial";

export const THEMES: { id: ThemeName; label: string; tagline: string }[] = [
  { id: "premium-dark", label: "Premium Dark", tagline: "Deep navy + warm gold. Late-night revision." },
  { id: "minimal-modern", label: "Minimal Modern", tagline: "Off-black + electric violet. Linear vibes." },
  { id: "academic-editorial", label: "Academic Editorial", tagline: "Cream + emerald. Premium textbook feel." },
];

const KEY = "eduelite.theme";

type Ctx = { theme: ThemeName; setTheme: (t: ThemeName) => void };
const ThemeCtx = createContext<Ctx>({ theme: "premium-dark", setTheme: () => {} });

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    if (typeof window === "undefined") return "premium-dark";
    const stored = localStorage.getItem(KEY) as ThemeName | null;
    return stored ?? "premium-dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("light", theme === "academic-editorial");
    document.documentElement.classList.toggle("dark", theme !== "academic-editorial");
    localStorage.setItem(KEY, theme);
  }, [theme]);

  return <ThemeCtx.Provider value={{ theme, setTheme: setThemeState }}>{children}</ThemeCtx.Provider>;
};

export const useTheme = () => useContext(ThemeCtx);
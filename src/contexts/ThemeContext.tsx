import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeName = "minimal-modern" | "academic-editorial";

export const THEMES: { id: ThemeName; label: string; tagline: string }[] = [
  { id: "minimal-modern", label: "Minimal", tagline: "Graphite + coral" },
  { id: "academic-editorial", label: "Academic", tagline: "Paper + ink" },
];

const KEY = "eduelite.theme";

type Ctx = { theme: ThemeName; setTheme: (t: ThemeName) => void };
const ThemeCtx = createContext<Ctx>({ theme: "minimal-modern", setTheme: () => {} });

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    if (typeof window === "undefined") return "minimal-modern";
    const stored = localStorage.getItem(KEY);
    return stored === "academic-editorial" ? "academic-editorial" : "minimal-modern";
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
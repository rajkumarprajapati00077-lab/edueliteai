import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type DisplayMode = "light" | "dark";
const KEY = "eduelite.display-mode";

type Ctx = { mode: DisplayMode; toggleMode: () => void };
const ThemeCtx = createContext<Ctx>({ mode: "light", toggleMode: () => {} });

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<DisplayMode>(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem(KEY);
    return stored === "dark" || stored === "light" ? stored : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "academic-editorial");
    document.documentElement.setAttribute("data-mode", mode);
    document.documentElement.classList.toggle("light", mode === "light");
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);

  useEffect(() => {
    if (localStorage.getItem(KEY)) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setMode(media.matches ? "dark" : "light");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const toggleMode = () => setMode((current) => {
    const next = current === "light" ? "dark" : "light";
    localStorage.setItem(KEY, next);
    return next;
  });
  return <ThemeCtx.Provider value={{ mode, toggleMode }}>{children}</ThemeCtx.Provider>;
};

export const useTheme = () => useContext(ThemeCtx);
import { useEffect, ReactNode } from "react";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "academic-editorial");
    document.documentElement.setAttribute("data-mode", "light");
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("eduelite.display-mode");
  }, []);
  return children;
};
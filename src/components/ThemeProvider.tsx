import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = "kendrah-theme";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [theme, setThemeState] = useState<Theme>(() => {
    return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
  });

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
  };

  useEffect(() => {
    const isSystemArea = location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/admin");
    document.documentElement.classList.toggle("dark", isSystemArea && theme === "dark");
    document.documentElement.style.colorScheme = isSystemArea && theme === "dark" ? "dark" : "light";
  }, [location.pathname, theme]);

  const value = useMemo(() => ({
    theme,
    setTheme,
    toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
};

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
const THEME_STORAGE_KEY = "securepass.theme";
const ThemeContext = createContext(null);
const themeBootstrapScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}")||"dark";document.documentElement.classList.toggle("dark",t==="dark");}catch(e){}})();`;
function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("dark");
  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    const initial = stored === "light" || stored === "dark" ? stored : "dark";
    setThemeState(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);
  const setTheme = useCallback((next) => {
    setThemeState(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
    }
  }, []);
  const value = useMemo(
    () => ({ theme, setTheme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") }),
    [theme, setTheme]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useThemeContext must be used inside ThemeProvider");
  return context;
}
export {
  THEME_STORAGE_KEY,
  ThemeProvider,
  themeBootstrapScript,
  useThemeContext
};

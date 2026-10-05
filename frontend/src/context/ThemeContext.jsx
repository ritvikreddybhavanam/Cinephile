import { createContext, useContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState(() => {
        const savedTheme = localStorage.getItem("cinephile_theme");
        if (savedTheme === "light" || savedTheme === "dark") {
            return savedTheme;
        }
        // If user has system preference for light
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
            return "light";
        }
        return "dark";
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === "light") {
            root.classList.remove("dark");
            root.classList.add("light");
            root.setAttribute("data-theme", "light");
            root.style.colorScheme = "light";
        } else {
            root.classList.remove("light");
            root.classList.add("dark");
            root.setAttribute("data-theme", "dark");
            root.style.colorScheme = "dark";
        }
        localStorage.setItem("cinephile_theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setThemeState((prev) => (prev === "light" ? "dark" : "light"));
    };

    const setTheme = (newTheme) => {
        if (newTheme === "light" || newTheme === "dark") {
            setThemeState(newTheme);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, isDark: theme === "dark", isLight: theme === "light", toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};

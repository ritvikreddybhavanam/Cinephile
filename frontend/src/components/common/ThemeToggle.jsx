import { useTheme } from "../../context/ThemeContext";

function ThemeToggle({ className = "", showLabel = false }) {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
            title={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
            className={`group relative inline-flex items-center justify-center rounded-full border border-border bg-surface p-2 text-text-2 transition-all duration-200 hover:border-accent hover:text-accent hover:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 cursor-pointer ${
                showLabel ? "gap-2 px-3 py-1.5" : "h-9 w-9"
            } ${className}`}
        >
            <span
                className={`material-symbols-outlined text-[19px] transition-transform duration-300 ease-out ${
                    isDark
                        ? "rotate-0 text-accent"
                        : "rotate-180 text-amber-600 dark:text-accent"
                } group-hover:scale-110`}
            >
                {isDark ? "light_mode" : "dark_mode"}
            </span>

            {showLabel && (
                <span className="text-xs font-medium text-text select-none">
                    {isDark ? "Light Mode" : "Dark Mode"}
                </span>
            )}
        </button>
    );
}

export default ThemeToggle;

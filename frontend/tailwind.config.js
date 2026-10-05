/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                // ── Midnight Cinema Palette ──────────────────────────
                bg:           "#0B0C10",
                surface:      "#14161C",
                "surface-2":  "#1B1E26",
                border:       "#262A34",

                text:         "#ECE8E1",
                "text-2":     "#A6A29A",
                "text-3":     "#6E6B65",

                accent:       "#C9A86A",
                "accent-hover": "#DDBF85",

                wine:         "#7C3A4B",
                success:      "#7FA88C",
                error:        "#C4646F",

                // ── Legacy aliases ───────────────────────────────────
                primary:      "#C9A86A",
            },
            fontFamily: {
                serif:  ["Fraunces", "Georgia", "serif"],
                sans:   ["Inter", "system-ui", "sans-serif"],
                display: ["Fraunces", "Georgia", "serif"],
            },
            borderRadius: {
                DEFAULT: "10px",
                sm:   "6px",
                md:   "10px",
                lg:   "14px",
                xl:   "20px",
                full: "9999px",
            },
            maxWidth: {
                content: "1200px",
            },
            boxShadow: {
                card:        "0 8px 30px rgba(0,0,0,0.45)",
                "card-hover": "0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,106,0.35)",
                elevated:    "0 20px 60px rgba(0,0,0,0.7)",
            },
            transitionDuration: {
                fast:  "150",
                base:  "200",
                slow:  "350",
            },
        },
    },
    plugins: [],
};

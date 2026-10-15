import api from "./api";

// Get aggregated content guide for a film
export const getContentGuide = async (movieId) => {
    const response = await api.get(`/content-guide/movie/${movieId}`);
    return response.data;
};

// Submit a community content advisory
export const submitContentAdvisory = async ({ movieId, category, severity, details }) => {
    const response = await api.post("/content-guide/advisory", {
        movieId: Number(movieId),
        category,
        severity,
        details: details || "",
    });
    return response.data;
};

// Local storage key for user warning preferences
const WARNING_PREFS_KEY = "cinephile_warning_preferences";
const SPOILER_VISIBILITY_KEY = "cinephile_spoiler_visibility";

export const ADVISORY_CATEGORIES = [
    { id: "VIOLENCE_GORE", label: "Violence & Gore", emoji: "⚠️", desc: "Physical violence, injury, blood, or combat" },
    { id: "JUMP_SCARES", label: "Jump Scares", emoji: "⚡", desc: "Sudden startling audio/visual shocks" },
    { id: "FLASHING_LIGHTS", label: "Flashing / Strobe Effects", emoji: "💡", desc: "Photosensitive, rapid flashing or strobe patterns" },
    { id: "ANIMAL_HARM", label: "Animal Harm", emoji: "🐕", desc: "Injury, death, or distress involving animals" },
    { id: "SEXUAL_CONTENT", label: "Sexual Content", emoji: "🔞", desc: "Nudity, intimacy, or sexual themes" },
    { id: "SUBSTANCE_USE", label: "Substance Use", emoji: "🍷", desc: "Drug, alcohol, or heavy tobacco consumption" },
    { id: "PSYCHOLOGICAL_DISTRESS", label: "Psychological / Disturbing", emoji: "🧠", desc: "Intense paranoia, self-harm, or psychological trauma" },
    { id: "CLAUSTROPHOBIA", label: "Claustrophobia & Confinement", emoji: "📦", desc: "Trapped spaces, burial, or enclosed confinement" },
    { id: "OTHER", label: "Other Content Advisory", emoji: "ℹ️", desc: "Other notable sensory or situational advisories" },
];

export const SEVERITY_LEVELS = [
    { id: "NONE", label: "None Reported", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
    { id: "MILD", label: "Mild", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
    { id: "MODERATE", label: "Moderate", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
    { id: "STRONG", label: "Strong", color: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
    { id: "EXTREME", label: "Extreme", color: "text-rose-400 bg-rose-500/10 border-rose-500/30" },
];

export const getUserWarningPreferences = () => {
    try {
        const data = localStorage.getItem(WARNING_PREFS_KEY);
        return data ? JSON.parse(data) : ["ANIMAL_HARM", "FLASHING_LIGHTS"]; // safe defaults
    } catch {
        return ["ANIMAL_HARM", "FLASHING_LIGHTS"];
    }
};

export const saveUserWarningPreferences = (prefs) => {
    try {
        localStorage.setItem(WARNING_PREFS_KEY, JSON.stringify(prefs));
    } catch (e) {
        console.error("Failed to save warning preferences", e);
    }
};

// Spoiler visibility preferences: 'hide_blocks' (default) | 'hide_major' | 'show_all'
export const getSpoilerVisibilityPreference = () => {
    return localStorage.getItem(SPOILER_VISIBILITY_KEY) || "hide_blocks";
};

export const saveSpoilerVisibilityPreference = (val) => {
    localStorage.setItem(SPOILER_VISIBILITY_KEY, val);
};

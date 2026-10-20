import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../common/Icon";
import { getMovies } from "../../services/movieService";
import { formatMovie } from "../../utils/landingOrchestrator";

const RUNTIME_OPTIONS = [
    { label: "Any Length", lte: null, gte: null },
    { label: "Under 100 mins (Snack)", lte: 100, gte: null },
    { label: "100 – 140 mins (Standard)", lte: 140, gte: 100 },
    { label: "140+ mins (Epic Journey)", lte: null, gte: 140 }
];

const GENRE_OPTIONS = [
    { label: "Any Genre", id: "" },
    { label: "Sci-Fi", id: "878" },
    { label: "Thriller & Mystery", id: "53,9648" },
    { label: "Crime & Noir", id: "80" },
    { label: "Drama", id: "18" },
    { label: "Comedy", id: "35" },
    { label: "Horror", id: "27" },
    { label: "Animation", id: "16" }
];

const LANGUAGE_OPTIONS = [
    { label: "Any Language", code: "" },
    { label: "English", code: "en" },
    { label: "Japanese (Anime & Cinema)", code: "ja" },
    { label: "Korean (K-Cinema)", code: "ko" },
    { label: "French", code: "fr" },
    { label: "Italian", code: "it" },
    { label: "Spanish", code: "es" }
];

const RATING_OPTIONS = [
    { label: "Any Rating", val: "" },
    { label: "Good (7.0+)", val: "7.0" },
    { label: "Great (7.5+)", val: "7.5" },
    { label: "Masterpiece (8.0+)", val: "8.0" }
];

export default function PersonalDiscoveryWidget() {
    const navigate = useNavigate();

    const [runtimeIdx, setRuntimeIdx] = useState(0);
    const [genreId, setGenreId] = useState("");
    const [languageCode, setLanguageCode] = useState("");
    const [minRating, setMinRating] = useState("7.0");

    const [matches, setMatches] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const selectedRuntime = RUNTIME_OPTIONS[runtimeIdx];
            const params = {
                page: 1,
                sortBy: "popularity.desc"
            };

            if (selectedRuntime.lte) params.runtimeLte = selectedRuntime.lte;
            if (selectedRuntime.gte) params.runtimeGte = selectedRuntime.gte;
            if (genreId) params.genre = genreId;
            if (languageCode) params.language = languageCode;
            if (minRating) params.rating = minRating;

            const res = await getMovies(params);
            const list = res?.results || [];

            if (list.length === 0) {
                // If overly strict, try relaxing rating or runtime
                const relaxedRes = await getMovies({ page: 1, sortBy: "popularity.desc", genre: genreId || undefined, language: languageCode || undefined });
                const fallbackList = relaxedRes?.results || [];
                setMatches(fallbackList.slice(0, 3).map((m) => ({
                    ...formatMovie(m),
                    matchReason: `Closest match in catalogue: top rated ${m.title}`
                })));
            } else {
                setMatches(list.slice(0, 3).map((m) => {
                    const formatted = formatMovie(m);
                    const runtimeStr = selectedRuntime.label !== "Any Length" ? ` ${selectedRuntime.label.toLowerCase()}` : "";
                    const langStr = languageCode ? ` ${languageCode.toUpperCase()}` : "";
                    return {
                        ...formatted,
                        matchReason: `Matches your criteria:${runtimeStr}${langStr} rated ★${formatted.rating}`
                    };
                }));
            }
        } catch (err) {
            console.error("Personal discovery match failed:", err);
            setError("Unable to find matches at this moment.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setRuntimeIdx(0);
        setGenreId("");
        setLanguageCode("");
        setMinRating("7.0");
        setMatches(null);
        setError(null);
    };

    return (
        <section className="page-container" aria-label="Personal Film Discovery">
            <div className="rounded-2xl border border-accent/25 bg-surface p-6 sm:p-8 md:p-10 shadow-card relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,168,106,0.06)_0%,transparent_60%)] pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-border/70 pb-6 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="material-symbols-outlined text-accent text-[20px]">
                                psychology
                            </span>
                            <p className="label-caps !mb-0">Decision Engine</p>
                        </div>
                        <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-text tracking-tight">
                            What Should I Watch Tonight?
                        </h2>
                        <p className="mt-1 text-xs sm:text-sm text-text-3">
                            Tell Cinephile your available time, language preference, and rating bar to get instant recommendations
                        </p>
                    </div>

                    <Link
                        to="/what-to-watch"
                        className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5 self-start lg:self-auto"
                    >
                        <span>Full Recommendation Tool</span>
                        <Icon className="text-sm">arrow_forward</Icon>
                    </Link>
                </div>

                {/* Filter Selector Grid */}
                <form onSubmit={handleSearch} className="relative z-10 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* 1. Runtime / Available Time */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-text-2">
                                Available Time
                            </label>
                            <select
                                value={runtimeIdx}
                                onChange={(e) => setRuntimeIdx(Number(e.target.value))}
                                className="w-full rounded-xl border border-border bg-surface-2 p-2.5 text-xs text-text focus:border-accent focus:outline-none cursor-pointer"
                            >
                                {RUNTIME_OPTIONS.map((opt, i) => (
                                    <option key={i} value={i}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 2. Genre */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-text-2">
                                Preferred Genre
                            </label>
                            <select
                                value={genreId}
                                onChange={(e) => setGenreId(e.target.value)}
                                className="w-full rounded-xl border border-border bg-surface-2 p-2.5 text-xs text-text focus:border-accent focus:outline-none cursor-pointer"
                            >
                                {GENRE_OPTIONS.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 3. Language */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-text-2">
                                Language
                            </label>
                            <select
                                value={languageCode}
                                onChange={(e) => setLanguageCode(e.target.value)}
                                className="w-full rounded-xl border border-border bg-surface-2 p-2.5 text-xs text-text focus:border-accent focus:outline-none cursor-pointer"
                            >
                                {LANGUAGE_OPTIONS.map((opt) => (
                                    <option key={opt.code} value={opt.code}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 4. Minimum Rating */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-text-2">
                                Minimum Quality
                            </label>
                            <select
                                value={minRating}
                                onChange={(e) => setMinRating(e.target.value)}
                                className="w-full rounded-xl border border-border bg-surface-2 p-2.5 text-xs text-text focus:border-accent focus:outline-none cursor-pointer"
                            >
                                {RATING_OPTIONS.map((opt) => (
                                    <option key={opt.val} value={opt.val}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        {matches && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="btn-secondary text-xs py-2.5 px-5 cursor-pointer"
                            >
                                Reset Filters
                            </button>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary text-xs py-2.5 px-6 shadow-md shadow-accent/20 cursor-pointer inline-flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">
                                {loading ? "progress_activity" : "auto_fix_high"}
                            </span>
                            <span>{loading ? "Searching Canon…" : "Find My Match"}</span>
                        </button>
                    </div>
                </form>

                {/* Match Results Showcase */}
                {error && (
                    <div className="mt-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-center text-xs text-red-400">
                        {error}
                    </div>
                )}

                {matches && (
                    <div className="mt-8 pt-8 border-t border-border/60 animate-fadeIn">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-accent">
                                Recommended For Your Viewing Window
                            </h3>
                            <span className="text-xs text-text-3 font-mono">
                                {matches.length} Matches Found
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                            {matches.map((movie) => (
                                <div
                                    key={movie.id}
                                    onClick={() => navigate(`/movies/${movie.id}`)}
                                    className="mc-card group flex flex-col justify-between p-4 cursor-pointer hover:border-accent/40"
                                >
                                    <div className="flex gap-3">
                                        <div className="w-16 h-24 shrink-0 rounded-lg overflow-hidden border border-border bg-surface-2">
                                            {movie.poster ? (
                                                <img
                                                    src={movie.poster}
                                                    alt={movie.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-text-3 text-xs">
                                                    ▣
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-1 mb-1">
                                                <h4 className="text-sm font-semibold text-text group-hover:text-accent transition-colors truncate">
                                                    {movie.title}
                                                </h4>
                                                <span className="text-xs font-mono font-bold text-accent shrink-0">
                                                    ★ {movie.rating}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-text-3 truncate">
                                                {movie.genre} · {movie.year}
                                            </p>
                                            <p className="mt-2 text-xs text-text-2 line-clamp-2 leading-relaxed">
                                                {movie.overview}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Why it matches */}
                                    <div className="mt-4 pt-3 border-t border-border/50 text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                        <span className="truncate">{movie.matchReason}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

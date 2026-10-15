import { useState, useEffect, useContext } from "react";
import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import { AuthContext } from "../../../context/AuthContext";
import useDocumentTitle from "../../../hooks/useDocumentTitle.js";
import { getDiaryStats, getAvailableDiaryYears } from "../../../services/diaryService";
import WrappedStoryModal from "../../../components/analytics/WrappedStoryModal";
import ShareablePosterCard from "../../../components/analytics/ShareablePosterCard";
import { useToast } from "../../../context/ToastContext";
import { Link } from "react-router-dom";

export default function AnalyticsWrapped() {
    useDocumentTitle("Viewing Analytics & Wrapped — Cinephile");

    const { user } = useContext(AuthContext);
    const { success } = useToast();

    const [availableYears, setAvailableYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showWrappedModal, setShowWrappedModal] = useState(false);
    const [showPosterPreview, setShowPosterPreview] = useState(false);

    useEffect(() => {
        loadYears();
    }, []);

    useEffect(() => {
        loadStats(selectedYear);
    }, [selectedYear]);

    const loadYears = async () => {
        try {
            const years = await getAvailableDiaryYears();
            const currentYear = new Date().getFullYear();
            const allYears = Array.from(new Set([currentYear, ...(years || [])])).sort((a, b) => b - a);
            setAvailableYears(allYears);
        } catch (err) {
            console.error("Failed to load years:", err);
            setAvailableYears([new Date().getFullYear()]);
        }
    };

    const loadStats = async (year) => {
        try {
            setLoading(true);
            const data = await getDiaryStats(year);
            setStats(data);
        } catch (err) {
            console.error("Failed to load stats:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyShareText = () => {
        const text = `🎬 My Cinephile ${selectedYear > 0 ? selectedYear : "All-Time"} Stats: ${stats?.totalFilmsLogged || 0} films logged (${Math.round(stats?.totalHoursWatched || 0)} hours). Persona: ${stats?.cinephilePersona?.title || "Film Buff"}!`;
        navigator.clipboard.writeText(text);
        success("Stats copied to clipboard!");
    };

    const persona = stats?.cinephilePersona || {
        title: "The Eclectic Connoisseur",
        desc: "An adventurous film buff with expansive cinematic horizons.",
        badge: "Omnivore",
        icon: "auto_awesome"
    };

    return (
        <div className="min-h-screen flex flex-col bg-bg text-text antialiased font-sans">
            <Navbar />

            <main className="page-container flex-1 py-8 sm:py-12 space-y-8">
                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="label-caps">Personal Cinema Insights</span>
                            <span className="badge badge-accent text-[10px] py-0">Analytics & Wrapped</span>
                        </div>
                        <h1 className="font-serif text-fluid-title font-bold text-text">
                            Viewing Analytics & Wrapped
                        </h1>
                        <p className="text-xs sm:text-sm text-text-3 mt-1">
                            Deep-dive into your viewing habits, watch time, decade distribution, and cinema archetype.
                        </p>
                    </div>

                    {/* Actions: Play Wrapped + Year Switcher */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Year Selector Tabs */}
                        <div className="flex items-center p-1 rounded-xl bg-surface border border-border">
                            {availableYears.map((yr) => (
                                <button
                                    key={yr}
                                    type="button"
                                    onClick={() => setSelectedYear(yr)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        selectedYear === yr
                                            ? "bg-accent text-bg shadow-sm"
                                            : "text-text-3 hover:text-text hover:bg-surface-2"
                                    }`}
                                >
                                    {yr}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => setSelectedYear(0)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                    selectedYear === 0
                                        ? "bg-accent text-bg shadow-sm"
                                        : "text-text-3 hover:text-text hover:bg-surface-2"
                                }`}
                            >
                                All-Time
                            </button>
                        </div>

                        {/* Launch Wrapped Story Button */}
                        <button
                            type="button"
                            onClick={() => setShowWrappedModal(true)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-xs font-bold shadow-lg hover:shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                            <span>Play {selectedYear > 0 ? selectedYear : ""} Wrapped</span>
                        </button>

                        {/* Export Infographic Toggle */}
                        <button
                            type="button"
                            onClick={() => setShowPosterPreview((p) => !p)}
                            className="px-3.5 py-2 rounded-xl bg-surface border border-border hover:border-accent/40 text-text-2 hover:text-accent text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="Preview Shareable Card"
                        >
                            <span className="material-symbols-outlined text-[18px]">share</span>
                            <span>{showPosterPreview ? "Hide Card" : "Share Card"}</span>
                        </button>
                    </div>
                </div>

                {/* Shareable Poster Drawer (if toggled) */}
                {showPosterPreview && (
                    <div className="p-6 rounded-3xl bg-surface-2 border border-border/80 flex flex-col md:flex-row items-center justify-between gap-8 animate-fadeIn">
                        <div className="max-w-md space-y-3">
                            <span className="badge badge-accent">Instagram Story & X Ready</span>
                            <h3 className="font-serif text-2xl font-bold text-text">
                                Share Your Cinematic Legacy
                            </h3>
                            <p className="text-xs sm:text-sm text-text-2 leading-relaxed">
                                Share your personalized viewing stats, favorite films, and cinema archetype with friends on social media.
                            </p>
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCopyShareText}
                                    className="btn-primary text-xs py-2 px-4"
                                >
                                    Copy Stats Text
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowWrappedModal(true)}
                                    className="btn-secondary text-xs py-2 px-4"
                                >
                                    Open Fullscreen Slideshow
                                </button>
                            </div>
                        </div>

                        <div className="shrink-0 scale-95 sm:scale-100">
                            <ShareablePosterCard
                                stats={stats}
                                user={user}
                                year={selectedYear}
                            />
                        </div>
                    </div>
                )}

                {/* Content Body */}
                {loading ? (
                    <div className="space-y-6">
                        <div className="stat-grid-fluid gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-32 rounded-2xl bg-surface animate-pulse" />
                            ))}
                        </div>
                        <div className="h-64 rounded-2xl bg-surface animate-pulse" />
                    </div>
                ) : !stats || stats.totalFilmsLogged === 0 ? (
                    <div className="rounded-3xl border border-border bg-surface p-12 text-center max-w-xl mx-auto space-y-4">
                        <div className="h-16 w-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mx-auto text-2xl">
                            <span className="material-symbols-outlined text-4xl">analytics</span>
                        </div>
                        <h2 className="font-serif text-2xl font-bold text-text">
                            No Logs Found for {selectedYear > 0 ? selectedYear : "This Period"}
                        </h2>
                        <p className="text-sm text-text-3">
                            Start logging your movie viewings in your Film Diary to generate your personalized Wrapped analytics and cinema archetype.
                        </p>
                        <Link to="/diary" className="btn-primary inline-flex text-xs py-2.5 px-6 no-underline">
                            Log a Film in Diary →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8 animate-fadeIn">
                        {/* 1. Hero KPI Metric Cards */}
                        <div className="stat-grid-fluid gap-4 sm:gap-6">
                            {/* Total Films */}
                            <div className="mc-card p-5 sm:p-6 relative overflow-hidden group">
                                <div className="flex items-center justify-between text-text-3 mb-2">
                                    <span className="label-caps">Total Films</span>
                                    <span className="material-symbols-outlined text-accent text-xl">movie</span>
                                </div>
                                <div className="font-serif text-3xl sm:text-4xl font-bold text-text">
                                    {stats.totalFilmsLogged}
                                </div>
                                <div className="mt-2 text-xs text-text-3 flex items-center gap-2">
                                    <span className="text-accent font-semibold">{stats.firstTimeWatches} new</span>
                                    <span>·</span>
                                    <span>{stats.totalRewatches} rewatches</span>
                                </div>
                            </div>

                            {/* Total Watch Time */}
                            <div className="mc-card p-5 sm:p-6 relative overflow-hidden group">
                                <div className="flex items-center justify-between text-text-3 mb-2">
                                    <span className="label-caps">Watch Time</span>
                                    <span className="material-symbols-outlined text-accent text-xl">schedule</span>
                                </div>
                                <div className="font-serif text-3xl sm:text-4xl font-bold text-accent">
                                    {Math.round(stats.totalHoursWatched)}<span className="text-base font-sans font-normal text-text-3 ml-1">hrs</span>
                                </div>
                                <div className="mt-2 text-xs text-text-3">
                                    ≈ <strong>{stats.totalDaysWatched}</strong> continuous 24h days
                                </div>
                            </div>

                            {/* Average Rating vs Community */}
                            <div className="mc-card p-5 sm:p-6 relative overflow-hidden group">
                                <div className="flex items-center justify-between text-text-3 mb-2">
                                    <span className="label-caps">Average Rating</span>
                                    <span className="material-symbols-outlined text-amber-400 text-xl">star</span>
                                </div>
                                <div className="font-serif text-3xl sm:text-4xl font-bold text-amber-400 flex items-baseline gap-1">
                                    <span>{stats.averageRating ? `★ ${stats.averageRating}` : "—"}</span>
                                    <span className="text-xs font-sans text-text-3 font-normal">/ 5</span>
                                </div>
                                <div className="mt-2 text-xs text-text-3">
                                    vs Cinephile community avg: <strong>{stats.communityAverageRating}★</strong>
                                </div>
                            </div>

                            {/* Persona Archetype */}
                            <div className="mc-card p-5 sm:p-6 relative overflow-hidden bg-gradient-to-br from-surface to-accent/5 border-accent/30">
                                <div className="flex items-center justify-between text-accent mb-2">
                                    <span className="label-caps text-accent">Cinema Archetype</span>
                                    <span className="material-symbols-outlined text-xl">{persona.icon || "auto_awesome"}</span>
                                </div>
                                <div className="font-serif text-lg sm:text-xl font-bold text-text truncate">
                                    {persona.title}
                                </div>
                                <p className="mt-1 text-xs text-text-3 line-clamp-2">
                                    {persona.desc}
                                </p>
                            </div>
                        </div>

                        {/* 2. Middle Row: Decade Distribution + Top Genres */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Decade Breakdown */}
                            <div className="mc-card p-6 space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-border/70">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-accent text-xl">history_edu</span>
                                        <h3 className="font-serif text-lg font-bold text-text">
                                            Decade Distribution
                                        </h3>
                                    </div>
                                    <span className="text-xs text-text-3 font-mono">Release Eras</span>
                                </div>

                                <div className="space-y-3 pt-2">
                                    {Object.entries(stats.decadeDistribution || {}).map(([decade, count]) => {
                                        const pct = stats.totalFilmsLogged > 0 ? Math.round((count * 100.0) / stats.totalFilmsLogged) : 0;
                                        return (
                                            <div key={decade} className="space-y-1">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="font-medium text-text">{decade}</span>
                                                    <span className="text-text-3 font-mono">{count} films ({pct}%)</span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-surface-2 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-500"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Top Genres Breakdown */}
                            <div className="mc-card p-6 space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-border/70">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-accent text-xl">category</span>
                                        <h3 className="font-serif text-lg font-bold text-text">
                                            Top Genres
                                        </h3>
                                    </div>
                                    <span className="text-xs text-text-3 font-mono">Cinematic DNA</span>
                                </div>

                                {stats.topGenres && stats.topGenres.length > 0 ? (
                                    <div className="space-y-3 pt-2">
                                        {stats.topGenres.map((g, i) => (
                                            <div key={g.genre} className="space-y-1">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="font-semibold text-text">
                                                        #{i + 1} {g.genre}
                                                    </span>
                                                    <span className="text-accent font-mono">{g.count} films ({g.percent}%)</span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-surface-2 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-accent transition-all duration-500"
                                                        style={{ width: `${Math.min(100, Math.max(8, g.percent || 15))}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-text-3 italic py-6 text-center">
                                        No genre metadata logged yet.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* 3. Viewing Habits & Venues + Rating Distribution */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Viewing Venues */}
                            <div className="mc-card p-6 space-y-4">
                                <div className="flex items-center gap-2 pb-3 border-b border-border/70">
                                    <span className="material-symbols-outlined text-accent text-xl">tv</span>
                                    <h3 className="font-serif text-lg font-bold text-text">
                                        Viewing Habits
                                    </h3>
                                </div>

                                {stats.topVenues && stats.topVenues.length > 0 ? (
                                    <div className="space-y-3 pt-1">
                                        {stats.topVenues.map((v) => (
                                            <div key={v.venue} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-2 border border-border/60 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-accent text-base">theaters</span>
                                                    <span className="font-semibold text-text">{v.venue}</span>
                                                </div>
                                                <span className="text-text-3 font-mono font-bold">{v.count} ({v.percent}%)</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-text-3 italic py-4 text-center">
                                        No viewing venues specified.
                                    </p>
                                )}
                            </div>

                            {/* Day of Week Habits */}
                            <div className="mc-card p-6 space-y-4">
                                <div className="flex items-center gap-2 pb-3 border-b border-border/70">
                                    <span className="material-symbols-outlined text-accent text-xl">calendar_today</span>
                                    <h3 className="font-serif text-lg font-bold text-text">
                                        Favorite Movie Days
                                    </h3>
                                </div>

                                <div className="grid grid-cols-7 gap-1 pt-2">
                                    {Object.entries(stats.dayOfWeekDistribution || {}).map(([day, count]) => {
                                        const maxCount = Math.max(1, ...Object.values(stats.dayOfWeekDistribution || {}));
                                        const heightPct = Math.min(100, Math.max(15, Math.round((count * 100) / maxCount)));
                                        return (
                                            <div key={day} className="flex flex-col items-center gap-1.5 h-32 justify-end">
                                                <span className="text-[10px] font-mono text-text-3">{count}</span>
                                                <div className="w-full max-w-[24px] rounded-t-lg bg-surface-2 overflow-hidden h-20 flex items-end">
                                                    <div
                                                        className="w-full rounded-t-lg bg-accent transition-all duration-500"
                                                        style={{ height: `${heightPct}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-bold text-text-2">{day}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Rating Distribution Histogram */}
                            <div className="mc-card p-6 space-y-4">
                                <div className="flex items-center gap-2 pb-3 border-b border-border/70">
                                    <span className="material-symbols-outlined text-amber-400 text-xl">star_rate</span>
                                    <h3 className="font-serif text-lg font-bold text-text">
                                        Rating Curve
                                    </h3>
                                </div>

                                <div className="space-y-1.5 pt-1">
                                    {Object.entries(stats.ratingDistribution || {}).map(([rating, count]) => {
                                        const maxCount = Math.max(1, ...Object.values(stats.ratingDistribution || {}));
                                        const pct = Math.round((count * 100) / maxCount);
                                        return (
                                            <div key={rating} className="flex items-center gap-2 text-xs">
                                                <span className="w-8 font-mono text-text-3">{rating}★</span>
                                                <div className="h-1.5 flex-1 rounded-full bg-surface-2 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-amber-400 transition-all duration-500"
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <span className="w-6 text-right font-mono text-text-3 text-[11px]">{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* 4. Top Rated Masterpieces Showcase */}
                        {stats.topRatedFilms && stats.topRatedFilms.length > 0 && (
                            <div className="mc-card p-6 space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-border/70">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-accent text-xl">workspace_premium</span>
                                        <h3 className="font-serif text-lg font-bold text-text">
                                            Top Rated Films & Masterpieces
                                        </h3>
                                    </div>
                                    <span className="text-xs text-text-3 font-mono">4★ & 5★ Highlights</span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 pt-2">
                                    {stats.topRatedFilms.map((film) => (
                                        <Link
                                            key={film.movieId || film.title}
                                            to={`/movies/${film.movieId}`}
                                            className="group block rounded-2xl overflow-hidden border border-border bg-surface-2 shadow-sm hover:border-accent/50 transition-all no-underline"
                                        >
                                            <div className="aspect-[2/3] w-full bg-surface-3 relative overflow-hidden">
                                                {film.poster ? (
                                                    <img
                                                        src={film.poster.startsWith("http") ? film.poster : `https://image.tmdb.org/t/p/w300${film.poster}`}
                                                        alt={film.title}
                                                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center p-2 text-xs text-text-3 text-center">
                                                        {film.title}
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                                                    <span>★</span>
                                                    <span>{Number(film.rating || 5).toFixed(1)}</span>
                                                </div>
                                            </div>
                                            <div className="p-2.5">
                                                <p className="text-xs font-bold text-text group-hover:text-accent transition-colors truncate">
                                                    {film.title}
                                                </p>
                                                <p className="text-[10px] text-text-3 font-mono mt-0.5">
                                                    {film.year}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Fullscreen Wrapped Slideshow Modal */}
            <WrappedStoryModal
                isOpen={showWrappedModal}
                onClose={() => setShowWrappedModal(false)}
                stats={stats}
                user={user}
                year={selectedYear}
            />

            <Footer />
        </div>
    );
}

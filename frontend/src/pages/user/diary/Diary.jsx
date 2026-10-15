import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import useDocumentTitle from "../../../hooks/useDocumentTitle.js";
import {
    getMyDiary,
    deleteLog,
    getAvailableDiaryYears,
    getDiaryStats
} from "../../../services/diaryService.js";
import { searchMovies } from "../../../services/movieService.js";
import LogFilmModal from "../../../components/diary/LogFilmModal.jsx";
import { useToast } from "../../../context/ToastContext.jsx";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export default function Diary() {
    useDocumentTitle("Film Diary & Activity — Cinephile");
    const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
    const [availableYears, setAvailableYears] = useState([new Date().getFullYear()]);
    const [viewMode, setViewMode] = useState("timeline"); // "timeline" | "calendar" | "stats"

    // Stats data for stats tab
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);

    // Search and Log Movie Modal states
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [selectedMovieToLog, setSelectedMovieToLog] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        loadDiary();
        loadYears();
    }, []);

    useEffect(() => {
        if (viewMode === "stats") {
            loadStats(selectedYear);
        }
    }, [viewMode, selectedYear]);

    const loadDiary = async () => {
        try {
            setLoading(true);
            const data = await getMyDiary();
            setLogs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load diary entries:", err);
        } finally {
            setLoading(false);
        }
    };

    const loadYears = async () => {
        try {
            const years = await getAvailableDiaryYears();
            if (Array.isArray(years) && years.length > 0) {
                setAvailableYears(years);
            }
        } catch (err) {
            console.error("Failed to load diary years:", err);
        }
    };

    const loadStats = async (year) => {
        try {
            setStatsLoading(true);
            const data = await getDiaryStats(year);
            setStats(data);
        } catch (err) {
            console.error("Failed to load diary stats:", err);
        } finally {
            setStatsLoading(false);
        }
    };

    const handleDelete = async (logId, title) => {
        if (!window.confirm(`Remove "${title}" from your Film Diary?`)) return;
        try {
            await deleteLog(logId);
            setLogs((prev) => prev.filter((l) => l.id !== logId));
            toastInfo(`Removed "${title}" from diary.`);
        } catch (err) {
            console.error("Failed to delete diary log:", err);
            toastError("Failed to delete entry.");
        }
    };

    // Filter logs for selected year
    const yearLogs = useMemo(() => {
        return logs.filter((log) => {
            if (!log.watchedDate) return true;
            const logYear = new Date(log.watchedDate).getFullYear();
            return logYear === Number(selectedYear);
        });
    }, [logs, selectedYear]);

    // Group logs by month
    const groupedByMonth = useMemo(() => {
        const groups = {};
        for (let i = 0; i < 12; i++) groups[i] = [];

        yearLogs.forEach((log) => {
            if (log.watchedDate) {
                const d = new Date(log.watchedDate);
                const month = d.getMonth();
                if (!groups[month]) groups[month] = [];
                groups[month].push(log);
            }
        });

        // Filter out empty months and return sorted list (latest month first)
        return Object.keys(groups)
            .map((m) => ({
                monthIndex: parseInt(m),
                monthName: MONTHS[parseInt(m)],
                entries: groups[m]
            }))
            .filter((g) => g.entries.length > 0)
            .sort((a, b) => b.monthIndex - a.monthIndex);
    }, [yearLogs]);

    // Movie search handler for logging films
    useEffect(() => {
        const q = searchQuery.trim();
        if (!q) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                setIsSearching(true);
                const res = await searchMovies(q);
                const results = Array.isArray(res) ? res : res?.results || [];
                setSearchResults(results.slice(0, 10));
            } catch (err) {
                console.error("Search error in diary:", err);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 250);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    return (
        <div className="min-h-screen bg-bg text-text antialiased font-sans flex flex-col relative">
            <Navbar />

            <main className="page-container flex-1 py-8 sm:py-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <span className="label-caps mb-1">Personal Film Journal</span>
                        <h1 className="font-serif text-fluid-title font-bold text-text">
                            Film Diary
                        </h1>
                        <p className="text-xs sm:text-sm text-text-3 mt-1">
                            A chronological record of every motion picture you've experienced.
                        </p>
                    </div>

                    {/* Quick Log Action & View Switchers */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Year Selector */}
                        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5">
                            <span className="text-xs font-semibold text-text-3">Year:</span>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                className="bg-transparent text-xs font-bold text-accent outline-none cursor-pointer"
                            >
                                {availableYears.map((yr) => (
                                    <option key={yr} value={yr} className="bg-surface text-text">
                                        {yr}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* View Switchers */}
                        <div className="flex rounded-xl border border-border bg-surface p-1">
                            <button
                                type="button"
                                onClick={() => setViewMode("timeline")}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                                    viewMode === "timeline" ? "bg-accent text-bg font-bold shadow-sm" : "text-text-2 hover:text-text"
                                }`}
                            >
                                <span className="material-symbols-outlined text-[16px]">view_timeline</span>
                                <span>Diary</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode("stats")}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                                    viewMode === "stats" ? "bg-accent text-bg font-bold shadow-sm" : "text-text-2 hover:text-text"
                                }`}
                            >
                                <span className="material-symbols-outlined text-[16px]">analytics</span>
                                <span>Stats & Wrapped</span>
                            </button>
                        </div>

                        {/* Log Film Trigger */}
                        <button
                            type="button"
                            onClick={() => setIsSearchOpen(true)}
                            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            <span>Log Film</span>
                        </button>
                    </div>
                </div>

                {/* Search / Pick Movie to Log Banner */}
                {isSearchOpen && (
                    <div className="mb-8 rounded-2xl border border-accent/40 bg-surface p-6 shadow-xl animate-fade-in relative">
                        <button
                            type="button"
                            onClick={() => {
                                setIsSearchOpen(false);
                                setSearchQuery("");
                                setSearchResults([]);
                            }}
                            className="absolute top-4 right-4 rounded-lg p-1 text-text-3 hover:text-text cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                        <h3 className="font-serif text-lg font-bold text-text mb-2">
                            Select a Film to Log
                        </h3>
                        <p className="text-xs text-text-3 mb-4">
                            Search any movie by title from TMDB to record your watch date, venue, and rating.
                        </p>

                        <div className="relative max-w-lg mb-4">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-text-3">
                                search
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search title (e.g. Oppenheimer, Dune, Parasite)..."
                                className="w-full rounded-xl border border-border bg-surface-2 pl-9 pr-4 py-2.5 text-sm text-text outline-none focus:border-accent"
                                autoFocus
                            />
                        </div>

                        {isSearching ? (
                            <div className="flex items-center gap-2 text-xs text-text-3 py-3">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                                <span>Searching films...</span>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {searchResults.map((film) => (
                                    <button
                                        key={film.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedMovieToLog(film);
                                            setIsLogModalOpen(true);
                                            setIsSearchOpen(false);
                                            setSearchQuery("");
                                            setSearchResults([]);
                                        }}
                                        className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-surface-2 hover:border-accent hover:bg-surface text-left transition-colors cursor-pointer group"
                                    >
                                        <div className="h-14 w-10 shrink-0 rounded bg-surface border border-border overflow-hidden">
                                            {film.poster_path ? (
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w200${film.poster_path}`}
                                                    alt={film.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-[10px] text-text-3">
                                                    No Img
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-text truncate group-hover:text-accent">
                                                {film.title}
                                            </p>
                                            <p className="text-[11px] text-text-3">
                                                {film.release_date?.substring(0, 4) || "N/A"}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : searchQuery.trim() ? (
                            <p className="text-xs text-text-3 py-2">No films found matching "{searchQuery}"</p>
                        ) : null}
                    </div>
                )}

                {/* TAB 1: TIMELINE / DIARY LOG */}
                {viewMode === "timeline" && (
                    <>
                        {loading ? (
                            <div className="flex min-h-[40vh] items-center justify-center">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="h-9 w-9 animate-spin rounded-full border-3 border-border border-t-accent" />
                                    <p className="text-xs text-text-3">Loading diary logs...</p>
                                </div>
                            </div>
                        ) : yearLogs.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-12 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-4">
                                    <span className="material-symbols-outlined text-[32px]">calendar_month</span>
                                </div>
                                <h3 className="font-serif text-xl font-bold text-text mb-1">
                                    No Films Logged in {selectedYear}
                                </h3>
                                <p className="text-xs sm:text-sm text-text-3 max-w-md mx-auto mb-6">
                                    Keep track of what you watch, where you watched it, and how you felt with your personal Letterboxd-style film journal.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setIsSearchOpen(true)}
                                    className="btn-primary text-xs py-2.5 px-6 shadow-md cursor-pointer inline-flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    <span>Log Your First Film</span>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-10">
                                {groupedByMonth.map((group) => (
                                    <section key={group.monthName} className="space-y-4">
                                        <div className="flex items-center gap-3 border-b border-border pb-2">
                                            <h2 className="font-serif text-xl font-bold text-text">
                                                {group.monthName} {selectedYear}
                                            </h2>
                                            <span className="badge badge-accent text-[11px]">
                                                {group.entries.length} {group.entries.length === 1 ? "film" : "films"}
                                            </span>
                                        </div>

                                        <div className="divide-y divide-border/60 rounded-2xl border border-border bg-surface overflow-hidden">
                                            {group.entries.map((entry) => {
                                                const d = entry.watchedDate ? new Date(entry.watchedDate) : new Date();
                                                const dayNumber = d.getDate();
                                                const dayName = d.toLocaleDateString("en-US", { weekday: "short" });

                                                return (
                                                    <div
                                                        key={entry.id}
                                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-surface-2/60 transition-colors"
                                                    >
                                                        {/* Left: Date + Poster + Details */}
                                                        <div className="flex items-center gap-4 min-w-0">
                                                            {/* Day Badge */}
                                                            <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-surface-2 border border-border shrink-0 text-center">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-text-3 leading-none">
                                                                    {dayName}
                                                                </span>
                                                                <span className="text-base font-bold text-accent font-mono leading-none mt-0.5">
                                                                    {dayNumber}
                                                                </span>
                                                            </div>

                                                            {/* Poster */}
                                                            <Link
                                                                to={`/movies/${entry.movieId}`}
                                                                className="h-16 w-11 shrink-0 rounded-lg bg-surface border border-border overflow-hidden shadow-sm hover:opacity-90 transition-opacity"
                                                            >
                                                                {entry.poster ? (
                                                                    <img
                                                                        src={entry.poster}
                                                                        alt={entry.title}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center text-[10px] text-text-3">
                                                                        Film
                                                                    </div>
                                                                )}
                                                            </Link>

                                                            {/* Title & Metadata */}
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <Link
                                                                        to={`/movies/${entry.movieId}`}
                                                                        className="font-serif text-sm sm:text-base font-bold text-text hover:text-accent transition-colors no-underline truncate"
                                                                    >
                                                                        {entry.title}
                                                                    </Link>
                                                                    {entry.year && (
                                                                        <span className="text-xs text-text-3 font-mono">
                                                                            ({entry.year})
                                                                        </span>
                                                                    )}
                                                                    {entry.isRewatch && (
                                                                        <span
                                                                            className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-bold text-accent"
                                                                            title="Rewatch"
                                                                        >
                                                                            🔁 Rewatch
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Venue & Rating Details */}
                                                                <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-text-3">
                                                                    {entry.venueOrPlatform && (
                                                                        <span className="inline-flex items-center gap-1 rounded-md bg-surface-2 border border-border px-2 py-0.5 text-[11px] text-text-2">
                                                                            <span className="material-symbols-outlined text-[13px]">
                                                                                videocam
                                                                            </span>
                                                                            {entry.venueOrPlatform}
                                                                        </span>
                                                                    )}

                                                                    {entry.runtime && (
                                                                        <span>{entry.runtime} min</span>
                                                                    )}

                                                                    {entry.director && (
                                                                        <span>Dir: {entry.director}</span>
                                                                    )}
                                                                </div>

                                                                {/* Notes */}
                                                                {entry.reviewNotes && (
                                                                    <p className="mt-2 text-xs text-text-2 italic line-clamp-2">
                                                                        "{entry.reviewNotes}"
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Right: Star Rating & Delete Action */}
                                                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-16 sm:pl-0">
                                                            {entry.rating ? (
                                                                <div className="flex items-center gap-1 text-accent font-bold text-sm">
                                                                    <span className="material-symbols-outlined text-[18px]">star</span>
                                                                    <span>{Number(entry.rating).toFixed(1)}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-text-3 font-mono">Unrated</span>
                                                            )}

                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(entry.id, entry.title)}
                                                                className="rounded-lg p-1.5 text-text-3 hover:bg-rose-500/10 hover:text-rose-400 cursor-pointer transition-colors"
                                                                title="Delete diary entry"
                                                            >
                                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </section>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* TAB 2: YEAR IN REVIEW / STATS */}
                {viewMode === "stats" && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Wrapped Promotion Banner */}
                        <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-r from-accent/15 via-surface to-accent/10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-elevated">
                            <div className="space-y-1 z-10">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-accent text-2xl animate-spin-slow">auto_awesome</span>
                                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent">
                                        Experience Cinephile Wrapped
                                    </span>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-serif font-bold text-text">
                                    Your {selectedYear} Cinema Retrospective
                                </h2>
                                <p className="text-xs sm:text-sm text-text-2 max-w-xl">
                                    Explore your cinematic persona, decade distribution charts, format breakdowns, and generate shareable story cards.
                                </p>
                            </div>
                            <Link
                                to={`/wrapped?year=${selectedYear}`}
                                className="z-10 btn-primary py-2.5 px-5 flex items-center gap-2 text-xs font-bold shrink-0 shadow-lg"
                            >
                                <span className="material-symbols-outlined text-base">play_circle</span>
                                <span>Launch {selectedYear} Wrapped</span>
                            </Link>
                            {/* Decorative background glow */}
                            <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
                        </div>

                        {statsLoading ? (
                            <div className="flex min-h-[40vh] items-center justify-center">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="h-9 w-9 animate-spin rounded-full border-3 border-border border-t-accent" />
                                    <p className="text-xs text-text-3">Calculating Year in Review...</p>
                                </div>
                            </div>
                        ) : stats ? (
                            <>
                                {/* Stats Highlights Grid */}
                                <div className="stat-grid-fluid gap-4">
                                    <div className="rounded-2xl border border-border bg-surface p-5 text-center shadow-sm">
                                        <span className="material-symbols-outlined text-2xl text-accent mb-1">movie</span>
                                        <span className="block text-3xl font-serif font-bold text-text">
                                            {stats.totalFilmsLogged}
                                        </span>
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-3">
                                            Films Logged ({selectedYear})
                                        </span>
                                    </div>

                                    <div className="rounded-2xl border border-border bg-surface p-5 text-center shadow-sm">
                                        <span className="material-symbols-outlined text-2xl text-accent mb-1">schedule</span>
                                        <span className="block text-3xl font-serif font-bold text-accent">
                                            {stats.totalHoursWatched}h
                                        </span>
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-3">
                                            Hours Watched
                                        </span>
                                    </div>

                                    <div className="rounded-2xl border border-border bg-surface p-5 text-center shadow-sm">
                                        <span className="material-symbols-outlined text-2xl text-accent mb-1">sync</span>
                                        <span className="block text-3xl font-serif font-bold text-text">
                                            {stats.totalRewatches}
                                        </span>
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-3">
                                            Rewatches
                                        </span>
                                    </div>

                                    <div className="rounded-2xl border border-border bg-surface p-5 text-center shadow-sm">
                                        <span className="material-symbols-outlined text-2xl text-accent mb-1">star</span>
                                        <span className="block text-3xl font-serif font-bold text-text">
                                            {stats.averageRating ? `${stats.averageRating} ★` : "—"}
                                        </span>
                                        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-3">
                                            Average Rating
                                        </span>
                                    </div>
                                </div>

                                {/* Rating Histogram & Monthly Activity */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    {/* Rating Distribution Histogram */}
                                    <div className="lg:col-span-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
                                        <h3 className="font-serif text-lg font-bold text-text mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-accent">bar_chart</span>
                                            <span>Rating Distribution</span>
                                        </h3>

                                        <div className="space-y-2 pt-2">
                                            {stats.ratingDistribution &&
                                                Object.entries(stats.ratingDistribution).map(([star, count]) => {
                                                    const max = Math.max(...Object.values(stats.ratingDistribution), 1);
                                                    const pct = Math.round((count / max) * 100);

                                                    return (
                                                        <div key={star} className="flex items-center gap-3 text-xs">
                                                            <span className="w-12 text-right font-mono text-text-3">
                                                                {star} ★
                                                            </span>
                                                            <div className="flex-1 h-5 rounded-md bg-surface-2 overflow-hidden relative">
                                                                <div
                                                                    className="h-full bg-accent/80 transition-all duration-500 rounded-md"
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                            </div>
                                                            <span className="w-6 font-mono text-text font-semibold">
                                                                {count}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>

                                    {/* Monthly Activity Bars */}
                                    <div className="lg:col-span-6 rounded-2xl border border-border bg-surface p-6 shadow-sm flex flex-col justify-between">
                                        <h3 className="font-serif text-lg font-bold text-text mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-accent">calendar_month</span>
                                            <span>Monthly Activity Breakdown</span>
                                        </h3>

                                        <div className="grid grid-cols-12 gap-1 items-end h-44 pt-6">
                                            {stats.monthlyActivity?.map((m) => {
                                                const maxCount = Math.max(...stats.monthlyActivity.map((x) => x.count), 1);
                                                const heightPct = Math.round((m.count / maxCount) * 100);

                                                return (
                                                    <div key={m.month} className="flex flex-col items-center gap-1.5 h-full justify-end">
                                                        <span className="text-[10px] font-mono font-bold text-text">
                                                            {m.count > 0 ? m.count : ""}
                                                        </span>
                                                        <div
                                                            className="w-full bg-accent/70 hover:bg-accent rounded-t transition-all duration-300"
                                                            style={{ height: `${Math.max(heightPct, 4)}%` }}
                                                            title={`${m.month}: ${m.count} films`}
                                                        />
                                                        <span className="text-[10px] font-mono text-text-3">
                                                            {m.month}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Top Genres & Top Directors */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Top Genres */}
                                    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                                        <h3 className="font-serif text-lg font-bold text-text mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-accent">category</span>
                                            <span>Most Watched Genres</span>
                                        </h3>
                                        {stats.topGenres?.length > 0 ? (
                                            <div className="space-y-3">
                                                {stats.topGenres.map((g, idx) => (
                                                    <div key={g.genre} className="flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-2 text-[10px] font-bold text-text-3">
                                                                {idx + 1}
                                                            </span>
                                                            <span className="font-semibold text-text">{g.genre}</span>
                                                        </div>
                                                        <span className="badge badge-accent text-[10px]">
                                                            {g.count} films
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-text-3">No genre data available for {selectedYear}</p>
                                        )}
                                    </div>

                                    {/* Top Directors */}
                                    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
                                        <h3 className="font-serif text-lg font-bold text-text mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-accent">movie_creation</span>
                                            <span>Most Watched Directors</span>
                                        </h3>
                                        {stats.topDirectors?.length > 0 ? (
                                            <div className="space-y-3">
                                                {stats.topDirectors.map((d, idx) => (
                                                    <div key={d.director} className="flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-2 text-[10px] font-bold text-text-3">
                                                                {idx + 1}
                                                            </span>
                                                            <span className="font-semibold text-text">{d.director}</span>
                                                        </div>
                                                        <span className="rounded-lg bg-surface-2 border border-border px-2.5 py-0.5 text-[11px] text-text-2 font-mono">
                                                            {d.count} {d.count === 1 ? "film" : "films"}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-text-3">Log films with director info to see stats</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : null}
                    </div>
                )}
            </main>

            {/* Modal to Log Selected Movie */}
            <LogFilmModal
                isOpen={isLogModalOpen}
                onClose={() => setIsLogModalOpen(false)}
                movie={selectedMovieToLog}
                onLogged={() => {
                    loadDiary();
                    loadYears();
                }}
            />

            {/* Floating Action Button for Quick Logging on Bottom Right */}
            <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-bg shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-accent/30 cursor-pointer focus:outline-none"
                title="Log a film to diary"
                aria-label="Log a film"
            >
                <span className="material-symbols-outlined text-[28px]">
                    edit_calendar
                </span>
            </button>

            <Footer />
        </div>
    );
}

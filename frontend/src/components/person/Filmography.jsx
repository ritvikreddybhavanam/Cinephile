import { useMemo, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { getWatchedMovies, addWatchedMovie, removeWatchedMovie } from "../../services/movieService.js";
import { addToWatchlist, getWatchlist } from "../../services/watchlistService.js";

function Filmography({ credits, personName = "Artist" }) {
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const { success, info, error: toastError } = useToast();

    const [filter, setFilter] = useState("all");
    const [sort, setSort] = useState("newest");
    const [viewMode, setViewMode] = useState("grid");
    const [watchedFilter, setWatchedFilter] = useState("all"); // "all" | "watched" | "unwatched"

    // Watched & Watchlist tracking maps
    const [watchedMovieIds, setWatchedMovieIds] = useState(new Set());
    const [watchlistMovieIds, setWatchlistMovieIds] = useState(new Set());
    const [loadingUserData, setLoadingUserData] = useState(false);
    const [batchAdding, setBatchAdding] = useState(false);

    // Fetch user's watched and watchlist history on mount
    useEffect(() => {
        if (!token) return;

        const loadUserHistory = async () => {
            try {
                setLoadingUserData(true);
                const [watchedList, watchlist] = await Promise.allSettled([
                    getWatchedMovies(),
                    getWatchlist()
                ]);

                if (watchedList.status === "fulfilled" && Array.isArray(watchedList.value)) {
                    setWatchedMovieIds(new Set(watchedList.value.map((m) => Number(m.movieId || m.id))));
                }

                if (watchlist.status === "fulfilled" && Array.isArray(watchlist.value)) {
                    setWatchlistMovieIds(new Set(watchlist.value.map((m) => Number(m.movieId || m.id))));
                }
            } catch (err) {
                console.error("Failed to load user watched history in Filmography:", err);
            } finally {
                setLoadingUserData(false);
            }
        };

        loadUserHistory();
    }, [token]);

    const films = useMemo(() => {
        const cast = (credits?.cast || []).map((movie) => ({
            ...movie,
            roles: ["acting"],
            roleLabels: movie.character ? [`as ${movie.character}`] : ["Actor"]
        }));

        const crew = (credits?.crew || []).map((movie) => {
            const roles = [];

            if (movie.job === "Director") {
                roles.push("directing");
            }

            if (
                movie.department === "Writing" ||
                movie.job === "Writer" ||
                movie.job === "Screenplay" ||
                movie.job === "Story"
            ) {
                roles.push("writing");
            }

            if (
                movie.department === "Production" ||
                movie.job?.toLowerCase().includes("producer")
            ) {
                roles.push("producing");
            }

            return {
                ...movie,
                roles,
                roleLabels: movie.job ? [movie.job] : []
            };
        });

        const movieMap = new Map();

        cast.forEach((movie) => {
            if (!movie?.id) return;
            movieMap.set(movie.id, {
                ...movie,
                roles: ["acting"],
                roleLabels: movie.roleLabels || []
            });
        });

        crew.forEach((movie) => {
            if (!movie?.id) return;
            if (!movieMap.has(movie.id)) {
                movieMap.set(movie.id, {
                    ...movie,
                    roles: [...movie.roles],
                    roleLabels: movie.roleLabels || []
                });
            } else {
                const existing = movieMap.get(movie.id);
                movie.roles.forEach((r) => {
                    if (!existing.roles.includes(r)) existing.roles.push(r);
                });
                if (movie.job && !existing.roleLabels.includes(movie.job)) {
                    existing.roleLabels.push(movie.job);
                }
            }
        });

        return Array.from(movieMap.values());
    }, [credits]);

    // Role-filtered films for mastery calculation (e.g. if director filter is picked)
    const baseRoleFilms = useMemo(() => {
        if (filter === "all") return films;
        return films.filter((m) => m.roles?.includes(filter));
    }, [films, filter]);

    // Calculate Completion / Mastery Statistics
    const masteryStats = useMemo(() => {
        const total = baseRoleFilms.length;
        if (total === 0) return { total: 0, watched: 0, percent: 0, badge: "Novice", unwatchedList: [] };

        const watchedFilmsList = baseRoleFilms.filter((m) => watchedMovieIds.has(Number(m.id)));
        const unwatchedList = baseRoleFilms.filter((m) => !watchedMovieIds.has(Number(m.id)));
        const watched = watchedFilmsList.length;
        const percent = Math.round((watched / total) * 100);

        let badge = "Novice";
        let badgeColor = "text-text-3 border-border bg-surface-2";
        if (percent === 100) {
            badge = "👑 100% Completionist Master";
            badgeColor = "text-amber-300 border-amber-400/50 bg-amber-400/15";
        } else if (percent >= 75) {
            badge = "🏆 Filmography Connoisseur";
            badgeColor = "text-indigo-300 border-indigo-400/50 bg-indigo-500/15";
        } else if (percent >= 50) {
            badge = "⭐ Halfway Dedicated";
            badgeColor = "text-emerald-300 border-emerald-400/50 bg-emerald-500/15";
        } else if (percent >= 25) {
            badge = "🍿 Getting Started";
            badgeColor = "text-cyan-300 border-cyan-400/50 bg-cyan-500/15";
        }

        return { total, watched, percent, badge, badgeColor, unwatchedList };
    }, [baseRoleFilms, watchedMovieIds]);

    // Toggle Watched Status on a single movie
    const handleToggleWatched = async (e, movie) => {
        e.stopPropagation();
        if (!token) {
            navigate("/login");
            return;
        }

        const mId = Number(movie.id);
        const isCurrentlyWatched = watchedMovieIds.has(mId);

        try {
            if (isCurrentlyWatched) {
                await removeWatchedMovie(mId);
                setWatchedMovieIds((prev) => {
                    const next = new Set(prev);
                    next.delete(mId);
                    return next;
                });
                info(`Marked "${movie.title || movie.name}" as unwatched.`);
            } else {
                await addWatchedMovie({
                    movieId: mId,
                    title: movie.title || movie.name,
                    poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
                    year: movie.release_date ? parseInt(movie.release_date.slice(0, 4)) : null
                });
                setWatchedMovieIds((prev) => new Set(prev).add(mId));
                success(`Marked "${movie.title || movie.name}" as watched!`);
            }
        } catch (err) {
            toastError("Failed to update watched status");
        }
    };

    // 1-Click "Add All Unwatched to Watchlist"
    const handleAddAllUnwatchedToWatchlist = async () => {
        if (!token) {
            navigate("/login");
            return;
        }

        const toAdd = masteryStats.unwatchedList.filter(
            (m) => !watchlistMovieIds.has(Number(m.id))
        );

        if (toAdd.length === 0) {
            info("All unwatched films are already on your watchlist or watched!");
            return;
        }

        try {
            setBatchAdding(true);
            await Promise.all(
                toAdd.map((m) =>
                    addToWatchlist({
                        id: m.id,
                        title: m.title || m.name,
                        poster_path: m.poster_path
                    }).catch(() => {})
                )
            );

            setWatchlistMovieIds((prev) => {
                const next = new Set(prev);
                toAdd.forEach((m) => next.add(Number(m.id)));
                return next;
            });

            success(`Added ${toAdd.length} unwatched films to your Watchlist!`);
        } catch (err) {
            toastError("Failed to batch add films to watchlist");
        } finally {
            setBatchAdding(false);
        }
    };

    // Filter & Sort Films
    const filteredFilms = useMemo(() => {
        let result = baseRoleFilms;

        if (watchedFilter === "watched") {
            result = result.filter((m) => watchedMovieIds.has(Number(m.id)));
        } else if (watchedFilter === "unwatched") {
            result = result.filter((m) => !watchedMovieIds.has(Number(m.id)));
        }

        return [...result].sort((a, b) => {
            const dateA = a.release_date || a.first_air_date || "";
            const dateB = b.release_date || b.first_air_date || "";

            if (sort === "newest") return dateB.localeCompare(dateA);
            if (sort === "oldest") return dateA.localeCompare(dateB);
            if (sort === "rating") return (b.vote_average || 0) - (a.vote_average || 0);
            if (sort === "title") return (a.title || a.name || "").localeCompare(b.title || b.name || "");
            return 0;
        });
    }, [baseRoleFilms, watchedFilter, sort, watchedMovieIds]);

    return (
        <section className="lg:col-span-8 flex flex-col space-y-6">
            {/* ========================================================= */}
            {/* 🏆 FILMOGRAPHY MASTERY & COMPLETION TRACKER CARD */}
            {/* ========================================================= */}
            <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-r from-surface via-surface-2 to-surface p-6 sm:p-7 shadow-elevated">
                {/* Ambient Glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    {/* Left Stats & Progress Circle */}
                    <div className="flex items-center gap-5">
                        {/* Circular Progress Ring */}
                        <div className="relative h-20 w-20 shrink-0 flex items-center justify-center">
                            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                {/* Background circle */}
                                <path
                                    className="text-surface-2 stroke-current"
                                    strokeWidth="3.5"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                                {/* Progress circle */}
                                <path
                                    className="text-accent stroke-current transition-all duration-700 ease-out"
                                    strokeDasharray={`${masteryStats.percent}, 100`}
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    fill="none"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-base font-black font-mono text-text">
                                    {masteryStats.percent}%
                                </span>
                            </div>
                        </div>

                        {/* Text Metadata */}
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="label-caps text-accent flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">workspace_premium</span>
                                    <span>Filmography Mastery</span>
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono ${masteryStats.badgeColor}`}>
                                    {masteryStats.badge}
                                </span>
                            </div>
                            <h3 className="font-serif text-2xl font-bold text-text">
                                {masteryStats.watched} of {masteryStats.total} Films Watched
                            </h3>
                            <p className="text-xs text-text-3">
                                {masteryStats.percent === 100
                                    ? `Incredible! You have completed 100% of ${personName}'s filmography!`
                                    : `Track your journey to completing ${personName}'s entire body of work.`}
                            </p>
                        </div>
                    </div>

                    {/* 1-Click Action Button: Add Unwatched to Watchlist */}
                    {masteryStats.unwatchedList.length > 0 && (
                        <button
                            type="button"
                            onClick={handleAddAllUnwatchedToWatchlist}
                            disabled={batchAdding}
                            className="btn-primary py-2.5 px-4 text-xs font-bold shrink-0 flex items-center gap-2 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all"
                            title="Add all unwatched films to your personal watchlist"
                        >
                            <span className="material-symbols-outlined text-base">
                                {batchAdding ? "sync" : "playlist_add"}
                            </span>
                            <span>
                                {batchAdding
                                    ? "Adding to Watchlist..."
                                    : `Queue ${masteryStats.unwatchedList.length} Unwatched`}
                            </span>
                        </button>
                    )}
                </div>
            </div>

            {/* Header & Controls Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="font-serif text-2xl font-bold text-text">
                        Filmography ({filteredFilms.length})
                    </h2>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Watched Status Filter Pills */}
                    <div className="flex rounded-xl border border-border bg-surface p-1">
                        <button
                            type="button"
                            onClick={() => setWatchedFilter("all")}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                watchedFilter === "all" ? "bg-accent text-bg shadow-sm" : "text-text-3 hover:text-text"
                            }`}
                        >
                            All ({baseRoleFilms.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setWatchedFilter("unwatched")}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                watchedFilter === "unwatched" ? "bg-accent text-bg shadow-sm" : "text-text-3 hover:text-text"
                            }`}
                        >
                            Unwatched ({masteryStats.unwatchedList.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setWatchedFilter("watched")}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                watchedFilter === "watched" ? "bg-accent text-bg shadow-sm" : "text-text-3 hover:text-text"
                            }`}
                        >
                            Watched ({masteryStats.watched})
                        </button>
                    </div>

                    {/* View Switcher */}
                    <div className="flex items-center rounded-xl border border-border bg-surface p-1">
                        <button
                            type="button"
                            onClick={() => setViewMode("grid")}
                            className={`p-1.5 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                viewMode === "grid" ? "bg-accent text-bg" : "text-text-3 hover:text-text"
                            }`}
                            title="Grid View"
                        >
                            <span className="material-symbols-outlined text-[17px]">grid_view</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("list")}
                            className={`p-1.5 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                viewMode === "list" ? "bg-accent text-bg" : "text-text-3 hover:text-text"
                            }`}
                            title="List View"
                        >
                            <span className="material-symbols-outlined text-[17px]">format_list_bulleted</span>
                        </button>
                    </div>

                    {/* Sort Selector */}
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="bg-surface px-3 py-1.5 rounded-xl text-text text-xs outline-none border border-border cursor-pointer font-semibold"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="rating">Highest Rated</option>
                        <option value="title">Title (A-Z)</option>
                    </select>
                </div>
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                    ["all", "All Credits"],
                    ["directing", "Directing"],
                    ["writing", "Writing"],
                    ["producing", "Producing"],
                    ["acting", "Acting"]
                ].map(([value, label]) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => setFilter(value)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer border ${
                            filter === value
                                ? "bg-accent text-bg border-accent shadow-sm"
                                : "bg-surface text-text-2 border-border hover:bg-surface-2 hover:text-text"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* ========================================================= */}
            {/* FILM LIST / GRID WITH EYE ICON & CHECKLIST */}
            {/* ========================================================= */}
            {filteredFilms.length === 0 ? (
                <div className="text-center py-12 text-text-3 bg-surface rounded-2xl border border-border space-y-2">
                    <span className="material-symbols-outlined text-4xl opacity-50 block">movie_off</span>
                    <p className="text-sm font-semibold">No films found matching this filter.</p>
                </div>
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredFilms.map((movie) => {
                        const title = movie.title || movie.name;
                        const date = movie.release_date || movie.first_air_date || "";
                        const year = date.substring(0, 4);
                        const isWatched = watchedMovieIds.has(Number(movie.id));

                        return (
                            <div
                                key={movie.id}
                                onClick={() => movie.media_type !== "tv" && navigate(`/movies/${movie.id}`)}
                                className="group relative rounded-2xl overflow-hidden bg-surface border border-border hover:border-accent/50 transition-all duration-300 flex flex-col shadow-card hover:shadow-card-hover cursor-pointer"
                            >
                                {/* Poster Container */}
                                <div className="relative aspect-[2/3] w-full bg-surface-2 overflow-hidden">
                                    {movie.poster_path ? (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                                            alt={title}
                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-text-3 text-xs p-2 text-center">
                                            {title}
                                        </div>
                                    )}

                                    {/* Watched Checklist Badge (Interactive Eye Icon) */}
                                    <button
                                        type="button"
                                        onClick={(e) => handleToggleWatched(e, movie)}
                                        className={`absolute top-2.5 left-2.5 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-md cursor-pointer shadow-md ${
                                            isWatched
                                                ? "bg-accent text-bg font-bold scale-105"
                                                : "bg-black/60 text-white/70 hover:text-white hover:bg-black/80 border border-white/20"
                                        }`}
                                        title={isWatched ? "Watched (Click to unmark)" : "Mark as Watched"}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">
                                            {isWatched ? "check" : "visibility"}
                                        </span>
                                    </button>

                                    {/* Star Rating Badge */}
                                    {movie.vote_average > 0 && (
                                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-black/75 backdrop-blur-md text-accent text-[11px] font-bold font-mono border border-accent/30 shadow-md">
                                            ★ {Number(movie.vote_average).toFixed(1)}
                                        </div>
                                    )}
                                </div>

                                {/* Movie Card Info */}
                                <div className="p-3 flex flex-col justify-between flex-1 space-y-1">
                                    <h4 className="text-xs font-bold text-text truncate group-hover:text-accent transition-colors font-serif">
                                        {title}
                                    </h4>
                                    <div className="flex items-center justify-between text-[11px] text-text-3 font-mono">
                                        <span>{year || "—"}</span>
                                        <span className={isWatched ? "text-accent font-bold" : "text-text-3"}>
                                            {isWatched ? "Watched ✓" : "Unwatched"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* LIST VIEW WITH CHECKLIST CONTROLS */
                <div className="space-y-2.5">
                    {filteredFilms.map((movie) => {
                        const title = movie.title || movie.name;
                        const date = movie.release_date || movie.first_air_date || "";
                        const year = date.substring(0, 4);
                        const isWatched = watchedMovieIds.has(Number(movie.id));
                        const roleText = movie.roleLabels?.join(" • ") || movie.character || movie.job || "Credit";

                        return (
                            <div
                                key={movie.id}
                                onClick={() => movie.media_type !== "tv" && navigate(`/movies/${movie.id}`)}
                                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                                    isWatched
                                        ? "bg-surface border-accent/30"
                                        : "bg-surface border-border hover:border-accent/40"
                                }`}
                            >
                                <div className="flex items-center gap-3.5 min-w-0">
                                    {/* Interactive Checklist Button */}
                                    <button
                                        type="button"
                                        onClick={(e) => handleToggleWatched(e, movie)}
                                        className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                                            isWatched
                                                ? "bg-accent text-bg shadow-sm"
                                                : "bg-surface-2 border border-border text-text-3 hover:text-text hover:border-accent"
                                        }`}
                                        title={isWatched ? "Watched (Click to unmark)" : "Mark as Watched"}
                                    >
                                        <span className="material-symbols-outlined text-[19px]">
                                            {isWatched ? "check" : "visibility"}
                                        </span>
                                    </button>

                                    {/* Thumbnail */}
                                    <div className="h-12 w-8 rounded-lg overflow-hidden bg-surface-2 shrink-0 border border-border">
                                        {movie.poster_path ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                                                alt={title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-text-3 text-[10px]">
                                                Film
                                            </div>
                                        )}
                                    </div>

                                    {/* Title & Metadata */}
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-text truncate hover:text-accent font-serif">
                                            {title}
                                        </p>
                                        <p className="text-xs text-text-3 truncate mt-0.5">
                                            {roleText} {year ? `• ${year}` : ""}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 shrink-0">
                                    {movie.vote_average > 0 && (
                                        <span className="text-xs font-mono font-bold text-accent">
                                            ★ {Number(movie.vote_average).toFixed(1)}
                                        </span>
                                    )}
                                    <span className="material-symbols-outlined text-text-3 text-lg">
                                        chevron_right
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default Filmography;
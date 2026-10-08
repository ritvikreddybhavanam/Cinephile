import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar.jsx";
import Footer from "../../../components/layout/Footer.jsx";
import {
    getWatchedMovies,
    removeFromWatched
} from "../../../services/watchedMovieService.js";

function WatchedFilms() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionMsg, setActionMsg] = useState("");

    // Search & Filter States
    const [search, setSearch] = useState("");
    const [ratingFilter, setRatingFilter] = useState("All");
    const [decadeFilter, setDecadeFilter] = useState("All");
    const [genreFilter, setGenreFilter] = useState("All");
    const [sortBy, setSortBy] = useState("Recently Added");
    const [currentPage, setCurrentPage] = useState(1);
    const [denseView, setDenseView] = useState(false);

    const moviesPerPage = denseView ? 72 : 48;

    useEffect(() => {
        loadWatchedMovies();
    }, []);

    const loadWatchedMovies = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getWatchedMovies();
            setMovies(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load watched movies:", err);
            setError("Unable to load your watched films. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (e, movieId, title) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await removeFromWatched(movieId);
            setMovies((prev) => prev.filter((m) => (m.movieId || m.id) !== movieId));
            setActionMsg(`Removed "${title}" from watched films.`);
            setTimeout(() => setActionMsg(""), 3000);
        } catch (err) {
            console.error("Failed to remove movie:", err);
            setError("Failed to remove movie. Please try again.");
        }
    };

    // Calculate unique genres & decades from the user's movie list
    const availableGenres = useMemo(() => {
        const set = new Set();
        movies.forEach((m) => {
            if (m.genre) {
                m.genre.split(",").forEach((g) => {
                    const trimmed = g.trim();
                    if (trimmed) set.add(trimmed);
                });
            }
        });
        return Array.from(set).sort();
    }, [movies]);

    const availableDecades = useMemo(() => {
        const set = new Set();
        movies.forEach((m) => {
            if (m.year) {
                const dec = Math.floor(m.year / 10) * 10;
                set.add(`${dec}s`);
            }
        });
        return Array.from(set).sort().reverse();
    }, [movies]);

    // Summary Stats
    const stats = useMemo(() => {
        const total = movies.length;
        const ratedMovies = movies.filter((m) => m.rating != null && m.rating > 0);
        const avgRating = ratedMovies.length > 0
            ? (ratedMovies.reduce((acc, m) => acc + Number(m.rating), 0) / ratedMovies.length).toFixed(1)
            : "—";
        const currentYear = new Date().getFullYear();
        const thisYearCount = movies.filter((m) => m.year === currentYear).length;

        return { total, avgRating, thisYearCount };
    }, [movies]);

    // Filtering & Sorting
    const filteredMovies = useMemo(() => {
        let result = [...movies];

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter((m) => m.title && m.title.toLowerCase().includes(q));
        }

        if (ratingFilter !== "All") {
            const minRating = Number(ratingFilter);
            result = result.filter((m) => Number(m.rating || 0) >= minRating);
        }

        if (decadeFilter !== "All") {
            result = result.filter((m) => {
                if (!m.year) return false;
                const decade = Math.floor(m.year / 10) * 10;
                return `${decade}s` === decadeFilter;
            });
        }

        if (genreFilter !== "All") {
            result = result.filter((m) => m.genre && m.genre.toLowerCase().includes(genreFilter.toLowerCase()));
        }

        if (sortBy === "Release Date (Newest)") {
            result.sort((a, b) => (b.year || 0) - (a.year || 0));
        } else if (sortBy === "Release Date (Oldest)") {
            result.sort((a, b) => (a.year || 0) - (b.year || 0));
        } else if (sortBy === "Highest Rating") {
            result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sortBy === "Title (A-Z)") {
            result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        } else {
            // "Recently Added" - default order by id desc or index
            result.sort((a, b) => (b.id || 0) - (a.id || 0));
        }

        return result;
    }, [movies, search, ratingFilter, decadeFilter, genreFilter, sortBy]);

    const totalPages = Math.max(1, Math.ceil(filteredMovies.length / moviesPerPage));
    const startIndex = (currentPage - 1) * moviesPerPage;
    const displayedMovies = filteredMovies.slice(startIndex, startIndex + moviesPerPage);

    const resetPage = () => setCurrentPage(1);

    const clearFilters = () => {
        setSearch("");
        setRatingFilter("All");
        setDecadeFilter("All");
        setGenreFilter("All");
        setSortBy("Recently Added");
        resetPage();
    };

    const hasActiveFilters = search || ratingFilter !== "All" || decadeFilter !== "All" || genreFilter !== "All" || sortBy !== "Recently Added";

    return (
        <div className="bg-bg text-text min-h-screen flex flex-col font-sans antialiased">
            <Navbar />

            <main className="flex-1 w-full max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

                {/* Top Banner & Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-border pb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 text-accent">
                                <span className="material-symbols-outlined text-[18px]">
                                    visibility
                                </span>
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-accent">
                                Personal Cinema Archive
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-text">
                            Watched Films
                        </h1>
                        <p className="text-xs sm:text-sm text-text-3 mt-1.5 max-w-xl">
                            All the movies you have logged, watched, and reviewed on Cinephile.
                        </p>
                    </div>

                    {/* Quick Stats & Migration Link */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border">
                            <span className="material-symbols-outlined text-[20px] text-accent">
                                movie
                            </span>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-text-3 leading-none">Total Watched</p>
                                <p className="text-sm font-bold text-text leading-tight mt-0.5">{stats.total} Films</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface border border-border">
                            <span className="material-symbols-outlined text-[20px] text-accent">
                                star
                            </span>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-text-3 leading-none">Avg Rating</p>
                                <p className="text-sm font-bold text-text leading-tight mt-0.5">{stats.avgRating} / 10</p>
                            </div>
                        </div>

                        <Link
                            to="/data-migration"
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent/10 border border-accent/30 text-accent text-xs font-semibold hover:bg-accent hover:text-bg transition-all no-underline"
                            title="Import from Letterboxd"
                        >
                            <span className="material-symbols-outlined text-[18px]">
                                sync_alt
                            </span>
                            <span>Import Data</span>
                        </Link>
                    </div>
                </div>

                {/* Notifications & Error alerts */}
                {actionMsg && (
                    <div className="mb-6 flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-xs sm:text-sm text-accent font-medium animate-fadeIn">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        <span>{actionMsg}</span>
                    </div>
                )}

                {error && (
                    <div className="mb-6 flex items-center gap-2 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-xs sm:text-sm text-error font-medium animate-fadeIn">
                        <span className="material-symbols-outlined text-[18px]">error</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Filter Toolbar with Clean Spacing & Margins */}
                <div className="mb-8 rounded-2xl bg-surface border border-border p-4 sm:p-5 shadow-sm space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md">
                            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-text-3">
                                search
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    resetPage();
                                }}
                                placeholder="Search watched films by title..."
                                className="w-full rounded-full bg-surface-2 border border-border py-2 pl-10 pr-9 text-xs sm:text-sm text-text placeholder:text-text-3 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch("");
                                        resetPage();
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[16px]">close</span>
                                </button>
                            )}
                        </div>

                        {/* View Mode Toggle + Clear Filters */}
                        <div className="flex items-center gap-2 self-end lg:self-auto">
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-2 border border-border text-xs font-semibold text-accent hover:bg-accent/15 transition-colors cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                                    <span>Reset Filters</span>
                                </button>
                            )}

                            <div className="flex items-center rounded-xl bg-surface-2 border border-border p-0.5">
                                <button
                                    type="button"
                                    onClick={() => setDenseView(false)}
                                    title="Standard Grid"
                                    className={`flex items-center justify-center h-8 w-8 rounded-lg text-xs transition-colors cursor-pointer ${
                                        !denseView ? "bg-accent text-bg font-bold shadow-xs" : "text-text-3 hover:text-text"
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">grid_view</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDenseView(true)}
                                    title="Dense Grid"
                                    className={`flex items-center justify-center h-8 w-8 rounded-lg text-xs transition-colors cursor-pointer ${
                                        denseView ? "bg-accent text-bg font-bold shadow-xs" : "text-text-3 hover:text-text"
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">view_module</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filter Dropdowns Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-2 border-t border-border/60">
                        {/* Rating Filter */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-text-3 mb-1">
                                Rating
                            </label>
                            <select
                                value={ratingFilter}
                                onChange={(e) => {
                                    setRatingFilter(e.target.value);
                                    resetPage();
                                }}
                                className="w-full rounded-xl bg-surface-2 border border-border px-3 py-2 text-xs font-medium text-text focus:outline-none focus:border-accent cursor-pointer"
                            >
                                <option value="All">All Ratings</option>
                                <option value="9">9+ Rating</option>
                                <option value="8">8+ Rating</option>
                                <option value="7">7+ Rating</option>
                                <option value="6">6+ Rating</option>
                                <option value="5">5+ Rating</option>
                            </select>
                        </div>

                        {/* Decade Filter */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-text-3 mb-1">
                                Decade
                            </label>
                            <select
                                value={decadeFilter}
                                onChange={(e) => {
                                    setDecadeFilter(e.target.value);
                                    resetPage();
                                }}
                                className="w-full rounded-xl bg-surface-2 border border-border px-3 py-2 text-xs font-medium text-text focus:outline-none focus:border-accent cursor-pointer"
                            >
                                <option value="All">All Decades</option>
                                {availableDecades.map((dec) => (
                                    <option key={dec} value={dec}>{dec}</option>
                                ))}
                            </select>
                        </div>

                        {/* Genre Filter */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-text-3 mb-1">
                                Genre
                            </label>
                            <select
                                value={genreFilter}
                                onChange={(e) => {
                                    setGenreFilter(e.target.value);
                                    resetPage();
                                }}
                                className="w-full rounded-xl bg-surface-2 border border-border px-3 py-2 text-xs font-medium text-text focus:outline-none focus:border-accent cursor-pointer"
                            >
                                <option value="All">All Genres</option>
                                {availableGenres.map((genre) => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort By Filter */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-text-3 mb-1">
                                Sort Order
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value);
                                    resetPage();
                                }}
                                className="w-full rounded-xl bg-surface-2 border border-border px-3 py-2 text-xs font-medium text-text focus:outline-none focus:border-accent cursor-pointer"
                            >
                                <option value="Recently Added">Recently Logged</option>
                                <option value="Release Date (Newest)">Release Date (Newest)</option>
                                <option value="Release Date (Oldest)">Release Date (Oldest)</option>
                                <option value="Highest Rating">Highest Rating</option>
                                <option value="Title (A-Z)">Title (A-Z)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                {loading ? (
                    <div className="flex min-h-[380px] flex-col items-center justify-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-accent animate-spin">
                            progress_activity
                        </span>
                        <p className="text-xs sm:text-sm font-semibold text-text-2 tracking-wide">
                            Loading your watched films archive...
                        </p>
                    </div>
                ) : displayedMovies.length === 0 ? (
                    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface/50 p-8 text-center animate-fadeIn">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15 text-accent mb-4">
                            <span className="material-symbols-outlined text-3xl">
                                movie_filter
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-text">
                            {hasActiveFilters ? "No matching films found" : "No watched films yet"}
                        </h3>
                        <p className="text-xs sm:text-sm text-text-3 max-w-md mt-1 mb-6">
                            {hasActiveFilters
                                ? "Try adjusting or clearing your filters to see more films."
                                : "Log movies you have watched or import your Letterboxd CSV to build your personal cinema archive."}
                        </p>
                        {hasActiveFilters ? (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="px-4 py-2 rounded-full bg-accent text-bg font-bold text-xs hover:bg-accent-hover transition-colors cursor-pointer"
                            >
                                Clear All Filters
                            </button>
                        ) : (
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                <Link
                                    to="/movies"
                                    className="px-4 py-2 rounded-full bg-accent text-bg font-bold text-xs hover:bg-accent-hover transition-colors no-underline"
                                >
                                    Browse Films
                                </Link>
                                <Link
                                    to="/data-migration"
                                    className="px-4 py-2 rounded-full bg-surface-2 border border-border text-accent font-bold text-xs hover:border-accent transition-colors no-underline"
                                >
                                    Import from Letterboxd
                                </Link>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Film Grid with Smaller Compact Cards & Hover Effects */}
                        <div
                            className={`grid gap-2 sm:gap-2.5 md:gap-3 pb-8 ${
                                denseView
                                    ? "grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-14"
                                    : "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-9"
                            }`}
                        >
                            {displayedMovies.map((movie) => {
                                const movieId = movie.movieId || movie.id;
                                const title = movie.title || "Untitled Film";
                                const poster = movie.poster;
                                const year = movie.year;
                                const rating = movie.rating != null ? Number(movie.rating) : null;

                                return (
                                    <div
                                        key={movie.id || movieId}
                                        className="group relative flex flex-col rounded-xl bg-surface border border-border overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-accent/60 hover:shadow-card"
                                    >
                                        {/* Movie Poster & Hover Overlay */}
                                        <Link
                                            to={`/movies/${movieId}`}
                                            className="relative aspect-[2/3] w-full bg-surface-2 overflow-hidden block"
                                        >
                                            {poster ? (
                                                <img
                                                    src={poster}
                                                    alt={title}
                                                    loading="lazy"
                                                    className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center bg-surface-2">
                                                    <span className="material-symbols-outlined text-xl text-text-3 mb-0.5">
                                                        movie
                                                    </span>
                                                    <span className="text-[10px] font-bold text-text-2 line-clamp-2">
                                                        {title}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Gradient overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

                                            {/* Rating Badge (Top Left) */}
                                            {rating != null && rating > 0 && (
                                                <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 rounded bg-black/80 backdrop-blur-xs px-1 py-0.2 text-[9px] font-bold text-accent border border-accent/30 shadow-xs">
                                                    <span className="material-symbols-outlined text-[10px] fill-current">
                                                        star
                                                    </span>
                                                    <span>{rating.toFixed(1)}</span>
                                                </div>
                                            )}

                                            {/* Quick Delete / Unwatch Button (Top Right on Hover) */}
                                            <button
                                                type="button"
                                                onClick={(e) => handleRemove(e, movieId, title)}
                                                title="Remove from watched films"
                                                className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/85 backdrop-blur-xs text-text-3 hover:text-error hover:bg-error/20 border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-150 cursor-pointer shadow-xs"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">
                                                    delete
                                                </span>
                                            </button>
                                        </Link>

                                        {/* Info Footer */}
                                        <div className="flex flex-col p-1.5 sm:p-2">
                                            <Link
                                                to={`/movies/${movieId}`}
                                                className="text-[11px] sm:text-xs font-semibold text-text truncate group-hover:text-accent transition-colors no-underline"
                                                title={title}
                                            >
                                                {title}
                                            </Link>

                                            <div className="flex items-center justify-between text-[10px] text-text-3 mt-0.5">
                                                <span>{year || "—"}</span>
                                                {movie.genre && (
                                                    <span className="truncate max-w-[65px] text-[9px] uppercase font-bold text-accent/80">
                                                        {movie.genre.split(",")[0]}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination Bar */}
                        {filteredMovies.length > moviesPerPage && (
                            <nav
                                aria-label="Watched films pagination"
                                className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-6 pb-12"
                            >
                                <p className="text-xs font-medium text-text-3">
                                    Showing <strong className="text-text">{startIndex + 1}–{Math.min(startIndex + moviesPerPage, filteredMovies.length)}</strong> of <strong className="text-text">{filteredMovies.length}</strong> films
                                </p>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        disabled={currentPage === 1}
                                        onClick={() => {
                                            setCurrentPage((p) => Math.max(1, p - 1));
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        }}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-semibold text-text-2 hover:bg-surface-2 hover:text-accent disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                                        <span>Previous</span>
                                    </button>

                                    <div className="flex items-center gap-1 px-2 text-xs font-semibold text-text-2">
                                        <span>Page</span>
                                        <span className="rounded bg-accent/15 px-2 py-0.5 text-accent font-bold border border-accent/20">
                                            {currentPage}
                                        </span>
                                        <span>of {totalPages}</span>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={currentPage === totalPages}
                                        onClick={() => {
                                            setCurrentPage((p) => Math.min(totalPages, p + 1));
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        }}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-semibold text-text-2 hover:bg-surface-2 hover:text-accent disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                                    >
                                        <span>Next</span>
                                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                    </button>
                                </div>
                            </nav>
                        )}
                    </>
                )}

            </main>

            <Footer />
        </div>
    );
}

export default WatchedFilms;
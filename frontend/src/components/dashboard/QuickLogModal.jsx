import { useState, useEffect, useRef } from "react";
import { searchMovies, getPosterUrl } from "../../services/movieService.js";
import { logFilm } from "../../services/diaryService.js";

const VENUES = [
    "Cinema / Theater",
    "Netflix",
    "Prime Video",
    "Disney+ / Hotstar",
    "Max",
    "Apple TV+",
    "Criterion Channel",
    "Physical 4K/Blu-ray",
    "Film Festival",
    "Other / Streaming"
];

export default function QuickLogModal({ isOpen, onClose, onLogged }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);

    const [watchedDate, setWatchedDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [rating, setRating] = useState(4.0);
    const [isRewatch, setIsRewatch] = useState(false);
    const [venue, setVenue] = useState("Cinema / Theater");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const searchInputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setSearchQuery("");
            setSearchResults([]);
            setSelectedMovie(null);
            setWatchedDate(new Date().toISOString().split("T")[0]);
            setRating(4.0);
            setIsRewatch(false);
            setVenue("Cinema / Theater");
            setNotes("");
            setErrorMsg("");
            setTimeout(() => searchInputRef.current?.focus(), 150);
        }
    }, [isOpen]);

    // Debounced search
    useEffect(() => {
        if (!searchQuery.trim() || selectedMovie) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await searchMovies(searchQuery.trim());
                setSearchResults(res?.results || []);
            } catch (err) {
                console.error("Failed to search movies:", err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, selectedMovie]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMovie) {
            setErrorMsg("Please select a movie to log.");
            return;
        }

        try {
            setSubmitting(true);
            setErrorMsg("");

            const genres = Array.isArray(selectedMovie.genre_ids)
                ? selectedMovie.genre_ids.join(", ")
                : selectedMovie.genre || "Film";

            const payload = {
                movieId: selectedMovie.id,
                title: selectedMovie.title || selectedMovie.name,
                poster: selectedMovie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`
                    : null,
                year: selectedMovie.release_date
                    ? parseInt(selectedMovie.release_date.substring(0, 4))
                    : null,
                genre: genres,
                rating: Number(rating),
                watchedDate,
                rewatch: Boolean(isRewatch),
                venue,
                notes: notes.trim() || null,
            };

            await logFilm(payload);
            if (onLogged) onLogged();
            onClose();
        } catch (err) {
            console.error("Failed to log film:", err);
            setErrorMsg("Failed to save film log. Please ensure you are logged in.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Log a Film"
        >
            <div
                className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface-2/60">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-accent text-[22px]">
                            edit_calendar
                        </span>
                        <h3 className="font-serif text-lg font-semibold text-text">
                            Log a Film to Your Diary
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1 text-text-3 hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
                        aria-label="Close modal"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                    {errorMsg && (
                        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
                            {errorMsg}
                        </div>
                    )}

                    {/* Movie Selector / Search */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-2 mb-1.5">
                            Film Title *
                        </label>
                        {!selectedMovie ? (
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-3 text-[18px]">
                                    search
                                </span>
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by title (e.g. Dune, Parasite, Seven)..."
                                    className="mc-input pl-10 pr-9 text-sm"
                                    required
                                />
                                {isSearching && (
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-accent text-[18px] animate-spin">
                                        progress_activity
                                    </span>
                                )}

                                {/* Search Dropdown */}
                                {searchResults.length > 0 && (
                                    <div className="absolute left-0 right-0 top-full mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-border bg-surface-2 shadow-2xl z-20 divide-y divide-border/60">
                                        {searchResults.slice(0, 6).map((movie) => {
                                            const poster = getPosterUrl(movie.poster_path);
                                            const year = movie.release_date ? movie.release_date.slice(0, 4) : "";
                                            return (
                                                <button
                                                    key={movie.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedMovie(movie);
                                                        setSearchResults([]);
                                                    }}
                                                    className="w-full flex items-center gap-3 p-2.5 text-left hover:bg-surface transition-colors cursor-pointer"
                                                >
                                                    <div className="h-12 w-8 shrink-0 overflow-hidden rounded bg-surface">
                                                        {poster ? (
                                                            <img src={poster} alt={movie.title} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-text-3 text-xs">
                                                                ▣
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-semibold text-text truncate">
                                                            {movie.title}
                                                        </div>
                                                        <div className="text-[10px] text-text-3">
                                                            {year ? `${year} · ` : ""}★ {movie.vote_average ? Number(movie.vote_average).toFixed(1) : "N/A"}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between rounded-xl border border-accent/40 bg-accent/5 p-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-12 w-8 shrink-0 overflow-hidden rounded border border-border">
                                        {selectedMovie.poster_path ? (
                                            <img
                                                src={getPosterUrl(selectedMovie.poster_path)}
                                                alt={selectedMovie.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-surface-2" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-serif text-sm font-semibold text-text truncate">
                                            {selectedMovie.title}
                                        </div>
                                        <div className="text-[11px] text-text-3">
                                            {selectedMovie.release_date?.slice(0, 4)}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedMovie(null)}
                                    className="text-xs text-accent hover:underline font-medium shrink-0 ml-2"
                                >
                                    Change
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Date and Rating */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-text-2 mb-1.5">
                                Watched Date
                            </label>
                            <input
                                type="date"
                                value={watchedDate}
                                onChange={(e) => setWatchedDate(e.target.value)}
                                className="mc-input text-xs"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-text-2 mb-1.5">
                                Rating (0.5 – 5.0)
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    min="0.5"
                                    max="5.0"
                                    step="0.5"
                                    value={rating}
                                    onChange={(e) => setRating(parseFloat(e.target.value))}
                                    className="w-full accent-accent cursor-pointer"
                                />
                                <span className="font-mono text-xs font-bold text-accent min-w-[36px]">
                                    ★ {Number(rating).toFixed(1)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Venue & Rewatch */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-text-2 mb-1.5">
                                Viewing Venue / Service
                            </label>
                            <select
                                value={venue}
                                onChange={(e) => setVenue(e.target.value)}
                                className="mc-input text-xs"
                            >
                                {VENUES.map((v) => (
                                    <option key={v} value={v} className="bg-surface text-text">
                                        {v}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center sm:pt-6">
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-text-2">
                                <input
                                    type="checkbox"
                                    checked={isRewatch}
                                    onChange={(e) => setIsRewatch(e.target.checked)}
                                    className="rounded border-border accent-accent h-4 w-4"
                                />
                                <span>I&apos;ve seen this film before (Rewatch)</span>
                            </label>
                        </div>
                    </div>

                    {/* Diary Notes */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-2 mb-1.5">
                            Private Diary Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add brief thoughts, who you watched it with, format (IMAX, 35mm), or memories..."
                            rows={3}
                            className="mc-input text-xs resize-none"
                        />
                    </div>

                    {/* Submit Actions */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-ghost text-xs py-2 px-4"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !selectedMovie}
                            className="btn-primary text-xs py-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Saving Log…" : "Save Film Log"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

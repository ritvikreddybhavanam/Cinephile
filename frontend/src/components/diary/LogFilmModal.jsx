import { useState, useEffect } from "react";
import { logFilm } from "../../services/diaryService.js";
import { useToast } from "../../context/ToastContext.jsx";

const VENUES = [
    { label: "Cinema / Theater", value: "Cinema", icon: "theater_comedy" },
    { label: "Netflix", value: "Netflix", icon: "play_circle" },
    { label: "Prime Video", value: "Prime Video", icon: "movie" },
    { label: "Disney+", value: "Disney+", icon: "stars" },
    { label: "HBO / Max", value: "Max", icon: "tv" },
    { label: "Apple TV+", value: "Apple TV+", icon: "tv_gen" },
    { label: "Criterion Channel", value: "Criterion", icon: "palette" },
    { label: "Physical (4K/Blu-ray)", value: "Physical Media", icon: "album" },
    { label: "Film Festival", value: "Film Festival", icon: "festival" },
    { label: "Other / Streaming", value: "Streaming", icon: "stream" }
];

export default function LogFilmModal({ isOpen, onClose, movie, onLogged }) {
    const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();

    const [watchedDate, setWatchedDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [rating, setRating] = useState(4.0);
    const [isRewatch, setIsRewatch] = useState(false);
    const [venue, setVenue] = useState("Cinema");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setWatchedDate(new Date().toISOString().split("T")[0]);
            setNotes("");
            setIsRewatch(false);
            setRating(4.0);
        }
    }, [isOpen]);

    if (!isOpen || !movie) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
            toastWarning("Please login to log films in your diary.");
            return;
        }

        try {
            setSubmitting(true);

            const genres = Array.isArray(movie.genres)
                ? movie.genres.map((g) => (typeof g === "string" ? g : g.name)).join(", ")
                : movie.genre || "";

            const director = movie.credits?.crew?.find((c) => c.job === "Director")?.name || movie.director || "";

            const logPayload = {
                movieId: movie.id,
                title: movie.title || movie.name,
                poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : movie.poster || "",
                year: movie.release_date ? parseInt(movie.release_date.substring(0, 4)) : movie.year || null,
                genre: genres,
                runtime: movie.runtime || 110,
                rating: Number(rating),
                watchedDate,
                isRewatch,
                venueOrPlatform: venue,
                reviewNotes: notes.trim(),
                director
            };

            const result = await logFilm(logPayload);
            toastSuccess(`Logged "${movie.title || movie.name}" in your Film Diary!`);
            if (onLogged) onLogged(result);
            onClose();
        } catch (err) {
            console.error("Failed to log film:", err);
            const msg = err.response?.data?.message || err.response?.data || "Failed to log film to diary.";
            toastError(typeof msg === "string" ? msg : JSON.stringify(msg));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                            <span className="material-symbols-outlined text-[22px]">edit_calendar</span>
                        </div>
                        <div>
                            <h3 className="font-serif text-lg font-bold text-text">
                                Log to Film Diary
                            </h3>
                            <p className="text-xs text-text-3">
                                {movie.title || movie.name} {movie.release_date && `(${movie.release_date.substring(0, 4)})`}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-text-3 hover:bg-surface-2 hover:text-text cursor-pointer transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                    {/* Date Watched & Rewatch */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-text-3 mb-1.5">
                                Watched Date
                            </label>
                            <input
                                type="date"
                                value={watchedDate}
                                onChange={(e) => setWatchedDate(e.target.value)}
                                className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-text outline-none focus:border-accent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-text-3 mb-1.5">
                                Viewing Type
                            </label>
                            <button
                                type="button"
                                onClick={() => setIsRewatch(!isRewatch)}
                                className={`w-full flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors cursor-pointer ${
                                    isRewatch
                                        ? "border-accent bg-accent/15 text-accent"
                                        : "border-border bg-surface-2 text-text-2 hover:border-slate-600"
                                }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">
                                    {isRewatch ? "sync" : "visibility"}
                                </span>
                                <span>{isRewatch ? "Rewatch (🔁)" : "First Time Watching"}</span>
                            </button>
                        </div>
                    </div>

                    {/* Rating Slider / Stars */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-text-3">
                                Rating
                            </label>
                            <span className="text-sm font-bold text-accent flex items-center gap-1">
                                <span className="material-symbols-outlined text-[18px]">star</span>
                                {rating.toFixed(1)} / 5.0
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0.5"
                            max="5.0"
                            step="0.5"
                            value={rating}
                            onChange={(e) => setRating(parseFloat(e.target.value))}
                            className="w-full accent-accent cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-text-3 font-mono mt-1">
                            <span>0.5 ★</span>
                            <span>2.5 ★</span>
                            <span>5.0 ★</span>
                        </div>
                    </div>

                    {/* Venue / Platform Selector */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-3 mb-2">
                            Where Did You Watch It?
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {VENUES.map((v) => (
                                <button
                                    key={v.value}
                                    type="button"
                                    onClick={() => setVenue(v.value)}
                                    className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs text-left transition-all cursor-pointer ${
                                        venue === v.value
                                            ? "border-accent bg-accent/10 text-accent font-semibold shadow-sm"
                                            : "border-border bg-surface-2 text-text-2 hover:border-slate-600"
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[16px] shrink-0">
                                        {v.icon}
                                    </span>
                                    <span className="truncate">{v.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Short Diary Notes */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-text-3 mb-1.5">
                            Diary Notes / Thoughts (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder="Add brief thoughts, audience reaction, or personal memo..."
                            className="w-full rounded-xl border border-border bg-surface-2 p-3 text-sm text-text outline-none focus:border-accent resize-none placeholder:text-text-3"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center justify-end gap-3 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary text-xs py-2 px-6 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-bg border-t-transparent" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[16px]">bookmark_add</span>
                                    <span>Log Entry</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

import { Link } from "react-router-dom";
import RatingStars from "../common/RatingStars.jsx";

export default function DiaryRecentSection({
    diaryEntries = [],
    loading = false,
    onOpenLogModal,
}) {
    return (
        <section className="space-y-4">
            <div className="section-header">
                <div>
                    <h3 className="section-title">Film Diary & Recently Watched</h3>
                    <p className="mt-0.5 text-xs text-text-3">
                        Chronological record of movies you have experienced
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onOpenLogModal}
                        className="btn-primary text-xs py-1.5 px-3.5 inline-flex items-center gap-1.5"
                    >
                        <span className="material-symbols-outlined text-[15px]">add</span>
                        <span>Log a Film</span>
                    </button>
                    <Link to="/diary" className="section-link">
                        <span>Full Diary</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-24 w-full skeleton rounded-xl" />
                    ))}
                </div>
            ) : diaryEntries.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {diaryEntries.slice(0, 6).map((log) => {
                        const dateFormatted = log.watchedDate
                            ? new Date(log.watchedDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                              })
                            : null;

                        return (
                            <Link
                                key={log.id}
                                to={log.movieId ? `/movies/${log.movieId}` : "/diary"}
                                className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-2.5 transition-all duration-200 hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-card no-underline"
                            >
                                <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md border border-border/80 bg-surface-2">
                                    {log.poster ? (
                                        <img
                                            src={log.poster}
                                            alt={log.title}
                                            loading="lazy"
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-text-3">
                                            <span className="material-symbols-outlined text-sm opacity-40">
                                                movie
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-serif text-xs font-semibold text-text group-hover:text-accent transition-colors truncate">
                                        {log.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        {log.rating != null && (
                                            <RatingStars rating={log.rating} />
                                        )}
                                        {log.rewatch && (
                                            <span className="material-symbols-outlined text-[13px] text-accent" title="Rewatch">
                                                replay
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-text-3 font-mono">
                                        {dateFormatted && <span>{dateFormatted}</span>}
                                        {log.venue && (
                                            <>
                                                <span>·</span>
                                                <span className="truncate max-w-[80px]">{log.venue}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-border bg-surface/50 p-6 text-center">
                    <p className="text-sm text-text-2 mb-1">Your film diary is clean and empty.</p>
                    <p className="text-xs text-text-3 mb-3">
                        Track what you watch without writing a full review. Log watch dates, venues, and ratings.
                    </p>
                    <button
                        type="button"
                        onClick={onOpenLogModal}
                        className="btn-primary text-xs py-1.5 px-4 inline-flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-[15px]">add</span>
                        Log Your First Movie
                    </button>
                </div>
            )}
        </section>
    );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import RatingStars from "../common/RatingStars.jsx";

export default function RecentActivityList({ activities = [], loading = false }) {
    const [visibleCount, setVisibleCount] = useState(3);

    const visibleItems = activities.slice(0, visibleCount);
    const hasMore = activities.length > visibleCount;

    return (
        <section className="space-y-4">
            <div className="section-header">
                <div>
                    <h3 className="section-title">Recent Activity</h3>
                    <p className="mt-0.5 text-xs text-text-3">
                        Your latest ratings, reviews, diary logs, and watchlist entries
                    </p>
                </div>
                <Link to="/myreviews" className="section-link">
                    <span>View all</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="h-28 w-full skeleton rounded-xl" />
                    ))}
                </div>
            ) : activities.length > 0 ? (
                <div className="space-y-3">
                    {visibleItems.map((item) => {
                        const isReview = item.type === "REVIEW" || !!item.content;
                        const isDiary = item.type === "DIARY" || !!item.watchedDate;
                        const isWatchlist = item.type === "WATCHLIST";

                        const badgeText = isReview
                            ? "Reviewed"
                            : isDiary
                            ? "Logged"
                            : isWatchlist
                            ? "Watchlist"
                            : "Watched";

                        const badgeColor = isReview
                            ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                            : isDiary
                            ? "border-accent/30 bg-accent/10 text-accent"
                            : isWatchlist
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : "border-sky-500/30 bg-sky-500/10 text-sky-400";

                        const posterUrl = item.poster || item.moviePoster || null;
                        const title = item.title || item.movieTitle || "Untitled Movie";
                        const movieId = item.movieId;
                        const date = item.watchedDate || item.date || item.createdAt;
                        const formattedDate = date
                            ? new Date(date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                              })
                            : null;

                        const textExcerpt = item.content || item.notes || item.reviewText || null;
                        const rating = item.rating;

                        return (
                            <article
                                key={item.id || `${movieId}-${date}`}
                                className="group flex flex-col sm:flex-row gap-4 rounded-xl border border-border bg-surface p-4 transition-all duration-200 hover:border-accent/40 hover:shadow-card"
                            >
                                {/* Movie Thumbnail */}
                                <Link
                                    to={movieId ? `/movies/${movieId}` : "#"}
                                    className="relative h-32 sm:h-28 w-20 sm:w-20 shrink-0 overflow-hidden rounded-lg border border-border/80 bg-surface-2"
                                >
                                    {posterUrl ? (
                                        <img
                                            src={posterUrl}
                                            alt={title}
                                            loading="lazy"
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-text-3">
                                            <span className="material-symbols-outlined text-xl opacity-40">
                                                movie
                                            </span>
                                        </div>
                                    )}
                                </Link>

                                {/* Activity Details */}
                                <div className="flex flex-1 flex-col justify-between min-w-0">
                                    <div>
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Link
                                                    to={movieId ? `/movies/${movieId}` : "#"}
                                                    className="font-serif text-base font-semibold text-text hover:text-accent transition-colors truncate"
                                                >
                                                    {title}
                                                </Link>
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${badgeColor}`}
                                                >
                                                    {badgeText}
                                                </span>
                                            </div>
                                            {formattedDate && (
                                                <span className="text-[11px] text-text-3 font-mono">
                                                    {formattedDate}
                                                </span>
                                            )}
                                        </div>

                                        {/* Personal Rating */}
                                        {rating != null && (
                                            <div className="mb-2 flex items-center gap-1.5">
                                                <RatingStars rating={rating} />
                                                <span className="text-xs font-semibold text-accent font-mono">
                                                    {Number(rating).toFixed(1)}/5
                                                </span>
                                                {item.rewatch && (
                                                    <span className="inline-flex items-center gap-0.5 text-[10px] text-accent/80 font-mono">
                                                        <span className="material-symbols-outlined text-[12px]">replay</span>
                                                        Rewatch
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Review Excerpt */}
                                        {textExcerpt && (
                                            <p className="text-xs text-text-2 italic line-clamp-2 leading-relaxed">
                                                &ldquo;{textExcerpt}&rdquo;
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Footers */}
                                    <div className="mt-2.5 flex items-center gap-3 pt-2 border-t border-border/40 text-[11px] text-text-3">
                                        {movieId && (
                                            <Link
                                                to={`/movies/${movieId}`}
                                                className="hover:text-accent transition-colors inline-flex items-center gap-1"
                                            >
                                                <span>View Film</span>
                                                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                                            </Link>
                                        )}
                                        {item.id && isReview && (
                                            <Link
                                                to={`/myreviews`}
                                                className="hover:text-accent transition-colors inline-flex items-center gap-1 text-text-3"
                                            >
                                                <span>Full Review</span>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}

                    {/* Load More Button */}
                    {hasMore && (
                        <div className="pt-2 text-center">
                            <button
                                type="button"
                                onClick={() => setVisibleCount((prev) => prev + 4)}
                                className="btn-secondary text-xs py-2 px-5 inline-flex items-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-[16px]">expand_more</span>
                                Load More Activities
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-border bg-surface/50 p-6 text-center">
                    <p className="text-sm text-text-2 mb-1">No activities logged yet.</p>
                    <p className="text-xs text-text-3 mb-3">
                        Films you watch, rate, review, or add to your watchlist will appear here in chronological order.
                    </p>
                    <Link to="/movies" className="btn-secondary text-xs py-1.5 px-4 inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">explore</span>
                        Explore Films to Log
                    </Link>
                </div>
            )}
        </section>
    );
}

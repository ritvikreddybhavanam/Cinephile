import { Link, useNavigate } from "react-router-dom";
import Icon from "../common/Icon";

export default function CommunityReviewsSection({ reviews = [], loading = false }) {
    const navigate = useNavigate();

    return (
        <section className="page-container" aria-label="Community Reviews and Journal Entries">
            <div className="section-header">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-accent text-[18px]">
                            rate_review
                        </span>
                        <p className="label-caps !mb-0">Member Perspectives</p>
                    </div>
                    <h2 className="section-title">Community Reviews & Film Journals</h2>
                    <p className="text-xs text-text-3 mt-1">
                        Authentic critiques, essays, and diary impressions logged by Cinephile members
                    </p>
                </div>
                <Link to="/social" className="section-link">
                    <span>Community Feed</span>
                    <Icon className="text-sm">arrow_forward</Icon>
                </Link>
            </div>

            {loading ? (
                <div className="card-grid-fluid gap-4 sm:gap-5">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="p-5 rounded-2xl border border-border bg-surface space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full skeleton" />
                                <div className="space-y-1.5 flex-1">
                                    <div className="h-3 w-1/3 skeleton rounded" />
                                    <div className="h-2.5 w-1/2 skeleton rounded" />
                                </div>
                            </div>
                            <div className="h-12 w-full skeleton rounded-lg" />
                        </div>
                    ))}
                </div>
            ) : (!reviews || reviews.length === 0) ? (
                <div className="rounded-2xl border border-dashed border-border bg-surface/60 p-8 text-center max-w-xl mx-auto space-y-4">
                    <span className="material-symbols-outlined text-4xl text-accent/60">
                        edit_note
                    </span>
                    <div>
                        <h3 className="font-serif text-lg font-semibold text-text">
                            Be the First to Critique
                        </h3>
                        <p className="text-xs text-text-3 mt-1 max-w-md mx-auto">
                            No member reviews published yet. Log any film you've watched, rate it, and share your perspective with our community.
                        </p>
                    </div>
                    <Link to="/login" className="btn-primary text-xs py-2.5 px-6 inline-block">
                        Write a Review
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            onClick={() => review.movieId && navigate(`/movies/${review.movieId}`)}
                            className="mc-card group flex flex-col justify-between p-5 cursor-pointer hover:border-accent/40 transition-all duration-200"
                        >
                            <div>
                                <div className="mb-4 flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {review.avatarUrl ? (
                                            <img
                                                src={review.avatarUrl}
                                                alt={review.username || review.author}
                                                className="h-9 w-9 rounded-full object-cover border border-border shrink-0"
                                            />
                                        ) : (
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent border border-accent/20">
                                                {(review.username || review.author || "CP").substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <div className="text-sm font-semibold text-text group-hover:text-accent transition-colors truncate">
                                                {review.firstname ? `${review.firstname} ${review.lastname || ""}` : (review.username || review.author)}
                                            </div>
                                            <div className="text-[11px] text-text-3 truncate">
                                                Reviewed{" "}
                                                <span className="font-medium text-text-2">{review.movieTitle}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rating badge */}
                                    <div className="badge badge-accent text-[11px] font-mono shrink-0">
                                        ★ {review.rating}
                                    </div>
                                </div>

                                {review.title && (
                                    <h4 className="text-xs font-semibold text-text-2 mb-1.5 italic">
                                        "{review.title}"
                                    </h4>
                                )}

                                <p className="text-xs text-text-2 leading-relaxed line-clamp-4 font-sans">
                                    "{review.content}"
                                </p>
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3 text-[11px] text-text-3">
                                <span className="flex items-center gap-1 font-mono">
                                    <span className="material-symbols-outlined text-[14px] text-accent">favorite</span>
                                    <span>{review.likesCount ?? 0} helpful</span>
                                </span>
                                <span className="font-medium text-text-3">
                                    {review.watchedDate || "Community Log"}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Join Discourse Prompt Card */}
                    <div className="rounded-2xl border border-accent/20 bg-surface/50 p-6 flex flex-col justify-between text-center md:text-left">
                        <div>
                            <span className="material-symbols-outlined text-2xl text-accent mb-2">
                                forum
                            </span>
                            <h4 className="font-serif text-base font-semibold text-text">
                                Log Your Cinema Journey
                            </h4>
                            <p className="mt-1 text-xs text-text-3 leading-relaxed">
                                Join fellow cinephiles in rating films, writing deep-dive reviews, and tracking your lifetime cinema diary.
                            </p>
                        </div>
                        <div className="mt-5 pt-3 border-t border-border/60">
                            <Link to="/register" className="btn-primary text-xs py-2 px-5 inline-block text-center w-full">
                                Create Member Account
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

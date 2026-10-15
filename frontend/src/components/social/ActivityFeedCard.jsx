import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { toggleReviewLike } from "../../services/reviewService";
import ReviewCommentsSection from "../review/ReviewCommentsSection";

function formatRelativeTime(dateString) {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 60) return "Just now";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
}

export default function ActivityFeedCard({ item }) {
    if (!item) return null;

    const { token } = useContext(AuthContext);
    const { error } = useToast();

    const {
        id: rawId,
        type,
        timestamp,
        userId,
        userName,
        userUsername,
        userAvatar,
        movieId,
        movieTitle,
        moviePoster,
        movieYear,
        rating,
        reviewText,
        isRewatch,
        venueOrPlatform,
        notes,
        listId,
        listName,
        listDescription,
        listItemCount
    } = item;

    const reviewId = type === "REVIEW" && rawId ? Number(rawId.replace("review-", "")) : null;

    // Instagram-style likes & comments states for reviews
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [likeLoading, setLikeLoading] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentsCount, setCommentsCount] = useState(0);

    const handleToggleLike = async () => {
        if (!reviewId) return;
        if (!token) {
            error("Please log in to like this review");
            return;
        }

        try {
            setLikeLoading(true);
            const prevLiked = isLiked;
            const prevCount = likesCount;

            setIsLiked(!prevLiked);
            setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

            const res = await toggleReviewLike(reviewId);
            if (res && res.liked !== undefined) {
                setIsLiked(res.liked);
                setLikesCount(res.likesCount);
            }
        } catch (err) {
            console.error("Failed to like review:", err);
            error("Failed to update like status");
        } finally {
            setLikeLoading(false);
        }
    };

    const posterUrl = moviePoster
        ? moviePoster.startsWith("http")
            ? moviePoster
            : `https://image.tmdb.org/t/p/w300${moviePoster}`
        : null;

    return (
        <article className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-card transition-all duration-300 hover:border-accent/40">
            {/* Top User Row */}
            <div className="flex items-center justify-between gap-3 mb-4">
                <Link
                    to={`/profile/${userId}`}
                    className="flex items-center gap-3 group no-underline min-w-0"
                >
                    <div className="h-10 w-10 shrink-0 rounded-full border border-border bg-surface-2 overflow-hidden flex items-center justify-center font-bold text-accent group-hover:border-accent transition-colors">
                        {userAvatar ? (
                            <img
                                src={userAvatar}
                                alt={userName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span>{userName?.charAt(0)?.toUpperCase() || "C"}</span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-sm text-text group-hover:text-accent transition-colors truncate">
                                {userName}
                            </span>
                            <span className="text-xs text-text-3">
                                @{userUsername}
                            </span>
                        </div>
                        <p className="text-xs text-text-3 flex items-center gap-1.5 mt-0.5">
                            {type === "DIARY_LOG" && (
                                <>
                                    <span className="material-symbols-outlined text-[14px] text-accent">edit_calendar</span>
                                    <span>logged a film</span>
                                </>
                            )}
                            {type === "REVIEW" && (
                                <>
                                    <span className="material-symbols-outlined text-[14px] text-accent">rate_review</span>
                                    <span>reviewed a film</span>
                                </>
                            )}
                            {type === "LIST_CREATED" && (
                                <>
                                    <span className="material-symbols-outlined text-[14px] text-accent">featured_play_list</span>
                                    <span>created a curated list</span>
                                </>
                            )}
                        </p>
                    </div>
                </Link>

                <span className="text-[11px] font-mono text-text-3 shrink-0">
                    {formatRelativeTime(timestamp)}
                </span>
            </div>

            {/* Content Body: Film or List */}
            {type === "LIST_CREATED" ? (
                <Link
                    to={`/lists/${listId}`}
                    className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-border bg-surface-2 hover:border-accent/40 transition-colors no-underline group"
                >
                    {posterUrl && (
                        <div className="h-24 w-16 shrink-0 rounded-lg overflow-hidden border border-border bg-surface shadow-sm">
                            <img src={posterUrl} alt={listName} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-base font-bold text-text group-hover:text-accent transition-colors truncate">
                            {listName}
                        </h4>
                        {listDescription && (
                            <p className="text-xs text-text-2 line-clamp-2 mt-1">
                                {listDescription}
                            </p>
                        )}
                        <span className="inline-flex items-center gap-1 mt-2 text-[11px] text-accent font-semibold">
                            <span>View List ({listItemCount} {listItemCount === 1 ? "film" : "films"})</span>
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </span>
                    </div>
                </Link>
            ) : (
                <div className="flex gap-4 items-start">
                    {/* Poster */}
                    <Link
                        to={`/movies/${movieId}`}
                        className="h-28 w-20 sm:h-32 sm:w-24 shrink-0 rounded-xl overflow-hidden border border-border bg-surface-2 shadow-sm group cursor-pointer"
                    >
                        {posterUrl ? (
                            <img
                                src={posterUrl}
                                alt={movieTitle}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-text-3 text-xs">
                                No Poster
                            </div>
                        )}
                    </Link>

                    {/* Film Meta & Activity Details */}
                    <div className="flex-1 min-w-0 space-y-2">
                        <div>
                            <Link
                                to={`/movies/${movieId}`}
                                className="font-serif text-base sm:text-lg font-bold text-text hover:text-accent transition-colors no-underline line-clamp-1"
                            >
                                {movieTitle}
                            </Link>
                            <span className="text-xs text-text-3 font-mono">
                                {movieYear ? movieYear : ""}
                            </span>
                        </div>

                        {/* Rating & Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                            {rating !== null && rating !== undefined && rating > 0 && (
                                <div className="flex items-center gap-1 rounded-md bg-accent/15 px-2 py-0.5 text-xs font-bold text-accent">
                                    <span>★</span>
                                    <span>{rating.toFixed(1)}</span>
                                </div>
                            )}

                            {isRewatch && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-surface-2 border border-border px-2 py-0.5 text-[11px] font-semibold text-text-2">
                                    <span>🔁</span>
                                    <span>Rewatch</span>
                                </span>
                            )}

                            {venueOrPlatform && (
                                <span className="rounded-md bg-surface-2 border border-border px-2 py-0.5 text-[11px] font-medium text-text-3">
                                    {venueOrPlatform}
                                </span>
                            )}
                        </div>

                        {/* Review / Note Text */}
                        {(reviewText || notes) && (
                            <p className="text-xs sm:text-sm text-text-2 leading-relaxed bg-surface-2/60 border border-border/60 rounded-xl p-3 line-clamp-3">
                                "{reviewText || notes}"
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Instagram-Style Actions Bar for Reviews */}
            {type === "REVIEW" && reviewId && (
                <div className="mt-4 pt-3 border-t border-border/60">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={handleToggleLike}
                                disabled={likeLoading}
                                className={`flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                                    isLiked ? "text-rose-500" : "text-text-3 hover:text-rose-400"
                                }`}
                            >
                                <span className={`material-symbols-outlined text-[18px] ${isLiked ? "font-bold fill-current" : ""}`}>
                                    favorite
                                </span>
                                <span>{likesCount > 0 ? likesCount : ""}</span>
                                <span className="text-[11px]">{isLiked ? "Liked" : "Like"}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowComments((prev) => !prev)}
                                className={`flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                                    showComments ? "text-accent" : "text-text-3 hover:text-accent"
                                }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">
                                    chat_bubble
                                </span>
                                <span>{commentsCount > 0 ? commentsCount : ""}</span>
                                <span className="text-[11px]">Comments</span>
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowComments((prev) => !prev)}
                            className="text-[11px] text-text-3 hover:text-accent transition-colors cursor-pointer"
                        >
                            {showComments ? "Hide discussion" : "Discuss review"}
                        </button>
                    </div>

                    {showComments && (
                        <ReviewCommentsSection
                            reviewId={reviewId}
                            reviewAuthorId={userId}
                            commentsCount={commentsCount}
                            onCommentsCountChange={setCommentsCount}
                        />
                    )}
                </div>
            )}
        </article>
    );
}

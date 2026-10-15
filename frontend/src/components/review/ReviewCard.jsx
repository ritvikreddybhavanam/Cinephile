import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { toggleReviewLike } from "../../services/reviewService";
import ReviewCommentsSection from "./ReviewCommentsSection";
import SmartSpoilerContent from "./SmartSpoilerContent";

function formatRelativeDate(dateString) {
    if (!dateString) return "Recent";
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return "Yesterday";
    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

export default function ReviewCard({
    review,
    showMovieHeader = false,
    onEdit,
    onDelete
}) {
    const isTmdb = review.source === "tmdb";
    const { user, token } = useContext(AuthContext);
    const { success, error } = useToast();

    // Spoilers toggle & parsing
    const [revealSpoiler, setRevealSpoiler] = useState(false);
    const hasSpoiler = !isTmdb && Boolean(review.spoilers);
    const content = review.content || review.review || "";
    const parsedSpoilerTypes = review.spoilerTypes
        ? (typeof review.spoilerTypes === "string" ? review.spoilerTypes.split(",").map((s) => s.trim()).filter(Boolean) : review.spoilerTypes)
        : [];
    const hasInlineBlocks = content.includes("[spoiler") || content.includes("||");

    // Likes state (Instagram-style)
    const [isLiked, setIsLiked] = useState(Boolean(review.isLiked));
    const [likesCount, setLikesCount] = useState(Number(review.likesCount) || 0);
    const [likeLoading, setLikeLoading] = useState(false);
    const [heartPop, setHeartPop] = useState(false);

    // Comments state (Instagram-style)
    const [showComments, setShowComments] = useState(false);
    const [commentsCount, setCommentsCount] = useState(Number(review.commentsCount) || 0);

    const reviewerName = isTmdb
        ? review.author || "TMDB Member"
        : (
            `${review.firstname || review.user?.firstname || ""} ${
                review.lastname || review.user?.lastname || ""
            }`.trim() || review.username || "Cinephile Member"
        );

    const reviewerUsername = review.username || (review.userId ? `user${review.userId}` : null);
    const reviewerAvatar = review.avatarUrl || review.user?.avatarUrl || review.avatar;
    const authorId = review.userId || review.user?.id;

    const rating = isTmdb ? review.author_details?.rating : review.rating;
    const ratingValue = rating !== null && rating !== undefined && rating !== "" ? Number(rating) : null;
    const formattedDate = formatRelativeDate(isTmdb ? review.created_at : (review.createdAt || review.reviewedDate));

    const title = review.title || (isTmdb ? null : null);

    const isOwnReview = user && authorId && user.id === authorId;

    const handleToggleLike = async () => {
        if (isTmdb) return; // TMDB reviews are read-only
        if (!token) {
            error("Please log in to like this review");
            return;
        }

        try {
            setLikeLoading(true);
            const prevLiked = isLiked;
            const prevCount = likesCount;

            // Optimistic update
            setIsLiked(!prevLiked);
            setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);
            if (!prevLiked) {
                setHeartPop(true);
                setTimeout(() => setHeartPop(false), 600);
            }

            const res = await toggleReviewLike(review.id);
            if (res && res.liked !== undefined) {
                setIsLiked(res.liked);
                setLikesCount(res.likesCount);
            }
        } catch (err) {
            console.error("Failed to like review:", err);
            // Rollback
            setIsLiked(review.isLiked);
            setLikesCount(review.likesCount || 0);
            error("Failed to update like status");
        } finally {
            setLikeLoading(false);
        }
    };

    // Instagram double-tap to like
    const handleDoubleTap = (e) => {
        if (isTmdb) return;
        if (!isLiked) {
            handleToggleLike();
        } else {
            setHeartPop(true);
            setTimeout(() => setHeartPop(false), 600);
        }
    };

    return (
        <article
            onDoubleClick={handleDoubleTap}
            className="mc-card p-5 sm:p-6 transition-all duration-300 relative group/card select-none"
        >
            {/* Big Heart Animation on Double-Tap */}
            {heartPop && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <span className="material-symbols-outlined text-rose-500 text-7xl sm:text-8xl drop-shadow-2xl animate-ping opacity-90">
                        favorite
                    </span>
                </div>
            )}

            <div className="flex flex-col gap-3.5">
                {/* Movie Header info (if on MyReviews page) */}
                {showMovieHeader && review.movieId && (
                    <div className="pb-3 border-b border-border/70 flex items-center justify-between gap-3">
                        <Link
                            to={`/movies/${review.movieId}`}
                            className="text-base sm:text-lg font-serif font-bold text-text hover:text-accent transition-colors no-underline line-clamp-1"
                        >
                            {review.movieTitle || review.title}
                            {review.year && (
                                <span className="ml-2 text-xs sm:text-sm font-sans font-normal text-text-3 font-mono">
                                    ({review.year})
                                </span>
                            )}
                        </Link>

                        {isOwnReview && onDelete && (
                            <div className="flex items-center gap-1.5 shrink-0">
                                {onEdit && (
                                    <button
                                        type="button"
                                        onClick={() => onEdit(review)}
                                        className="p-1.5 rounded-lg text-text-3 hover:text-accent hover:bg-surface-2 transition-colors cursor-pointer text-xs"
                                        title="Edit review"
                                    >
                                        <span className="material-symbols-outlined text-base">edit</span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => onDelete(review.id)}
                                    className="p-1.5 rounded-lg text-text-3 hover:text-error hover:bg-surface-2 transition-colors cursor-pointer text-xs"
                                    title="Delete review"
                                >
                                    <span className="material-symbols-outlined text-base">delete</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Top Author & Rating Row */}
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        {authorId && !isTmdb ? (
                            <Link
                                to={`/profile/${authorId}`}
                                className="h-10 w-10 shrink-0 rounded-full border border-border bg-surface-2 overflow-hidden flex items-center justify-center font-bold text-accent hover:border-accent transition-colors no-underline"
                            >
                                {reviewerAvatar ? (
                                    <img
                                        src={reviewerAvatar}
                                        alt={reviewerName}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span>{reviewerName.charAt(0).toUpperCase()}</span>
                                )}
                            </Link>
                        ) : (
                            <div className="h-10 w-10 shrink-0 rounded-full bg-accent/15 text-accent border border-accent/20 flex items-center justify-center font-bold text-sm">
                                {reviewerName.charAt(0).toUpperCase()}
                            </div>
                        )}

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                                {authorId && !isTmdb ? (
                                    <Link
                                        to={`/profile/${authorId}`}
                                        className="text-sm font-semibold text-text hover:text-accent transition-colors no-underline truncate"
                                    >
                                        {reviewerName}
                                    </Link>
                                ) : (
                                    <span className="text-sm font-semibold text-text truncate">
                                        {reviewerName}
                                    </span>
                                )}

                                {reviewerUsername && !isTmdb && (
                                    <span className="text-xs text-text-3 font-mono">
                                        @{reviewerUsername}
                                    </span>
                                )}

                                <span className="badge badge-accent text-[10px] py-0 px-1.5">
                                    {isTmdb ? "TMDB" : "Cinephile"}
                                </span>

                                {/* Review Intent Badge */}
                                {(() => {
                                    const intent = review.reviewIntent || (isTmdb ? "general" : "general");
                                    const intentMap = {
                                        deep_analysis: { label: "Deep Analysis", emoji: "🎓", style: "border-purple-500/30 bg-purple-500/10 text-purple-300" },
                                        technical_craft: { label: "Technical & Craft", emoji: "🎥", style: "border-blue-500/30 bg-blue-500/10 text-blue-300" },
                                        general: { label: "General Critique", emoji: "💡", style: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
                                        quick_take: { label: "Quick Take", emoji: "⚡", style: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
                                        humor: { label: "Humor", emoji: "😂", style: "border-rose-500/30 bg-rose-500/10 text-rose-300" },
                                    };
                                    const config = intentMap[intent] || intentMap.general;
                                    return (
                                        <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium tracking-wide ${config.style}`}>
                                            <span>{config.emoji}</span>
                                            <span>{config.label}</span>
                                        </span>
                                    );
                                })()}
                            </div>

                            <p className="mt-0.5 text-xs text-text-3 font-mono">
                                {formattedDate}
                                {review.viewingFormat && (
                                    <span className="ml-1.5 text-text-3">· {review.viewingFormat}</span>
                                )}
                                {review.rewatch && (
                                    <span className="ml-1.5 text-accent">· 🔁 Rewatch</span>
                                )}
                                {content && content.trim().split(/\s+/).length >= 150 && (
                                    <span className="ml-1.5 text-text-3 font-sans opacity-75">
                                        · ⏱️ {Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200))} min read
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Rating Pill */}
                    {ratingValue !== null && (
                        <div className="flex items-center gap-1.5 self-start">
                            <div className="flex text-accent text-xs">
                                {"★".repeat(Math.min(5, Math.floor(ratingValue)))}
                            </div>
                            <div className="badge badge-accent font-mono text-xs">
                                ★ {ratingValue.toFixed(1)}
                                <span className="text-[10px] opacity-60 ml-0.5">
                                    / {isTmdb ? "10" : "5"}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Granular Spoiler Warning Header if marked */}
                {hasSpoiler && parsedSpoilerTypes.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 py-1">
                        <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">warning</span>
                            Contains:
                        </span>
                        {parsedSpoilerTypes.map((type) => {
                            const labelMap = {
                                MINOR_PLOT: "Minor Plot",
                                MAJOR_PLOT: "Major Plot",
                                CHARACTER_DEATH: "Character Death",
                                ENDING: "Ending",
                                MAJOR_TWIST: "Major Twist",
                                POST_CREDITS: "Post-Credits",
                            };
                            return (
                                <span
                                    key={type}
                                    className="rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300 font-mono"
                                >
                                    {labelMap[type] || type}
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* Review Title if present */}
                {title && !showMovieHeader && (
                    <h4 className="font-serif text-base sm:text-lg font-semibold text-text">
                        {title}
                    </h4>
                )}

                {/* Full Spoiler Mask (if whole review masked and no inline blocks) OR Smart Inline Content */}
                {hasSpoiler && !hasInlineBlocks && !revealSpoiler ? (
                    <div className="rounded-xl border border-wine/40 bg-wine/10 p-4 text-center">
                        <p className="text-xs font-semibold text-wine mb-2 flex items-center justify-center gap-1.5">
                            <span className="material-symbols-outlined text-base">visibility_off</span>
                            This critique contains spoilers {parsedSpoilerTypes.length > 0 ? `(${parsedSpoilerTypes.map(s => s.replace("_", " ")).join(", ")})` : ""}
                        </p>
                        <button
                            type="button"
                            onClick={() => setRevealSpoiler(true)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline cursor-pointer"
                        >
                            Reveal Critique
                        </button>
                    </div>
                ) : (
                    <div>
                        <SmartSpoilerContent
                            content={content}
                            spoilerTypes={parsedSpoilerTypes}
                        />
                        {hasSpoiler && !hasInlineBlocks && (
                            <button
                                type="button"
                                onClick={() => setRevealSpoiler(false)}
                                className="mt-2 text-[11px] text-text-3 hover:text-text cursor-pointer block"
                            >
                                Hide spoiler
                            </button>
                        )}
                    </div>
                )}

                {/* Instagram-Style Actions Bar */}
                {!isTmdb && (
                    <div className="pt-2 flex items-center justify-between gap-4 border-t border-border/50">
                        <div className="flex items-center gap-4">
                            {/* Heart Like Button */}
                            <button
                                type="button"
                                onClick={handleToggleLike}
                                disabled={likeLoading}
                                className={`flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer group/like ${
                                    isLiked
                                        ? "text-rose-500 scale-105"
                                        : "text-text-3 hover:text-rose-400"
                                }`}
                                title={isLiked ? "Unlike review" : "Like review"}
                            >
                                <span
                                    className={`material-symbols-outlined text-[20px] transition-transform group-hover/like:scale-125 ${
                                        isLiked ? "fill-current font-bold" : ""
                                    }`}
                                >
                                    favorite
                                </span>
                                <span>{likesCount}</span>
                                <span className="hidden sm:inline font-normal text-text-3 text-[11px]">
                                    {likesCount === 1 ? "like" : "likes"}
                                </span>
                            </button>

                            {/* Comment Speech Bubble Button */}
                            <button
                                type="button"
                                onClick={() => setShowComments((prev) => !prev)}
                                className={`flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer group/comment ${
                                    showComments
                                        ? "text-accent"
                                        : "text-text-3 hover:text-accent"
                                }`}
                                title="View comments"
                            >
                                <span className="material-symbols-outlined text-[20px] transition-transform group-hover/comment:scale-125">
                                    chat_bubble
                                </span>
                                <span>{commentsCount}</span>
                                <span className="hidden sm:inline font-normal text-text-3 text-[11px]">
                                    {commentsCount === 1 ? "comment" : "comments"}
                                </span>
                            </button>
                        </div>

                        {/* Quick toggle link */}
                        <button
                            type="button"
                            onClick={() => setShowComments((prev) => !prev)}
                            className="text-[11px] text-text-3 hover:text-accent font-medium transition-colors cursor-pointer"
                        >
                            {showComments ? "Hide discussion" : (commentsCount > 0 ? `View discussion (${commentsCount})` : "Leave a comment")}
                        </button>
                    </div>
                )}

                {/* Expandable Instagram-Style Comments Section */}
                {!isTmdb && showComments && (
                    <ReviewCommentsSection
                        reviewId={review.id}
                        reviewAuthorId={authorId}
                        commentsCount={commentsCount}
                        onCommentsCountChange={setCommentsCount}
                    />
                )}
            </div>
        </article>
    );
}
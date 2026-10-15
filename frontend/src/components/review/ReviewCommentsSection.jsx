import { useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
    getReviewComments,
    addReviewComment,
    deleteReviewComment
} from "../../services/reviewService";

function formatTimeAgo(dateString) {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 45) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays === 1) return "1d";
    if (diffDays < 7) return `${diffDays}d`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `${diffWeeks}w`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function renderFormattedContent(text) {
    if (!text) return null;
    const parts = text.split(/(@[a-zA-Z0-9_.-]+)/g);
    return parts.map((part, index) => {
        if (part.startsWith("@")) {
            return (
                <span key={index} className="font-semibold text-accent hover:underline cursor-pointer">
                    {part}{" "}
                </span>
            );
        }
        return part;
    });
}

export default function ReviewCommentsSection({
    reviewId,
    reviewAuthorId,
    commentsCount = 0,
    onCommentsCountChange
}) {
    const { user, token } = useContext(AuthContext);
    const { success, error } = useToast();

    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [replyingTo, setReplyingTo] = useState(null); // { id, username, userName }
    const [submitting, setSubmitting] = useState(false);
    const [expandedReplies, setExpandedReplies] = useState(new Set());
    const [deletingId, setDeletingId] = useState(null);

    const inputRef = useRef(null);

    const emojis = ["❤️", "🔥", "👏", "🍿", "🎬", "💯", "🤯", "🙌"];

    const loadComments = async () => {
        try {
            setLoading(true);
            const data = await getReviewComments(reviewId);
            setComments(Array.isArray(data) ? data : []);
            setLoaded(true);
        } catch (err) {
            console.error("Failed to load comments:", err);
            error("Failed to load comments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (reviewId) {
            loadComments();
        }
    }, [reviewId]);

    const handleReplyClick = (comment) => {
        if (!token) {
            error("Please log in to reply to comments");
            return;
        }
        setReplyingTo({
            id: comment.id,
            username: comment.username || `user${comment.userId}`,
            userName: comment.userName || "Cinephile"
        });
        setCommentText(`@${comment.username || `user${comment.userId}`} `);
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 50);
    };

    const cancelReply = () => {
        setReplyingTo(null);
        setCommentText("");
    };

    const toggleReplies = (commentId) => {
        setExpandedReplies((prev) => {
            const next = new Set(prev);
            if (next.has(commentId)) {
                next.delete(commentId);
            } else {
                next.add(commentId);
            }
            return next;
        });
    };

    const handleAddEmoji = (emoji) => {
        setCommentText((prev) => prev + emoji);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleSubmitComment = async (e) => {
        if (e) e.preventDefault();
        const trimmed = commentText.trim();
        if (!trimmed) return;

        if (!token) {
            error("Please log in to post a comment");
            return;
        }

        try {
            setSubmitting(true);
            const parentId = replyingTo ? replyingTo.id : null;
            const newComment = await addReviewComment(reviewId, {
                content: trimmed,
                parentId
            });

            if (parentId) {
                // Nested reply
                setComments((prev) =>
                    prev.map((c) => {
                        if (c.id === parentId) {
                            return {
                                ...c,
                                replies: [...(c.replies || []), newComment]
                            };
                        }
                        return c;
                    })
                );
                setExpandedReplies((prev) => new Set([...prev, parentId]));
            } else {
                // Top-level comment
                setComments((prev) => [...prev, newComment]);
            }

            setCommentText("");
            setReplyingTo(null);
            if (onCommentsCountChange) {
                onCommentsCountChange(commentsCount + 1);
            }
            success("Comment posted");
        } catch (err) {
            console.error("Failed to post comment:", err);
            error(err.response?.data?.error || "Failed to post comment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId, parentId = null) => {
        try {
            setDeletingId(commentId);
            await deleteReviewComment(reviewId, commentId);

            if (parentId) {
                setComments((prev) =>
                    prev.map((c) => {
                        if (c.id === parentId) {
                            return {
                                ...c,
                                replies: (c.replies || []).filter((r) => r.id !== commentId)
                            };
                        }
                        return c;
                    })
                );
            } else {
                setComments((prev) => prev.filter((c) => c.id !== commentId));
            }

            if (onCommentsCountChange && commentsCount > 0) {
                onCommentsCountChange(commentsCount - 1);
            }
            success("Comment deleted");
        } catch (err) {
            console.error("Failed to delete comment:", err);
            error("Failed to delete comment");
        } finally {
            setDeletingId(null);
        }
    };

    const canDeleteComment = (c) => {
        if (!user) return false;
        const isCommentAuthor = user.id === c.userId;
        const isReviewAuthor = user.id === reviewAuthorId;
        return isCommentAuthor || isReviewAuthor;
    };

    return (
        <div className="mt-4 pt-4 border-t border-border/70 space-y-4">
            {/* Quick Emoji Bar */}
            {token && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <span className="text-[11px] text-text-3 font-mono mr-1">Reactions:</span>
                    {emojis.map((emoji) => (
                        <button
                            key={emoji}
                            type="button"
                            onClick={() => handleAddEmoji(emoji)}
                            className="text-base px-2 py-0.5 rounded-full bg-surface-2 hover:bg-surface-3 border border-border/80 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}

            {/* Replying Banner */}
            {replyingTo && (
                <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/30 text-xs text-accent animate-in fade-in duration-200">
                    <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">reply</span>
                        <span>Replying to <strong>@{replyingTo.username}</strong></span>
                    </span>
                    <button
                        type="button"
                        onClick={cancelReply}
                        className="text-text-3 hover:text-text text-xs cursor-pointer font-bold px-1"
                    >
                        ✕ Cancel
                    </button>
                </div>
            )}

            {/* Sticky/Interactive Comment Input Form */}
            {token ? (
                <form onSubmit={handleSubmitComment} className="flex items-center gap-2.5">
                    <div className="h-8 w-8 shrink-0 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-xs font-bold text-accent">
                        {user.firstname ? user.firstname.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="relative flex-1">
                        <input
                            ref={inputRef}
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : "Add an honest comment..."}
                            maxLength={500}
                            className="w-full rounded-full bg-surface-2 border border-border px-4 py-2 text-xs sm:text-sm text-text placeholder:text-text-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all pr-16"
                        />
                        <button
                            type="submit"
                            disabled={!commentText.trim() || submitting}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-xs font-bold text-accent hover:bg-accent/15 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
                        >
                            {submitting ? "..." : "Post"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="p-3 rounded-xl bg-surface-2 border border-border text-center text-xs text-text-3">
                    <Link to="/login" className="text-accent font-semibold hover:underline">
                        Log in
                    </Link>{" "}
                    to like and join the conversation.
                </div>
            )}

            {/* Comments List */}
            {loading && !loaded ? (
                <div className="space-y-3 py-2">
                    <div className="h-10 w-full rounded-lg bg-surface-2 animate-pulse" />
                    <div className="h-10 w-full rounded-lg bg-surface-2 animate-pulse" />
                </div>
            ) : comments.length === 0 ? (
                <p className="text-xs text-text-3 italic text-center py-3">
                    No comments yet. Be the first to share your perspective!
                </p>
            ) : (
                <div className="space-y-3.5 divide-y divide-border/40">
                    {comments.map((comment) => (
                        <div key={comment.id} className="pt-3 first:pt-0 group">
                            {/* Main Top-Level Comment */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                    <Link
                                        to={`/profile/${comment.userId}`}
                                        className="h-7 w-7 shrink-0 rounded-full border border-border bg-surface-2 overflow-hidden flex items-center justify-center text-[11px] font-bold text-accent hover:border-accent transition-colors no-underline"
                                    >
                                        {comment.userAvatar ? (
                                            <img
                                                src={comment.userAvatar}
                                                alt={comment.userName}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span>{comment.userName?.charAt(0)?.toUpperCase() || "C"}</span>
                                        )}
                                    </Link>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-baseline gap-2 flex-wrap">
                                            <Link
                                                to={`/profile/${comment.userId}`}
                                                className="text-xs font-semibold text-text hover:text-accent transition-colors no-underline"
                                            >
                                                {comment.userName}
                                            </Link>
                                            <span className="text-[10px] text-text-3 font-mono">
                                                @{comment.username}
                                            </span>
                                            <span className="text-[10px] text-text-3">·</span>
                                            <span className="text-[10px] text-text-3 font-mono">
                                                {formatTimeAgo(comment.createdAt)}
                                            </span>
                                        </div>

                                        <p className="mt-1 text-xs text-text-2 leading-relaxed break-words">
                                            {renderFormattedContent(comment.content)}
                                        </p>

                                        {/* Reply and Actions Row */}
                                        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-text-3">
                                            {token && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleReplyClick(comment)}
                                                    className="font-medium hover:text-accent transition-colors cursor-pointer"
                                                >
                                                    Reply
                                                </button>
                                            )}

                                            {comment.replies && comment.replies.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => toggleReplies(comment.id)}
                                                    className="inline-flex items-center gap-1 font-semibold text-accent hover:underline cursor-pointer"
                                                >
                                                    <span>—</span>
                                                    <span>
                                                        {expandedReplies.has(comment.id)
                                                            ? "Hide replies"
                                                            : `View ${comment.replies.length} ${comment.replies.length === 1 ? "reply" : "replies"}`}
                                                    </span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Delete Button */}
                                {canDeleteComment(comment) && (
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(comment.id)}
                                        disabled={deletingId === comment.id}
                                        title="Delete comment"
                                        className="opacity-0 group-hover:opacity-100 text-text-3 hover:text-error transition-all p-1 rounded-md hover:bg-surface-2 cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">delete</span>
                                    </button>
                                )}
                            </div>

                            {/* Nested Replies */}
                            {comment.replies && comment.replies.length > 0 && expandedReplies.has(comment.id) && (
                                <div className="mt-3 ml-8 pl-3 border-l-2 border-accent/20 space-y-3 animate-in fade-in duration-200">
                                    {comment.replies.map((reply) => (
                                        <div key={reply.id} className="flex items-start justify-between gap-2.5 group/reply">
                                            <div className="flex items-start gap-2 min-w-0 flex-1">
                                                <Link
                                                    to={`/profile/${reply.userId}`}
                                                    className="h-6 w-6 shrink-0 rounded-full border border-border bg-surface-2 overflow-hidden flex items-center justify-center text-[10px] font-bold text-accent hover:border-accent transition-colors no-underline"
                                                >
                                                    {reply.userAvatar ? (
                                                        <img
                                                            src={reply.userAvatar}
                                                            alt={reply.userName}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <span>{reply.userName?.charAt(0)?.toUpperCase() || "C"}</span>
                                                    )}
                                                </Link>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-baseline gap-1.5 flex-wrap">
                                                        <Link
                                                            to={`/profile/${reply.userId}`}
                                                            className="text-[11px] font-semibold text-text hover:text-accent transition-colors no-underline"
                                                        >
                                                            {reply.userName}
                                                        </Link>
                                                        <span className="text-[10px] text-text-3 font-mono">
                                                            @{reply.username}
                                                        </span>
                                                        <span className="text-[10px] text-text-3">·</span>
                                                        <span className="text-[10px] text-text-3 font-mono">
                                                            {formatTimeAgo(reply.createdAt)}
                                                        </span>
                                                    </div>

                                                    <p className="mt-0.5 text-xs text-text-2 leading-relaxed break-words">
                                                        {renderFormattedContent(reply.content)}
                                                    </p>

                                                    {token && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleReplyClick(comment)}
                                                            className="mt-1 text-[10px] text-text-3 hover:text-accent font-medium cursor-pointer"
                                                        >
                                                            Reply
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {canDeleteComment(reply) && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(reply.id, comment.id)}
                                                    disabled={deletingId === reply.id}
                                                    title="Delete reply"
                                                    className="opacity-0 group-hover/reply:opacity-100 text-text-3 hover:text-error transition-all p-1 rounded-md hover:bg-surface-2 cursor-pointer"
                                                >
                                                    <span className="material-symbols-outlined text-[13px]">delete</span>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

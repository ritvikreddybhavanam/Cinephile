import { useState } from "react";
import { Link } from "react-router-dom";

function ReviewCard({ review }) {
    const [revealSpoiler, setRevealSpoiler] = useState(false);
    const hasSpoiler = Boolean(review.spoilers);

    return (
        <article className="rounded-xl border border-border bg-surface p-4 sm:p-5 transition-all">
            <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                    <Link
                        to={`/movies/${review.movieId}`}
                        className="text-base sm:text-lg font-serif font-semibold text-text transition-colors hover:text-accent break-words no-underline"
                    >
                        {review.title}
                        <span className="ml-2 text-sm font-normal font-sans text-text-3">{review.year}</span>
                    </Link>

                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        {review.stars && <div className="flex text-sm text-accent">{review.stars}</div>}
                        {review.rating && <span className="text-xs text-text-3">{review.rating} / 5</span>}
                        {review.reviewedDate && <span className="text-xs text-text-3">· Reviewed {review.reviewedDate}</span>}
                        {hasSpoiler && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                <span className="material-symbols-outlined text-[12px]">warning</span>
                                Spoilers
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {hasSpoiler && !revealSpoiler ? (
                <div className="relative rounded-lg border border-border/80 bg-surface-2/60 p-4 text-center">
                    <p className="text-xs font-semibold text-text-3 mb-2 flex items-center justify-center gap-1.5">
                        <span className="material-symbols-outlined text-base text-amber-400">visibility_off</span>
                        This review contains spoilers
                    </p>
                    <button
                        type="button"
                        onClick={() => setRevealSpoiler(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline cursor-pointer"
                    >
                        Reveal Review
                    </button>
                </div>
            ) : (
                <div>
                    <p className="text-sm leading-relaxed text-text-2">{review.review || review.content}</p>
                    {hasSpoiler && (
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
        </article>
    );
}

export default ReviewCard;
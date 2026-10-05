import { useMemo, useState } from "react";

function ReviewCard({ review }) {
    const isTmdb = review.source === "tmdb";

    const reviewerName = isTmdb
        ? review.author || "TMDB Member"
        : (
            `${review.firstname || review.user?.firstname || ""} ${
                review.lastname || review.user?.lastname || ""
            }`.trim() || "Cinephile Member"
        );

    const rating = isTmdb
        ? review.author_details?.rating
        : review.rating;

    const ratingValue =
        rating !== null &&
        rating !== undefined &&
        rating !== ""
            ? Number(rating)
            : null;

    const reviewDate = isTmdb
        ? review.created_at
        : review.createdAt;

    const formattedDate = reviewDate
        ? new Date(reviewDate).toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        )
        : "Recent";

    const title = isTmdb ? null : review.title;
    const content = review.content || "";
    const isSpoiler = !isTmdb && review.spoilers === true;

    return (
        <article className="mc-card p-6">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent border border-accent/20">
                            {reviewerName.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-semibold text-text">
                                    {reviewerName}
                                </h3>

                                <span className="badge badge-accent text-[10px]">
                                    {isTmdb ? "TMDB" : "Cinephile"}
                                </span>
                            </div>

                            <p className="mt-0.5 text-xs text-text-3">
                                {formattedDate}
                            </p>
                        </div>
                    </div>

                    {ratingValue !== null && (
                        <div className="badge badge-accent self-start">
                            ★ {ratingValue.toFixed(1)}
                            <span className="text-[10px] opacity-60 ml-0.5">
                                / {isTmdb ? "10" : "5"}
                            </span>
                        </div>
                    )}
                </div>

                {title && (
                    <h4 className="font-serif text-base font-semibold text-text">
                        {title}
                    </h4>
                )}

                {isSpoiler ? (
                    <details className="rounded-lg border border-wine/40 bg-wine/10 p-4">
                        <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-wine">
                            Contains Spoilers — Click to Reveal
                        </summary>
                        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-text-2">
                            {content}
                        </p>
                    </details>
                ) : (
                    <p className="whitespace-pre-line text-sm leading-relaxed text-text-2">
                        {content}
                    </p>
                )}
            </div>
        </article>
    );
}

function ReviewSection({
    tmdbReviews,
    appReviews,
    sectionRef,
}) {
    const [visibleCount, setVisibleCount] = useState(5);

    const combinedReviews = useMemo(() => {
        const tmdb = Array.isArray(tmdbReviews)
            ? tmdbReviews.map((review) => ({
                ...review,
                source: "tmdb",
            }))
            : [];

        const app = Array.isArray(appReviews)
            ? appReviews.map((review) => ({
                ...review,
                source: "app",
            }))
            : [];

        return [...app, ...tmdb].sort((a, b) => {
            const dateA = new Date(
                a.source === "tmdb" ? a.created_at : a.createdAt
            ).getTime();
            const dateB = new Date(
                b.source === "tmdb" ? b.created_at : b.createdAt
            ).getTime();
            return dateB - dateA;
        });
    }, [tmdbReviews, appReviews]);

    const visibleReviews = combinedReviews.slice(0, visibleCount);
    const hasMore = visibleCount < combinedReviews.length;

    const loadMoreReviews = () => {
        setVisibleCount((previous) => previous + 5);
    };

    if (combinedReviews.length === 0) {
        return (
            <section
                ref={sectionRef}
                id="reviews"
                className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-10 md:pb-14 scroll-mt-24"
            >
                <div className="section-header mb-6">
                    <div>
                        <p className="label-caps mb-1">Critique</p>
                        <h2 className="section-title">Reviews</h2>
                    </div>
                </div>

                <div className="rounded-lg border border-border bg-surface p-10 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 border border-accent/20">
                        <span className="text-xl text-accent">★</span>
                    </div>

                    <h3 className="font-serif text-lg font-semibold text-text">
                        No Reviews Logged Yet
                    </h3>

                    <p className="mt-1 text-sm text-text-3">
                        Be the first to log a review for this film.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section
            ref={sectionRef}
            id="reviews"
            className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-10 md:pb-14 scroll-mt-24"
        >
            <div className="section-header mb-6">
                <div>
                    <p className="label-caps mb-1">Critique</p>
                    <h2 className="section-title">Reviews & Perspectives</h2>
                </div>

                <span className="text-xs font-semibold text-accent tracking-wider uppercase">
                    {combinedReviews.length} {combinedReviews.length === 1 ? "Review" : "Reviews"}
                </span>
            </div>

            <div className="space-y-4">
                {visibleReviews.map((review, index) => (
                    <ReviewCard
                        key={`${review.source}-${review.id}-${index}`}
                        review={review}
                    />
                ))}
            </div>

            {hasMore && (
                <div className="mt-8 flex justify-center">
                    <button
                        type="button"
                        onClick={loadMoreReviews}
                        className="btn-secondary text-xs py-2.5 px-6"
                    >
                        Load More Reviews ↓
                    </button>
                </div>
            )}

            {!hasMore && combinedReviews.length > 5 && (
                <p className="mt-8 text-center text-xs text-text-3">
                    You have reached the end of community reviews.
                </p>
            )}
        </section>
    );
}

export default ReviewSection;

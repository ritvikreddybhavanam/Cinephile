import { useMemo, useState } from "react";

function ReviewCard({ review }) {
    const isTmdb = review.source === "tmdb";

    const reviewerName = isTmdb
        ? review.author || "TMDB User"
        : (
            `${review.firstname || review.user?.firstname || ""} ${
    review.lastname || review.user?.lastname || ""
}`.trim() || "Cinephile 🎬 User"
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
        : "Unknown date";

    const title = isTmdb
        ? null
        : review.title;

    const content = review.content || "";

    const isSpoiler =
        !isTmdb && review.spoilers === true;

    return (
        <article className="rounded-2xl border border-[#212936] bg-[#161c24] p-6 transition-all hover:border-[#303946]">

            <div className="flex flex-col gap-4">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00e054]/10 text-sm font-black text-[#00e054]">
                            {reviewerName
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div>

                            <div className="flex flex-wrap items-center gap-2">

                                <h3 className="font-bold text-white">
                                    {reviewerName}
                                </h3>

                                <span className="rounded-full border border-[#303946] bg-[#070a0d] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    {isTmdb
                                        ? "TMDB"
                                        : "Cinephile 🎬"}
                                </span>

                            </div>

                            <p className="mt-1 text-xs text-gray-500">
                                {formattedDate}
                            </p>

                        </div>

                    </div>

                    {ratingValue !== null && (
                        <div className="flex items-center gap-1 self-start rounded-lg bg-[#070a0d] px-3 py-2">

                            <span className="text-[#00e054]">
                                ★
                            </span>

                            <span className="font-bold text-white">
                                {ratingValue.toFixed(1)}
                            </span>

                            <span className="text-xs text-gray-500">
                                / {isTmdb ? "10" : "5"}
                            </span>

                        </div>
                    )}

                </div>

                {title && (
                    <h4 className="text-lg font-bold text-white">
                        {title}
                    </h4>
                )}

                {isSpoiler ? (
                    <details className="rounded-xl border border-[#303946] bg-[#070a0d] p-4">

                        <summary className="cursor-pointer text-sm font-bold text-[#00e054]">
                            Contains Spoilers — Show Review
                        </summary>

                        <p className="mt-4 whitespace-pre-line leading-7 text-gray-300">
                            {content}
                        </p>

                    </details>
                ) : (
                    <p className="whitespace-pre-line leading-7 text-gray-300">
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
    const [visibleCount, setVisibleCount] =
        useState(5);

    const combinedReviews = useMemo(() => {

        const tmdb =
            Array.isArray(tmdbReviews)
                ? tmdbReviews.map((review) => ({
                    ...review,
                    source: "tmdb",
                }))
                : [];

        const app =
            Array.isArray(appReviews)
                ? appReviews.map((review) => ({
                    ...review,
                    source: "app",
                }))
                : [];

        return [...app, ...tmdb].sort(
            (a, b) => {

                const dateA = new Date(
                    a.source === "tmdb"
                        ? a.created_at
                        : a.createdAt
                ).getTime();

                const dateB = new Date(
                    b.source === "tmdb"
                        ? b.created_at
                        : b.createdAt
                ).getTime();

                return dateB - dateA;
            }
        );

    }, [tmdbReviews, appReviews]);

    const visibleReviews =
        combinedReviews.slice(
            0,
            visibleCount
        );

    const hasMore =
        visibleCount <
        combinedReviews.length;

    const loadMoreReviews = () => {
        setVisibleCount(
            (previous) =>
                previous + 5
        );
    };

    if (combinedReviews.length === 0) {
        return (
            <section
                ref={sectionRef}
                id="reviews"
                className="max-w-7xl mx-auto px-6 pb-14 scroll-mt-24"
            >

                <h2 className="mb-7 text-2xl font-black md:text-3xl">
                    Reviews
                </h2>

                <div className="rounded-2xl border border-[#212936] bg-[#161c24] p-10 text-center">

                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#00e054]/10">

                        <span className="text-2xl text-[#00e054]">
                            ★
                        </span>

                    </div>

                    <h3 className="text-lg font-bold text-white">
                        No Reviews Yet
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                        Be the first to review this movie.
                    </p>

                </div>

            </section>
        );
    }

    return (
        <section
            ref={sectionRef}
            id="reviews"
            className="max-w-7xl mx-auto px-6 pb-14 scroll-mt-24"
        >

            <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

                <div>

                    <h2 className="text-2xl font-black md:text-3xl">
                        Reviews
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Reviews from TMDB and the Cinephile 🎬 community
                    </p>

                </div>

                <span className="text-sm font-bold text-[#00e054]">
                    {combinedReviews.length}{" "}
                    {combinedReviews.length === 1
                        ? "Review"
                        : "Reviews"}
                </span>

            </div>

            <div className="space-y-5">

                {visibleReviews.map(
                    (review, index) => (
                        <ReviewCard
                            key={`${review.source}-${review.id}-${index}`}
                            review={review}
                        />
                    )
                )}

            </div>

            {hasMore && (
                <div className="mt-8 flex justify-center">

                    <button
                        type="button"
                        onClick={loadMoreReviews}
                        className="flex items-center gap-2 rounded-xl border border-[#303946] bg-[#161c24] px-6 py-3 text-sm font-bold text-white transition-all hover:border-[#00e054] hover:bg-[#00e054] hover:text-[#070a0d]"
                    >
                        <span>
                            Load More Reviews
                        </span>

                        <span className="text-lg">
                            ↓
                        </span>

                    </button>

                </div>
            )}

            {!hasMore &&
                combinedReviews.length > 5 && (
                    <p className="mt-8 text-center text-sm text-gray-500">
                        You have reached the end of the reviews.
                    </p>
                )}

        </section>
    );
}

export default ReviewSection;

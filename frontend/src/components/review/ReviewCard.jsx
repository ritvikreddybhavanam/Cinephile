import { Link } from "react-router-dom";

function ReviewCard({ review }) {
    return (
        <article className="mc-card p-4 sm:p-5">
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
                        <div className="flex text-sm text-accent">{review.stars}</div>
                        <span className="text-xs text-text-3">{review.rating} / 5</span>
                        <span className="text-xs text-text-3">· Reviewed {review.reviewedDate}</span>
                    </div>
                </div>
            </div>

            <p className="text-sm leading-relaxed text-text-2">{review.review}</p>
        </article>
    );
}

export default ReviewCard;
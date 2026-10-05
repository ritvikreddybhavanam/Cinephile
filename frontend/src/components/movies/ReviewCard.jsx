import RatingStars from "../common/RatingStars";

function ReviewCard({ review }) {
    return (
        <article className="mc-card p-4">
            <div className="flex items-center gap-3 mb-3">
                {review.avatar ? (
                    <img
                        src={review.avatar}
                        alt={review.username}
                        className="h-9 w-9 rounded-full object-cover border border-border"
                    />
                ) : (
                    <div className="h-9 w-9 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center text-xs font-semibold text-accent">
                        {review.username?.substring(0, 2)?.toUpperCase() || "?"}
                    </div>
                )}

                <div>
                    <h4 className="text-sm font-medium text-text">{review.username}</h4>
                    <RatingStars rating={review.rating} />
                </div>
            </div>

            <p className="text-sm italic leading-relaxed text-text-2">
                "{review.text}"
            </p>
        </article>
    );
}

export default ReviewCard;
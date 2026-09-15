import RatingStars from "../common/RatingStars";

function ReviewCard({ review }) {
    return (
        <article className="review-card">
            <div className="review-user">
                <img
                    src={review.avatar}
                    alt={review.username}
                />

                <div>
                    <h4>{review.username}</h4>

                    <RatingStars rating={review.rating} />
                </div>
            </div>

            <p>"{review.text}"</p>
        </article>
    );
}

export default ReviewCard;
import ReviewCard from "./ReviewCard";

function ReviewsSection({ reviews }) {
    return (
        <section className="reviews-section">
            <h2>Fan Reviews</h2>

            <div className="reviews-grid">
                {reviews.map((review) => (
                    <ReviewCard
                        key={review.id}
                        review={review}
                    />
                ))}
            </div>
        </section>
    );
}

export default ReviewsSection;

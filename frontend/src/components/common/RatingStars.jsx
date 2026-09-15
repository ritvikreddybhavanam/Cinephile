function RatingStars({ rating = 0, max = 5 }) {
    return (
        <div className="rating-stars" aria-label={`${rating} out of ${max} stars`}>
            {Array.from({ length: max }, (_, index) => (
                <span
                    key={index}
                    className={`material-symbols-outlined ${
    index < rating ? "filled" : "empty"
}`}
                >
                    star
                </span>
            ))}
        </div>
    );
}

export default RatingStars;

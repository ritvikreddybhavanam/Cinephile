function CommunityRating({ movie }) {
    const ratingDistribution = [
        { rating: 5, percentage: 65 },
        { rating: 4, percentage: 25 },
    ];

    return (
        <div className="community-rating">
            <h3>
                <span className="material-symbols-outlined">
                    star
                </span>

                Community Score
            </h3>

            <div className="score">
                <span className="score-number">
                    {movie.rating}
                </span>

                <span className="score-total">
                    / 10
                </span>
            </div>

            <div className="rating-bars">
                {ratingDistribution.map((item) => (
                    <div
                        className="rating-bar-row"
                        key={item.rating}
                    >
                        <span>{item.rating}</span>

                        <div className="rating-bar">
                            <div
                                style={{
                                    width: `${item.percentage}%`,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="rating-count">
                Based on{" "}
                {movie.reviewCount.toLocaleString()} reviews
            </div>
        </div>
    );
}

export default CommunityRating;


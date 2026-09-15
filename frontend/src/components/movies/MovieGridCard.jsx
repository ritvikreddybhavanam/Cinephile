import React from "react";
import MovieRating from "../common/MovieRating.jsx";

function MovieGridCard({ movie }) {

    const handleFavorite = () => {
        console.log(`Added ${movie.title} to favorites`);
    };

    const handleWatchlist = () => {
        console.log(`Added ${movie.title} to watchlist`);
    };

    return (
        <article className="ranked-card">

            <div className="poster-container">

                {movie.image ? (
                    <img
                        src={movie.image}
                        alt={movie.title}
                    />
                ) : (
                    <div className="poster-placeholder">
                        <span className="material-symbols-outlined">
                            movie
                        </span>
                    </div>
                )}

                <div className="poster-gradient"></div>

                {/* Rank */}
                <div className="rank-badge">
                    #{movie.rank}
                </div>

                {/* Trending Indicator */}
                {movie.trendIcon && (
                    <div className="trend-icon">
                        <span className="material-symbols-outlined">
                            {movie.trendIcon}
                        </span>
                    </div>
                )}

                {/* Hover Actions */}
                <div className="hover-actions">

                    <button
                        onClick={handleFavorite}
                        aria-label={`Favorite ${movie.title}`}
                    >
                        <span className="material-symbols-outlined">
                            favorite
                        </span>
                    </button>

                    <button
                        onClick={handleWatchlist}
                        aria-label={`Add ${movie.title} to watchlist`}
                    >
                        <span className="material-symbols-outlined">
                            add
                        </span>
                    </button>

                </div>

            </div>

            {/* Movie Information */}
            <div className="ranked-info">

                <h4>
                    {movie.title}
                </h4>

                <div className="ranked-meta">
                    {movie.year} • {movie.genre}
                </div>

                <MovieRating
                    rating={movie.rating}
                    reviews={movie.reviews}
                />

            </div>

        </article>
    );
}

export default MovieGridCard;

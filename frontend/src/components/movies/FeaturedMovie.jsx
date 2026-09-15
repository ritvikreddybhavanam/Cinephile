import React from "react";

const FeaturedMovie = ({ movie, onWatchlist, onDetails }) => {
    return (
        <section className="featured-hero">
            <div className="featured-background">
                <img
                    src={movie.image}
                    alt={movie.title}
                />

                <div className="hero-overlay" />
            </div>

            <div className="featured-content">
                <div className="featured-badges">

          <span className="badge-chip">
            🎬 {movie.genre}
          </span>

                    <span className="badge-chip">
            📅 {movie.year}
          </span>

                    <span className="badge-chip">
            <span className="cyan-dot" />
                        {movie.duration}
          </span>

                    <span className="quality-badge">
            {movie.quality}
          </span>

                    <span className="rating-badge">
            ★ {movie.rating} Buff Score
          </span>

                </div>

                <h1>{movie.title}</h1>

                <p className="featured-description">
                    {movie.synopsis}
                </p>

                <div className="featured-actions">

                    <button className="primary-button">
                        ▶
                        <span>Watch Trailer</span>
                    </button>

                    <button
                        className="secondary-button"
                        onClick={() => onWatchlist?.(movie)}
                    >
                        +
                        <span>Add to Watchlist</span>
                    </button>

                    <button
                        className="details-button"
                        onClick={() => onDetails?.(movie)}
                    >
                        <span>Film Specs & Cast</span>
                        →
                    </button>

                </div>
            </div>
        </section>
    );
};

export default FeaturedMovie;
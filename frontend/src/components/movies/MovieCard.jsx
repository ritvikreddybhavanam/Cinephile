import React from "react";

const MovieCard = ({ movie, onSelect }) => {
    const genreText = movie.genres.join("/");

    return (
        <article
            className="movie-card"
            onClick={() => onSelect?.(movie)}
        >
            <div className="movie-poster-wrapper">
                <img
                    src={movie.image}
                    alt={`${movie.title} poster`}
                    className="movie-poster"
                    loading="lazy"
                />

                <div
                    className={`movie-rating ${
                        movie.rating >= 8 ? "rating-high" : "rating-normal"
                    }`}
                >
                    ★ {movie.rating.toFixed(1)}
                </div>

                <div className="movie-hover-overlay">
                    <button
                        className="quick-details-button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onSelect?.(movie);
                        }}
                    >
                        Quick Details
                    </button>
                </div>
            </div>

            <div className="movie-card-info">
                <h3>{movie.title}</h3>

                <p>
                    {genreText} • {movie.year}
                </p>
            </div>
        </article>
    );
};

export default MovieCard;
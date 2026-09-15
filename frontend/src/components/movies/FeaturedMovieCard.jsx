import React from "react";
import MovieRating from "../common/MovieRating.jsx";
import WatchlistButton from "./WatchlistButton";

function FeaturedMovieCard({ movie }) {

    const handleTrailer = () => {
        console.log(`Opening trailer for ${movie.title}`);
    };

    return (
        <article
            className="featured-movie"
            style={{
                backgroundImage: `url("${movie.image}")`,
            }}
        >
            <div className="featured-gradient"></div>

            {/* Ranking */}
            <div className="rank-large">
                {String(movie.rank).padStart(2, "0")}
            </div>

            {/* Movie Content */}
            <div className="featured-content">

                <div className="featured-info">

                    <div className="movie-meta">

                        <span className="genre-badge">
                            {movie.genre}
                        </span>

                        <span>
                            {movie.year}
                        </span>

                        <MovieRating
                            rating={movie.rating}
                        />

                    </div>

                    <h2>
                        {movie.title}
                    </h2>

                    <p>
                        {movie.description}
                    </p>

                </div>

                <div className="featured-actions">

                    <WatchlistButton />

                    <button
                        className="trailer-button"
                        onClick={handleTrailer}
                    >
                        Trailer
                    </button>

                </div>

            </div>
        </article>
    );
}

export default FeaturedMovieCard;

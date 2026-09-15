import React from "react";
import MovieRating from "../common/MovieRating.jsx";
import WatchlistButton from "./WatchlistButton";

function TrendingMovieCard({ movie }) {

    return (
        <article
            className="secondary-movie"
            style={{
                backgroundImage: `url("${movie.image}")`,
            }}
        >
            <div className="secondary-gradient"></div>

            {/* Rank */}
            <div className="rank-medium">
                {String(movie.rank).padStart(2, "0")}
            </div>

            {/* Content */}
            <div className="secondary-content">

                <div className="secondary-meta">

                    <span>
                        {movie.year} • {movie.genre}
                    </span>

                    <MovieRating
                        rating={movie.rating}
                    />

                </div>

                <h3>
                    {movie.title}
                </h3>

                <WatchlistButton variant="small" />

            </div>

        </article>
    );
}

export default TrendingMovieCard;

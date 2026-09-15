import { useState } from "react";
import CommunityRating from "./CommunityRating";

function MovieHero({ movie }) {
    const [watchlisted, setWatchlisted] = useState(false);

    return (
        <section className="movie-hero">
            <div
                className="movie-hero-background"
                style={{
                    backgroundImage: `url("${movie.backdrop}")`,
                }}
            />

            <div className="movie-hero-overlay" />

            <div className="movie-hero-content">
                <div className="movie-hero-info">
                    <div className="movie-meta">
                        <span className="genre-badge">
                            {movie.genre}
                        </span>

                        <span>{movie.year}</span>

                        <span className="duration">
                            <span className="material-symbols-outlined">
                                schedule
                            </span>

                            {movie.duration}
                        </span>
                    </div>

                    <h1>{movie.title}</h1>

                    <p>{movie.description}</p>

                    <div className="movie-actions">
                        <button className="primary-button">
                            <span className="material-symbols-outlined">
                                play_arrow
                            </span>

                            Trailer
                        </button>

                        <button
                            className="secondary-button"
                            onClick={() =>
                                setWatchlisted(!watchlisted)
                            }
                        >
                            <span className="material-symbols-outlined">
                                {watchlisted
                                    ? "check"
                                    : "add"}
                            </span>

                            {watchlisted
                                ? "Watchlisted"
                                : "Watchlist"}
                        </button>
                    </div>
                </div>

                <CommunityRating movie={movie} />
            </div>
        </section>
    );
}

export default MovieHero;

import React from "react";

function MovieRating({ rating, reviews }) {
    return (
        <div className="movie-rating">
            <span className="material-symbols-outlined filled">
                star
            </span>

            <span>{rating}</span>

            {reviews && (
                <span className="review-count">
                    ({reviews})
                </span>
            )}
        </div>
    );
}

export default MovieRating;

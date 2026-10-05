import React from "react";

function MovieRating({ rating, reviews }) {
    return (
        <div className="inline-flex items-center gap-1 text-xs">
            <span
                className="material-symbols-outlined text-[14px] text-accent"
                style={{ fontVariationSettings: "'FILL' 1" }}
            >
                star
            </span>

            <span className="font-semibold text-text">{rating}</span>

            {reviews && (
                <span className="text-text-3 text-[11px]">
                    ({reviews})
                </span>
            )}
        </div>
    );
}

export default MovieRating;

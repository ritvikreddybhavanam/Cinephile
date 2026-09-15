import React from "react";

function WatchlistButton({
    variant = "default",
    onClick,
}) {
    return (
        <button
            className={`watchlist-btn watchlist-btn-${variant}`}
            onClick={onClick}
        >
            <span className="material-symbols-outlined">
                add
            </span>

            Watchlist
        </button>
    );
}

export default WatchlistButton;

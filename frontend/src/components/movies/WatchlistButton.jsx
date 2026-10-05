import React from "react";

function WatchlistButton({
    variant = "default",
    onClick,
}) {
    return (
        <button
            type="button"
            className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5"
            onClick={onClick}
        >
            <span className="material-symbols-outlined text-[16px]">
                add
            </span>
            <span>Queue</span>
        </button>
    );
}

export default WatchlistButton;

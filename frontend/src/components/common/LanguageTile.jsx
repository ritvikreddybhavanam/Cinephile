import { useState } from "react";
import { Link } from "react-router-dom";

function LanguageTile({ title, to, imageUrl, subtitle }) {
    const [imgError, setImgError] = useState(false);

    return (
        <Link
            to={to}
            className="group relative block aspect-[3/4] w-full overflow-hidden rounded-xl border border-border bg-surface-2 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-card-hover no-underline"
        >
            {imageUrl && !imgError ? (
                <img
                    src={imageUrl}
                    alt={title}
                    loading="lazy"
                    onError={() => setImgError(true)}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-surface to-surface-2 p-3 text-center">
                    <span className="material-symbols-outlined text-4xl text-accent/30 group-hover:text-accent/60 transition-colors mb-2">
                        movie
                    </span>
                    <span className="text-xs text-text-3 line-clamp-1">{title}</span>
                </div>
            )}

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent opacity-95 transition-opacity group-hover:opacity-85" />

            <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 flex flex-col justify-end">
                <span className="font-serif text-sm sm:text-base font-semibold tracking-tight text-text group-hover:text-accent transition-colors block truncate">
                    {title}
                </span>
                {subtitle && (
                    <span className="text-[11px] text-text-3 group-hover:text-accent/90 transition-colors block truncate mt-0.5 font-medium">
                        {subtitle}
                    </span>
                )}
            </div>
        </Link>
    );
}

export default LanguageTile;
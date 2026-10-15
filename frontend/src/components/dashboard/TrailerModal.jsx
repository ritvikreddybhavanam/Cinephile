import { useEffect } from "react";

export default function TrailerModal({ isOpen, onClose, trailerKey, movieTitle }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label={`${movieTitle} Trailer`}
        >
            <div
                className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-surface-2/60">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-accent text-[20px]">
                            play_circle
                        </span>
                        <h3 className="font-serif text-base sm:text-lg font-semibold text-text truncate max-w-md">
                            {movieTitle} — Official Trailer
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1.5 text-text-3 hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
                        aria-label="Close trailer"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Video Iframe Container */}
                <div className="relative aspect-video w-full bg-black">
                    {trailerKey ? (
                        <iframe
                            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
                            title={`${movieTitle} Official Trailer`}
                            className="absolute inset-0 h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center text-center p-6 text-text-3">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">
                                videocam_off
                            </span>
                            <p className="text-sm">Trailer unavailable for this title.</p>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between px-5 py-3 bg-surface text-xs text-text-3 border-t border-border/60">
                    <span>Press <kbd className="font-mono px-1.5 py-0.5 rounded border border-border bg-surface-2 text-[10px]">ESC</kbd> to close</span>
                    {trailerKey && (
                        <a
                            href={`https://www.youtube.com/watch?v=${trailerKey}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-accent hover:underline font-medium"
                        >
                            <span>Watch on YouTube</span>
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

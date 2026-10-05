function RatingSelector({ rating, onChange }) {
    return (
        <div className="bg-surface border border-border rounded-lg p-5 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <label className="label-caps mb-1 block">Your Rating</label>
                    <span className="text-sm text-text-3">
                        Score this film on the Cinephile scale
                    </span>
                </div>

                <div className="flex items-center gap-3 bg-bg border border-border px-4 py-2.5 rounded-lg self-start sm:self-auto">
                    <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 4.5].map((value) => (
                            <button
                                key={value}
                                type="button"
                                aria-label={`${value} star${value !== 1 ? "s" : ""}`}
                                onClick={() => onChange(value)}
                                className="hover:scale-110 transition-transform"
                            >
                                <span
                                    className="material-symbols-outlined text-[26px]"
                                    style={{
                                        fontVariationSettings: "'FILL' 1",
                                        color: value <= rating
                                            ? "var(--color-accent)"
                                            : "var(--color-border)",
                                    }}
                                >
                                    {value === 4.5 && rating >= 4.5 ? "star_half" : "star"}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-baseline gap-1 pl-2 text-xl text-text font-semibold">
                        <span>{rating.toFixed(1)}</span>
                        <span className="text-xs text-text-3 font-normal">/ 5.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RatingSelector;

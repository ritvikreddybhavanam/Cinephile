function RatingSelector({ rating, onChange }) {
    return (
        <div className="bg-[#181c20] rounded-xl p-5 md:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <label className="text-xs tracking-wider text-[#99AABB] uppercase block">
                        Your Critical Rating
                    </label>

                    <span className="text-sm leading-5 text-[#99AABB]">
                        Score this motion picture on our Cinephile 🎬 scale
                    </span>
                </div>

                <div className="flex items-center gap-3 bg-[#0B0D0F] px-4 py-2.5 rounded-xl self-start sm:self-auto">
                    <div className="flex items-center gap-1 text-[#FFCC00]">
                        {[1, 2, 3, 4, 4.5].map((value) => (
                            <button
                                key={value}
                                type="button"
                                aria-label={`${value} star`}
                                onClick={() => onChange(value)}
                                className={`hover:scale-110 transition-transform ${
    value > rating ? "opacity-40" : ""
}`}
                            >
                                <span
                                    className="material-symbols-outlined text-[26px]"
                                    style={{
                                        fontVariationSettings: "'FILL' 1",
                                    }}
                                >
                                    {value === 4.5 && rating >= 4.5
                                        ? "star_half"
                                        : "star"}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-baseline gap-1 pl-2 text-xl text-white font-bold">
                        <span>{rating.toFixed(1)}</span>

                        <span className="text-xs tracking-wider text-[#99AABB] font-normal">
                            / 5.0
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RatingSelector;

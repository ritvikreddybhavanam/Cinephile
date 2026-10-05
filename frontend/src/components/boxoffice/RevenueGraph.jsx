const RevenueGraph = () => {
    return (
        <div className="pt-6 bg-surface border border-border rounded-lg p-4 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="label-caps">
                    Projected 10-Week Cumulative Run Progression vs Standard Curve
                </div>

                <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-accent font-medium">
                        <span className="w-3 h-1 bg-accent rounded-full" />
                        Projected Forecast
                    </span>

                    <span className="flex items-center gap-1.5 text-text-3 font-medium">
                        <span className="w-3 h-1 bg-text-3 rounded-full opacity-60" />
                        Genre Median
                    </span>
                </div>
            </div>

            <div className="w-full h-32">
                <svg
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                    viewBox="0 0 800 120"
                >
                    <line
                        stroke="var(--color-border, #262A34)"
                        strokeWidth="1"
                        x1="0"
                        x2="800"
                        y1="120"
                        y2="120"
                    />

                    <line
                        stroke="var(--color-border, #262A34)"
                        strokeDasharray="4,4"
                        strokeWidth="0.75"
                        x1="0"
                        x2="800"
                        y1="80"
                        y2="80"
                    />

                    <line
                        stroke="var(--color-border, #262A34)"
                        strokeDasharray="4,4"
                        strokeWidth="0.75"
                        x1="0"
                        x2="800"
                        y1="40"
                        y2="40"
                    />

                    <polygon
                        fill="var(--color-accent, #C9A86A)"
                        fillOpacity="0.12"
                        points="0,115 80,85 160,55 260,35 380,24 520,18 660,14 800,12 800,28 660,32 520,38 380,45 260,58 160,78 80,102 0,118"
                    />

                    <path
                        d="M 0,118 Q 150,75 320,55 T 800,42"
                        fill="none"
                        stroke="var(--color-text-3, #6E6B65)"
                        strokeWidth="2"
                    />

                    <path
                        d="M 0,116 Q 160,65 340,36 T 800,16"
                        fill="none"
                        stroke="var(--color-accent, #C9A86A)"
                        strokeWidth="2.5"
                    />

                    <circle cx="0" cy="116" fill="var(--color-accent, #C9A86A)" r="4" />
                    <circle cx="160" cy="65" fill="var(--color-accent, #C9A86A)" r="4" />
                    <circle cx="340" cy="36" fill="var(--color-accent, #C9A86A)" r="4" />
                    <circle cx="800" cy="16" fill="var(--color-accent, #C9A86A)" r="4.5" />
                </svg>
            </div>

            <div className="flex justify-between text-xs text-text-3 mt-3 pt-2 border-t border-border overflow-x-auto gap-5">
                <span>W1: $165M</span>
                <span>W2: $310M</span>
                <span>W3: $425M</span>
                <span>W5: $530M</span>
                <span>W7: $598M</span>
                <span className="text-accent font-semibold">
                    W10: $642.8M Final
                </span>
            </div>
        </div>
    );
};

export default RevenueGraph;

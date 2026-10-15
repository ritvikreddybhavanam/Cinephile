import { Link } from "react-router-dom";

export default function CinemaStatsCards({ stats = {}, loading = false }) {
    const items = [
        {
            id: "watched",
            label: "Movies Watched",
            value: stats.watchedCount ?? 0,
            icon: "visibility",
            href: "/mywatchedfilms",
            accentClass: "text-accent",
            bgHover: "hover:border-accent/40",
            tooltip: "Total films marked as watched",
        },
        {
            id: "rated",
            label: "Movies Rated",
            value: stats.ratedCount ?? 0,
            icon: "star",
            href: "/diary",
            accentClass: "text-amber-400",
            bgHover: "hover:border-amber-400/40",
            tooltip: "Total films with personal ratings",
        },
        {
            id: "reviews",
            label: "Reviews Written",
            value: stats.reviewsCount ?? 0,
            icon: "rate_review",
            href: "/myreviews",
            accentClass: "text-rose-400",
            bgHover: "hover:border-rose-400/40",
            tooltip: "Full reviews written by you",
        },
        {
            id: "watchlist",
            label: "Watchlist",
            value: stats.watchlistCount ?? 0,
            icon: "bookmark",
            href: "/watchlist",
            accentClass: "text-emerald-400",
            bgHover: "hover:border-emerald-400/40",
            tooltip: "Films saved to watch later",
        },
    ];

    const formattedTime = stats.totalHoursWatched
        ? `${Math.round(stats.totalHoursWatched)}h ${Math.round((stats.totalMinutesWatched || 0) % 60)}m`
        : null;

    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-serif text-lg font-semibold text-text">Cinema Stats</span>
                    {formattedTime && !loading && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-surface px-2.5 py-0.5 text-[11px] font-mono text-accent">
                            <span className="material-symbols-outlined text-[13px]">schedule</span>
                            {formattedTime} logged
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {items.map((item) => (
                    <Link
                        key={item.id}
                        to={item.href}
                        className={`group relative flex flex-col justify-between rounded-xl border border-border bg-surface p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card ${item.bgHover} no-underline`}
                    >
                        <div className="flex items-center justify-between text-text-3 mb-3">
                            <span className="text-[11px] font-medium uppercase tracking-wider text-text-3 group-hover:text-text-2 transition-colors">
                                {item.label}
                            </span>
                            <span className={`material-symbols-outlined text-[18px] sm:text-[20px] ${item.accentClass} opacity-80 group-hover:opacity-100 transition-opacity`}>
                                {item.icon}
                            </span>
                        </div>

                        <div>
                            {loading ? (
                                <div className="h-8 w-14 skeleton rounded" />
                            ) : (
                                <div className="font-serif text-2xl sm:text-3xl font-semibold text-text tracking-tight">
                                    {Number(item.value).toLocaleString()}
                                </div>
                            )}
                            <span className="mt-1 flex items-center gap-0.5 text-[11px] text-text-3 group-hover:text-accent transition-colors">
                                <span>View records</span>
                                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

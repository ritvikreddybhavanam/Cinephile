import { useState } from "react";

const REGIONS = [
    { code: "US", name: "United States", flag: "🇺🇸" },
    { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
    { code: "IN", name: "India", flag: "🇮🇳" },
    { code: "CA", name: "Canada", flag: "🇨🇦" },
    { code: "AU", name: "Australia", flag: "🇦🇺" },
    { code: "DE", name: "Germany", flag: "🇩🇪" },
    { code: "FR", name: "France", flag: "🇫🇷" },
    { code: "JP", name: "Japan", flag: "🇯🇵" },
];

function WatchProviders({ watchProviders }) {
    const [selectedRegion, setSelectedRegion] = useState("IN");

    const regionData = watchProviders?.results?.[selectedRegion] || null;
    const streamingProviders = regionData?.flatrate || [];
    const rentProviders = regionData?.rent || [];
    const buyProviders = regionData?.buy || [];
    const justWatchLink = regionData?.link || "https://www.justwatch.com";

    const getProviderLink = (provider) => {
        const name = provider.provider_name?.toLowerCase() || "";
        if (name.includes("netflix")) return "https://www.netflix.com/";
        if (name.includes("prime") || name.includes("amazon")) return "https://www.primevideo.com/";
        if (name.includes("disney") || name.includes("hotstar")) return "https://www.disneyplus.com/";
        if (name.includes("apple")) return "https://tv.apple.com/";
        if (name.includes("hbo") || name.includes("max")) return "https://www.max.com/";
        if (name.includes("youtube")) return "https://www.youtube.com/";
        return justWatchLink;
    };

    const renderProvider = (provider, type) => {
        const providerLink = getProviderLink(provider);
        const content = (
            <>
                {provider.logo_path ? (
                    <img
                        src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                        alt={provider.provider_name}
                        className="w-8 h-8 rounded-lg object-cover shadow-xs"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-[10px] text-text-3 font-bold">
                        OTT
                    </div>
                )}
                <span className="text-xs font-semibold text-text group-hover:text-accent transition-colors">
                    {provider.provider_name}
                </span>
            </>
        );

        const key = `${type}-${provider.provider_id}`;

        return (
            <a
                key={key}
                href={providerLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 bg-surface-2/70 hover:bg-surface-2 border border-border/80 hover:border-accent/40 rounded-xl px-3 py-2 transition-all cursor-pointer no-underline shadow-xs"
            >
                {content}
            </a>
        );
    };

    const hasProviders =
        streamingProviders.length > 0 ||
        rentProviders.length > 0 ||
        buyProviders.length > 0;

    return (
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-10 md:pb-14">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-accent mb-1">Streaming Availability</p>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-text">Where to Watch</h2>
                </div>

                {/* Country Region Selector */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-text-3 font-medium">Region:</span>
                    <select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text outline-none focus:border-accent"
                    >
                        {REGIONS.map((r) => (
                            <option key={r.code} value={r.code}>
                                {r.flag} {r.name} ({r.code})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {regionData ? (
                <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                    {/* STREAMING */}
                    {streamingProviders.length > 0 && (
                        <div>
                            <h3 className="text-xs uppercase tracking-wider font-bold text-text-3 mb-3 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-accent text-base">play_circle</span>
                                Stream
                            </h3>
                            <div className="flex flex-wrap gap-2.5">
                                {streamingProviders.map((provider) =>
                                    renderProvider(provider, "stream")
                                )}
                            </div>
                        </div>
                    )}

                    {/* RENT */}
                    {rentProviders.length > 0 && (
                        <div>
                            <h3 className="text-xs uppercase tracking-wider font-bold text-text-3 mb-3 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-text-3 text-base">schedule</span>
                                Rent
                            </h3>
                            <div className="flex flex-wrap gap-2.5">
                                {rentProviders.map((provider) =>
                                    renderProvider(provider, "rent")
                                )}
                            </div>
                        </div>
                    )}

                    {/* BUY */}
                    {buyProviders.length > 0 && (
                        <div>
                            <h3 className="text-xs uppercase tracking-wider font-bold text-text-3 mb-3 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-text-3 text-base">shopping_bag</span>
                                Buy
                            </h3>
                            <div className="flex flex-wrap gap-2.5">
                                {buyProviders.map((provider) =>
                                    renderProvider(provider, "buy")
                                )}
                            </div>
                        </div>
                    )}

                    {!hasProviders && (
                        <p className="text-xs text-text-3 text-center py-4">
                            No streaming distribution information available in this territory.
                        </p>
                    )}

                    <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-text-3">
                        <span>Streaming data provided by <strong>JustWatch</strong> via TMDB.</span>
                        <a
                            href={justWatchLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                        >
                            View on JustWatch ↗
                        </a>
                    </div>
                </div>
            ) : (
                <div className="bg-surface border border-border rounded-2xl p-6 text-center text-xs text-text-3">
                    No streaming distribution options listed for this selected region.
                </div>
            )}
        </section>
    );
}

export default WatchProviders;
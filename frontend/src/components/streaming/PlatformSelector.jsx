import { useEffect, useState } from "react";
import { getAvailableWatchProviders } from "../../services/movieService";

export const REGIONS = [
    { code: "IN", name: "India", flag: "🇮🇳" },
    { code: "US", name: "United States", flag: "🇺🇸" },
    { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
    { code: "CA", name: "Canada", flag: "🇨🇦" },
    { code: "AU", name: "Australia", flag: "🇦🇺" }
];

export const REGIONAL_FALLBACK_PROVIDERS = {
    IN: [
        { provider_id: 8, provider_name: "Netflix", logo_path: "/rK1KljqmbvO9HQa1PBFLILWah72.png" },
        { provider_id: 119, provider_name: "Amazon Prime Video", logo_path: "/gMZdpavHmxFNnLpMHwVxfqeux2g.png" },
        { provider_id: 2336, provider_name: "JioHotstar", logo_path: "/ledoS6EgdjTNq8F1e6wubUQer18.png" },
        { provider_id: 350, provider_name: "Apple TV+", logo_path: "/9icYBfYFcwgCbky5VdGUIKJ4C5i.png" },
        { provider_id: 232, provider_name: "ZEE5", logo_path: "/5NyLm42TmCqCMOZFv249srCqK7z.jpg" },
        { provider_id: 237, provider_name: "Sony LIV", logo_path: "/edg2H1PZzQe7kZ8l0f6Z0Bw51rV.jpg" },
        { provider_id: 220, provider_name: "JioCinema", logo_path: "/1VbE6U2bZ9vK7h2M3b1q2A4yB8.jpg" },
        { provider_id: 122, provider_name: "Disney+ Hotstar", logo_path: "/7rwSXluNWZAlJn243k102z6XW0d.jpg" },
        { provider_id: 387, provider_name: "Lionsgate Play", logo_path: "/40s9bX2j9wEaQ07r1L3lQ5w2y1J.jpg" }
    ],
    US: [
        { provider_id: 8, provider_name: "Netflix", logo_path: "/rK1KljqmbvO9HQa1PBFLILWah72.png" },
        { provider_id: 9, provider_name: "Amazon Prime Video", logo_path: "/gMZdpavHmxFNnLpMHwVxfqeux2g.png" },
        { provider_id: 337, provider_name: "Disney+", logo_path: "/7rwSXluNWZAlJn243k102z6XW0d.jpg" },
        { provider_id: 350, provider_name: "Apple TV+", logo_path: "/9icYBfYFcwgCbky5VdGUIKJ4C5i.png" },
        { provider_id: 1899, provider_name: "Max", logo_path: "/6uhKBfmtzFqOcLoulGbZoxbpRaQ.jpg" },
        { provider_id: 15, provider_name: "Hulu", logo_path: "/zxrVdFjIjLqkfnwyghn2XuafNDD.jpg" },
        { provider_id: 531, provider_name: "Paramount+", logo_path: "/xbhGlaFLBC24e4vgM1sX2ZtqObe.jpg" },
        { provider_id: 386, provider_name: "Peacock", logo_path: "/g1e16tTqS1xdP4Y7x3U8N30v74l.jpg" }
    ],
    GB: [
        { provider_id: 8, provider_name: "Netflix", logo_path: "/rK1KljqmbvO9HQa1PBFLILWah72.png" },
        { provider_id: 9, provider_name: "Amazon Prime Video", logo_path: "/gMZdpavHmxFNnLpMHwVxfqeux2g.png" },
        { provider_id: 337, provider_name: "Disney+", logo_path: "/7rwSXluNWZAlJn243k102z6XW0d.jpg" },
        { provider_id: 350, provider_name: "Apple TV+", logo_path: "/9icYBfYFcwgCbky5VdGUIKJ4C5i.png" },
        { provider_id: 39, provider_name: "NOW", logo_path: "/nALbV2T87B1gZ95yO1gR8kF.jpg" },
        { provider_id: 531, provider_name: "Paramount+", logo_path: "/xbhGlaFLBC24e4vgM1sX2ZtqObe.jpg" }
    ],
    CA: [
        { provider_id: 8, provider_name: "Netflix", logo_path: "/rK1KljqmbvO9HQa1PBFLILWah72.png" },
        { provider_id: 119, provider_name: "Amazon Prime Video", logo_path: "/gMZdpavHmxFNnLpMHwVxfqeux2g.png" },
        { provider_id: 337, provider_name: "Disney+", logo_path: "/7rwSXluNWZAlJn243k102z6XW0d.jpg" },
        { provider_id: 350, provider_name: "Apple TV+", logo_path: "/9icYBfYFcwgCbky5VdGUIKJ4C5i.png" },
        { provider_id: 230, provider_name: "Crave", logo_path: "/7qjCkW9x0eP3lK9g.jpg" },
        { provider_id: 531, provider_name: "Paramount+", logo_path: "/xbhGlaFLBC24e4vgM1sX2ZtqObe.jpg" }
    ],
    AU: [
        { provider_id: 8, provider_name: "Netflix", logo_path: "/rK1KljqmbvO9HQa1PBFLILWah72.png" },
        { provider_id: 119, provider_name: "Amazon Prime Video", logo_path: "/gMZdpavHmxFNnLpMHwVxfqeux2g.png" },
        { provider_id: 337, provider_name: "Disney+", logo_path: "/7rwSXluNWZAlJn243k102z6XW0d.jpg" },
        { provider_id: 350, provider_name: "Apple TV+", logo_path: "/9icYBfYFcwgCbky5VdGUIKJ4C5i.png" },
        { provider_id: 21, provider_name: "Stan", logo_path: "/9A0n5Z0k5B6w.jpg" },
        { provider_id: 385, provider_name: "BINGE", logo_path: "/t6N1KjF5o6V3e.jpg" },
        { provider_id: 531, provider_name: "Paramount+", logo_path: "/xbhGlaFLBC24e4vgM1sX2ZtqObe.jpg" }
    ]
};

export default function PlatformSelector({
    selectedRegion,
    onRegionChange,
    selectedProviderIds,
    onToggleProvider,
    onSelectAllProviders,
    onClearProviders,
    matchingMode,
    onMatchingModeChange
}) {
    const [providers, setProviders] = useState(REGIONAL_FALLBACK_PROVIDERS[selectedRegion] || REGIONAL_FALLBACK_PROVIDERS.IN);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        getAvailableWatchProviders(selectedRegion)
            .then((data) => {
                if (!isMounted) return;
                const apiResults = data?.results || [];
                if (apiResults.length > 0) {
                    // Filter down to the prominent platforms to keep selector high quality
                    const fallbackList = REGIONAL_FALLBACK_PROVIDERS[selectedRegion] || REGIONAL_FALLBACK_PROVIDERS.IN;
                    const fallbackMap = new Map(fallbackList.map((p) => [p.provider_id, p]));

                    // Merge API results with fallbacks
                    const merged = fallbackList.map((f) => {
                        const fromApi = apiResults.find((a) => a.provider_id === f.provider_id);
                        return fromApi ? { ...f, ...fromApi } : f;
                    });
                    setProviders(merged);
                } else {
                    setProviders(REGIONAL_FALLBACK_PROVIDERS[selectedRegion] || REGIONAL_FALLBACK_PROVIDERS.IN);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setProviders(REGIONAL_FALLBACK_PROVIDERS[selectedRegion] || REGIONAL_FALLBACK_PROVIDERS.IN);
                }
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, [selectedRegion]);

    const isAllSelected = providers.length > 0 && providers.every((p) => selectedProviderIds.includes(p.provider_id));
    const selectedCount = selectedProviderIds.length;

    return (
        <section
            aria-label="Choose Your Streaming Platforms"
            className="rounded-3xl bg-surface border border-border p-5 sm:p-7 shadow-elevated"
        >
            {/* Top Bar: Title, Region Selector, Matching Mode */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-border">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-accent text-[20px]">tv</span>
                        <h2 className="text-lg sm:text-xl font-serif font-bold text-text">
                            Choose Your Streaming Platforms
                        </h2>
                        {selectedCount > 0 && (
                            <span className="ml-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-accent text-bg shadow-sm">
                                {selectedCount} {selectedCount === 1 ? "platform" : "platforms"} active
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-text-3">
                        Filter catalog across genuine streaming services available in your territory.
                    </p>
                </div>

                {/* Country / Region & Matching Controls */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Region Selector */}
                    <div className="flex items-center gap-2 bg-surface-2/80 border border-border rounded-xl px-3 py-1.5 shadow-inner">
                        <span className="text-xs text-text-3 font-medium">Territory:</span>
                        <select
                            value={selectedRegion}
                            onChange={(e) => onRegionChange(e.target.value)}
                            aria-label="Select streaming region"
                            className="bg-transparent text-xs font-semibold text-text focus:outline-none cursor-pointer"
                        >
                            {REGIONS.map((r) => (
                                <option key={r.code} value={r.code} className="bg-surface text-text">
                                    {r.flag} {r.name} ({r.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Matching Mode (Any vs All) */}
                    {selectedCount > 1 && (
                        <div
                            role="radiogroup"
                            aria-label="Platform matching mode"
                            className="flex items-center p-0.5 rounded-xl bg-surface-2 border border-border text-xs"
                        >
                            <button
                                type="button"
                                role="radio"
                                aria-checked={matchingMode === "any"}
                                onClick={() => onMatchingModeChange("any")}
                                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                                    matchingMode === "any"
                                        ? "bg-accent text-bg shadow-sm"
                                        : "text-text-3 hover:text-text"
                                }`}
                                title="Show movies available on at least one selected platform"
                            >
                                Any Selected (OR)
                            </button>
                            <button
                                type="button"
                                role="radio"
                                aria-checked={matchingMode === "all"}
                                onClick={() => onMatchingModeChange("all")}
                                className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                                    matchingMode === "all"
                                        ? "bg-accent text-bg shadow-sm"
                                        : "text-text-3 hover:text-text"
                                }`}
                                title="Show only movies available across every selected platform"
                            >
                                All Selected (AND)
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions (All Platforms vs Clear All) */}
            <div className="flex items-center justify-between mt-4 mb-4 text-xs">
                <span className="text-text-3">
                    Click to toggle individual services or use batch shortcuts:
                </span>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => onSelectAllProviders(providers.map((p) => p.provider_id))}
                        className={`font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                            isAllSelected
                                ? "text-accent bg-accent/15 border border-accent/30"
                                : "text-text-2 hover:text-accent bg-surface-2/60 border border-border"
                        }`}
                    >
                        All Platforms
                    </button>
                    {selectedCount > 0 && (
                        <button
                            type="button"
                            onClick={onClearProviders}
                            className="font-semibold px-2.5 py-1 rounded-lg text-text-3 hover:text-rose-400 bg-surface-2/60 border border-border transition-colors cursor-pointer"
                        >
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Platforms Logo Grid */}
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {providers.map((p) => {
                    const isSelected = selectedProviderIds.includes(p.provider_id);
                    return (
                        <button
                            key={p.provider_id}
                            type="button"
                            onClick={() => onToggleProvider(p.provider_id)}
                            aria-pressed={isSelected}
                            aria-label={`${p.provider_name} streaming service`}
                            className={`group relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 cursor-pointer text-center select-none ${
                                isSelected
                                    ? "bg-accent/15 border-accent text-accent shadow-[0_0_16px_rgba(0,224,84,0.2)] scale-[1.02]"
                                    : "bg-surface-2/70 border-border/70 hover:border-accent/40 text-text-2 hover:text-text hover:bg-surface-2"
                            }`}
                        >
                            {/* Selection Checkmark */}
                            <div
                                className={`absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full transition-all ${
                                    isSelected
                                        ? "bg-accent text-bg shadow-sm"
                                        : "border border-border/80 group-hover:border-accent/40"
                                }`}
                            >
                                {isSelected && (
                                    <span className="material-symbols-outlined text-[11px] font-black">
                                        check
                                    </span>
                                )}
                            </div>

                            {/* Logo */}
                            <div className="h-10 w-10 sm:h-12 sm:w-12 mb-2 rounded-xl overflow-hidden bg-bg/60 border border-border/60 shadow-sm flex items-center justify-center">
                                <img
                                    src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                                    alt={`${p.provider_name} logo`}
                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                    onError={(e) => {
                                        e.target.style.display = "none";
                                    }}
                                />
                            </div>

                            {/* Provider Name */}
                            <span className="text-xs font-semibold leading-tight line-clamp-1">
                                {p.provider_name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

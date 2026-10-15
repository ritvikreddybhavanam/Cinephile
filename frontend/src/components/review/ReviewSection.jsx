import { useMemo, useState } from "react";
import ReviewCard from "./ReviewCard";
import { getSpoilerVisibilityPreference, saveSpoilerVisibilityPreference } from "../../services/contentGuideService";

const INTENT_CONFIG = [
    { id: "all", label: "All", emoji: "" },
    { id: "deep_analysis", label: "Analysis", emoji: "🎓" },
    { id: "technical_craft", label: "Technical", emoji: "🎥" },
    { id: "general", label: "General", emoji: "💡" },
    { id: "quick_take", label: "Quick Takes", emoji: "⚡" },
    { id: "humor", label: "Humor", emoji: "😂" },
];

function ReviewSection({
    tmdbReviews,
    appReviews,
    sectionRef,
}) {
    // Purpose-based filter: 'all' | 'deep_analysis' | 'technical_craft' | 'general' | 'quick_take' | 'humor'
    const [intentFilter, setIntentFilter] = useState("all");
    
    // Quick noise reduction toggle
    const [hideHumorAndQuickTakes, setHideHumorAndQuickTakes] = useState(false);
    
    // Spoiler visibility: 'hide_blocks' (default) | 'hide_major' | 'show_all'
    const [spoilerVisibility, setSpoilerVisibility] = useState(getSpoilerVisibilityPreference());

    // Sorting: 'helpful' | 'recent' | 'popular' | 'rating_high'
    const [sortBy, setSortBy] = useState("recent");
    const [visibleCount, setVisibleCount] = useState(6);

    // Optional advanced filter: minimum words
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [minWordCount, setMinWordCount] = useState(0);

    const combinedReviews = useMemo(() => {
        const tmdb = Array.isArray(tmdbReviews)
            ? tmdbReviews.map((review) => ({
                ...review,
                source: "tmdb",
                reviewIntent: "general", // default for external TMDB reviews
            }))
            : [];

        const app = Array.isArray(appReviews)
            ? appReviews.map((review) => ({
                ...review,
                source: "app",
                reviewIntent: review.reviewIntent || "general",
            }))
            : [];

        return [...app, ...tmdb];
    }, [tmdbReviews, appReviews]);

    // Compute counts per intent category
    const intentCounts = useMemo(() => {
        const counts = {
            all: combinedReviews.length,
            deep_analysis: 0,
            technical_craft: 0,
            general: 0,
            quick_take: 0,
            humor: 0,
        };

        combinedReviews.forEach((r) => {
            const intent = r.reviewIntent || "general";
            if (counts[intent] !== undefined) {
                counts[intent]++;
            } else {
                counts.general++;
            }
        });

        return counts;
    }, [combinedReviews]);

    // Filter and Sort reviews based on intent and criteria (without equating length with quality)
    const processedReviews = useMemo(() => {
        let list = [...combinedReviews];

        // 1. Hide Humor & Quick Takes toggle
        if (hideHumorAndQuickTakes) {
            list = list.filter((r) => {
                const intent = r.reviewIntent || "general";
                return intent !== "humor" && intent !== "quick_take";
            });
        }

        // 2. Purpose Intent Filter
        if (intentFilter !== "all") {
            list = list.filter((r) => (r.reviewIntent || "general") === intentFilter);
        }

        // 3. Optional Minimum Word Count (under Advanced Filters)
        if (minWordCount > 0) {
            list = list.filter((r) => {
                const text = (r.content || r.review || "").trim();
                const count = text ? text.split(/\s+/).length : 0;
                return count >= minWordCount;
            });
        }

        // 4. Sorting
        list.sort((a, b) => {
            if (sortBy === "helpful" || sortBy === "popular") {
                // Weighted by likes and comments
                const scoreA = (Number(a.likesCount) || 0) * 2 + (Number(a.commentsCount) || 0);
                const scoreB = (Number(b.likesCount) || 0) * 2 + (Number(b.commentsCount) || 0);
                if (scoreB !== scoreA) {
                    return scoreB - scoreA;
                }
            } else if (sortBy === "rating_high") {
                const rA = a.rating ?? a.author_details?.rating ?? 0;
                const rB = b.rating ?? b.author_details?.rating ?? 0;
                if (rB !== rA) return rB - rA;
            }
            
            // default fallback: recent
            const dateA = new Date(a.source === "tmdb" ? a.created_at : (a.createdAt || a.reviewedDate)).getTime() || 0;
            const dateB = new Date(b.source === "tmdb" ? b.created_at : (b.createdAt || b.reviewedDate)).getTime() || 0;
            return dateB - dateA;
        });

        return list;
    }, [combinedReviews, intentFilter, hideHumorAndQuickTakes, minWordCount, sortBy]);

    const visibleReviews = processedReviews.slice(0, visibleCount);
    const hasMore = visibleCount < processedReviews.length;

    const loadMoreReviews = () => {
        setVisibleCount((previous) => previous + 6);
    };

    if (combinedReviews.length === 0) {
        return (
            <section
                ref={sectionRef}
                id="reviews"
                className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-10 md:pb-14 scroll-mt-24"
            >
                <div className="section-header mb-6">
                    <div>
                        <p className="label-caps mb-1">Critique</p>
                        <h2 className="section-title">Reviews</h2>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-surface p-10 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 border border-accent/20">
                        <span className="text-xl text-accent">★</span>
                    </div>

                    <h3 className="font-serif text-lg font-semibold text-text">
                        No Reviews Logged Yet
                    </h3>

                    <p className="mt-1 text-sm text-text-3">
                        Be the first to log a review and start the discussion for this film.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section
            ref={sectionRef}
            id="reviews"
            className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-10 md:pb-14 scroll-mt-24"
        >
            {/* Header with Title and Sorting */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 border-b border-border pb-4">
                <div>
                    <p className="label-caps mb-1">Critique & Discussion</p>
                    <h2 className="section-title">Reviews & Perspectives</h2>
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs text-text-3 font-mono">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-surface-2 border border-border rounded-lg px-2.5 py-1 text-xs text-text focus:outline-none focus:border-accent cursor-pointer"
                    >
                        <option value="recent">Most Recent</option>
                        <option value="helpful">Most Helpful</option>
                        <option value="popular">Most Popular</option>
                        <option value="rating_high">Highest Rated</option>
                    </select>
                </div>
            </div>

            {/* Purpose-based Filter Bar & Noise Filter Toggle */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
                {/* Intent Filter Pills: [All] [Analysis] [Technical] [General] [Quick Takes] [Humor] */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {INTENT_CONFIG.map((item) => {
                        const isSelected = intentFilter === item.id;
                        const count = intentCounts[item.id] || 0;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                    setIntentFilter(item.id);
                                    setVisibleCount(6);
                                }}
                                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                                    isSelected
                                        ? "bg-accent text-white shadow-md shadow-accent/20 font-semibold"
                                        : "bg-surface border border-border text-text-2 hover:bg-surface-2 hover:text-text"
                                }`}
                            >
                                {item.emoji && <span>{item.emoji}</span>}
                                <span>{item.label}</span>
                                <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                                    isSelected ? "bg-white/20 text-white" : "bg-bg text-text-3"
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Quick Toggle: "Hide Humor & Quick Takes" */}
                <div className="flex items-center gap-3 shrink-0 pt-1 md:pt-0">
                    <label className="inline-flex items-center gap-2 text-xs text-text-2 font-medium cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={hideHumorAndQuickTakes}
                            onChange={(e) => {
                                setHideHumorAndQuickTakes(e.target.checked);
                                setVisibleCount(6);
                            }}
                            className="rounded border-border text-accent focus:ring-accent cursor-pointer accent-accent"
                        />
                        <span>Hide Humor & Quick Takes</span>
                    </label>

                    {/* Subtle toggle for Advanced Filters */}
                    <button
                        type="button"
                        onClick={() => setShowAdvancedFilters((prev) => !prev)}
                        className={`text-[11px] transition-colors flex items-center gap-1 cursor-pointer ${
                            showAdvancedFilters || minWordCount > 0 ? "text-accent font-semibold" : "text-text-3 hover:text-text-2"
                        }`}
                        title="Toggle optional length filter"
                    >
                        <span className="material-symbols-outlined text-[14px]">tune</span>
                        <span>Filters {minWordCount > 0 ? `(${minWordCount}+ words)` : ""}</span>
                    </button>
                </div>
            </div>

            {/* Optional Collapsible Advanced Filters */}
            {showAdvancedFilters && (
                <div className="mb-5 p-4 rounded-xl bg-surface-2 border border-border/70 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                    {/* Minimum Length */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-text-3 font-medium">Minimum Length:</span>
                        {[
                            { label: "Any Length", value: 0 },
                            { label: "50+ words", value: 50 },
                            { label: "150+ words", value: 150 },
                            { label: "300+ words", value: 300 },
                        ].map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setMinWordCount(opt.value)}
                                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
                                    minWordCount === opt.value
                                        ? "bg-accent/20 text-accent font-semibold border border-accent/30"
                                        : "bg-surface border border-border text-text-3 hover:text-text"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Spoiler Visibility */}
                    <div className="flex items-center gap-2">
                        <span className="text-text-3 font-medium">Spoiler Visibility:</span>
                        <select
                            value={spoilerVisibility}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSpoilerVisibility(val);
                                saveSpoilerVisibilityPreference(val);
                            }}
                            className="bg-surface border border-border rounded-lg px-2.5 py-1 text-xs text-text focus:outline-none focus:border-accent cursor-pointer"
                        >
                            <option value="hide_blocks">Hide Inline Spoilers (Default)</option>
                            <option value="hide_major">Hide Reviews with Major Spoilers</option>
                            <option value="show_all">Reveal All Spoilers</option>
                        </select>
                    </div>

                    {minWordCount > 0 && (
                        <button
                            type="button"
                            onClick={() => setMinWordCount(0)}
                            className="text-[11px] text-accent hover:underline cursor-pointer"
                        >
                            Reset filter
                        </button>
                    )}
                </div>
            )}

            {/* Reviews List */}
            {processedReviews.length === 0 ? (
                <div className="rounded-xl border border-border bg-surface p-8 text-center">
                    <p className="text-sm text-text-3">
                        No reviews found matching the selected intent filter.
                    </p>
                    {(intentFilter !== "all" || hideHumorAndQuickTakes || minWordCount > 0) && (
                        <button
                            type="button"
                            onClick={() => {
                                setIntentFilter("all");
                                setHideHumorAndQuickTakes(false);
                                setMinWordCount(0);
                            }}
                            className="mt-3 text-xs text-accent hover:underline cursor-pointer inline-block"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {visibleReviews.map((review, index) => (
                        <ReviewCard
                            key={`${review.source || "cinephile"}-${review.id}-${index}`}
                            review={review}
                        />
                    ))}
                </div>
            )}

            {hasMore && (
                <div className="mt-8 flex justify-center">
                    <button
                        type="button"
                        onClick={loadMoreReviews}
                        className="btn-secondary text-xs py-2.5 px-6 cursor-pointer"
                    >
                        Load More Reviews ↓
                    </button>
                </div>
            )}

            {!hasMore && processedReviews.length > 6 && (
                <p className="mt-8 text-center text-xs text-text-3">
                    You have reached the end of reviews for this filter.
                </p>
            )}
        </section>
    );
}

export default ReviewSection;


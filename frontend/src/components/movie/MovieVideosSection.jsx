import React, { useState, useMemo } from "react";
import OtherVideo from "./OtherVideo";

function MovieVideosSection({ videos = [], trailer, movieTitle, sectionRef }) {
    const videoList = Array.isArray(videos) ? videos : [];
    const [selectedCategory, setSelectedCategory] = useState("All");

    const categories = useMemo(() => {
        const set = new Set();
        videoList.forEach((v) => {
            if (v.type) set.add(v.type);
        });
        return ["All", ...Array.from(set)];
    }, [videoList]);

    const filteredVideos = useMemo(() => {
        if (selectedCategory === "All") return videoList;
        return videoList.filter((v) => v.type === selectedCategory);
    }, [videoList, selectedCategory]);

    const otherVideosList = useMemo(() => {
        return filteredVideos.filter(
            (v) => !trailer || v.key !== trailer.key
        );
    }, [filteredVideos, trailer]);

    if (videoList.length === 0 && !trailer) return null;

    return (
        <section
            ref={sectionRef}
            id="trailer"
            className="page-container py-10 md:py-14 scroll-mt-24"
        >
            <div className="section-header mb-6">
                <div>
                    <p className="label-caps mb-1">Media Archive</p>
                    <h2 className="section-title">Trailers & Featurettes</h2>
                </div>

                {/* Category Filter Pills */}
                {categories.length > 2 && (
                    <div className="flex flex-wrap items-center gap-1.5 p-1 bg-surface border border-border rounded-lg">
                        {categories.map((cat) => {
                            const count =
                                cat === "All"
                                    ? videoList.length
                                    : videoList.filter((v) => v.type === cat).length;
                            return (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                                        selectedCategory === cat
                                            ? "bg-accent text-bg font-semibold shadow-sm"
                                            : "text-text-3 hover:text-text"
                                    }`}
                                >
                                    {cat} ({count})
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Official Trailer Spotlight (Shown when All or Trailer tab selected, or if trailer matches) */}
            {trailer && (selectedCategory === "All" || selectedCategory === trailer.type) && (
                <div className="mb-8 overflow-hidden rounded-xl border border-border bg-surface shadow-elevated">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-surface-2/60">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-accent text-base">
                                play_circle
                            </span>
                            <span className="text-xs font-semibold text-text">
                                {trailer.name || "Official Trailer"}
                            </span>
                        </div>
                        <span className="badge badge-accent text-[10px]">
                            {trailer.type || "Trailer"}
                        </span>
                    </div>

                    <div className="aspect-video w-full">
                        <iframe
                            src={`https://www.youtube.com/embed/${trailer.key}?rel=0`}
                            title={`${movieTitle} Official Trailer`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}

            {/* Other Videos Grid */}
            {otherVideosList.length > 0 && (
                <div>
                    {trailer && (selectedCategory === "All" || selectedCategory === trailer.type) && (
                        <h3 className="text-sm font-semibold text-text-2 mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-base text-accent">
                                video_library
                            </span>
                            Additional Clips & Featurettes ({otherVideosList.length})
                        </h3>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {otherVideosList.map((video) => (
                            <OtherVideo
                                key={video.id || video.key}
                                video={video}
                                movieTitle={movieTitle}
                            />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

export default MovieVideosSection;

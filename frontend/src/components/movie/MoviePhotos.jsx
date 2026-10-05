import React, { useState, useEffect } from "react";
import { getPosterUrl } from "../../services/movieService";

function MoviePhotos({ images, movie, movieTitle }) {
    const rawBackdrops = images?.backdrops || [];
    const rawPosters = images?.posters || [];
    const rawLogos = images?.logos || [];

    const backdrops = rawBackdrops.length > 0
        ? rawBackdrops
        : movie?.backdrop_path
        ? [{ file_path: movie.backdrop_path, width: 1920, height: 1080 }]
        : [];

    const posters = rawPosters.length > 0
        ? rawPosters
        : movie?.poster_path
        ? [{ file_path: movie.poster_path, width: 1000, height: 1500 }]
        : [];

    const logos = rawLogos;

    const [activeTab, setActiveTab] = useState(
        backdrops.length > 0 ? "backdrops" : posters.length > 0 ? "posters" : "logos"
    );
    const [selectedImage, setSelectedImage] = useState(null);
    const [showAll, setShowAll] = useState(false);

    const totalImages = backdrops.length + posters.length + logos.length;
    if (totalImages === 0) return null;

    const currentList =
        activeTab === "backdrops"
            ? backdrops
            : activeTab === "posters"
            ? posters
            : logos;

    const limit = showAll ? currentList.length : 12;
    const displayedItems = currentList.slice(0, limit);

    const openLightbox = (index) => {
        setSelectedImage(index);
    };

    const closeLightbox = () => {
        setSelectedImage(null);
    };

    const nextImage = (e) => {
        e?.stopPropagation();
        if (selectedImage !== null) {
            setSelectedImage((selectedImage + 1) % currentList.length);
        }
    };

    const prevImage = (e) => {
        e?.stopPropagation();
        if (selectedImage !== null) {
            setSelectedImage(
                (selectedImage - 1 + currentList.length) % currentList.length
            );
        }
    };

    /* Keyboard navigation for Lightbox */
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (selectedImage === null) return;
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowRight") setSelectedImage((prev) => (prev + 1) % currentList.length);
            if (e.key === "ArrowLeft") setSelectedImage((prev) => (prev - 1 + currentList.length) % currentList.length);
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedImage, currentList.length]);

    return (
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-10 md:pb-14">
            <div className="section-header mb-6">
                <div>
                    <p className="label-caps mb-1">Visual Archive</p>
                    <h2 className="section-title">Photos & Production Stills</h2>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-lg">
                    {backdrops.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab("backdrops");
                                setSelectedImage(null);
                                setShowAll(false);
                            }}
                            className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                                activeTab === "backdrops"
                                    ? "bg-accent text-bg font-semibold shadow-sm"
                                    : "text-text-3 hover:text-text"
                            }`}
                        >
                            Backdrops ({backdrops.length})
                        </button>
                    )}

                    {posters.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab("posters");
                                setSelectedImage(null);
                                setShowAll(false);
                            }}
                            className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                                activeTab === "posters"
                                    ? "bg-accent text-bg font-semibold shadow-sm"
                                    : "text-text-3 hover:text-text"
                            }`}
                        >
                            Posters ({posters.length})
                        </button>
                    )}

                    {logos.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                setActiveTab("logos");
                                setSelectedImage(null);
                                setShowAll(false);
                            }}
                            className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                                activeTab === "logos"
                                    ? "bg-accent text-bg font-semibold shadow-sm"
                                    : "text-text-3 hover:text-text"
                            }`}
                        >
                            Logos ({logos.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Gallery Grid */}
            <div
                className={`grid gap-4 ${
                    activeTab === "posters"
                        ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
                        : activeTab === "logos"
                        ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                }`}
            >
                {displayedItems.map((item, index) => {
                    const imgUrl =
                        activeTab === "posters"
                            ? getPosterUrl(item.file_path)
                            : `https://image.tmdb.org/t/p/w780${item.file_path}`;

                    return (
                        <div
                            key={`${item.file_path}-${index}`}
                            onClick={() => openLightbox(index)}
                            className={`group relative overflow-hidden rounded-lg bg-surface border border-border cursor-pointer shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-card-hover ${
                                activeTab === "posters"
                                    ? "aspect-[2/3]"
                                    : activeTab === "logos"
                                    ? "aspect-[16/9] p-4 flex items-center justify-center bg-surface-2"
                                    : "aspect-video"
                            }`}
                        >
                            <img
                                src={imgUrl}
                                alt={`${movieTitle || movie?.title || "Movie"} visual ${index + 1}`}
                                loading="lazy"
                                className={`w-full h-full ${
                                    activeTab === "logos"
                                        ? "object-contain brightness-95 group-hover:scale-105"
                                        : "object-cover group-hover:scale-105"
                                } transition-transform duration-500`}
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-3">
                                <span className="text-[11px] font-mono text-text">
                                    {item.width} × {item.height} px
                                </span>
                                <span className="material-symbols-outlined text-accent text-sm">
                                    fullscreen
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Show More / View All Toggle */}
            {currentList.length > 12 && (
                <div className="mt-6 flex justify-center">
                    <button
                        type="button"
                        onClick={() => setShowAll(!showAll)}
                        className="btn-secondary text-xs py-2 px-6 inline-flex items-center gap-2"
                    >
                        <span>{showAll ? "Show Less Photos" : `View All ${currentList.length} ${activeTab.toUpperCase()}`}</span>
                        <span className="material-symbols-outlined text-sm">
                            {showAll ? "expand_less" : "expand_more"}
                        </span>
                    </button>
                </div>
            )}

            {/* Lightbox Modal */}
            {selectedImage !== null && currentList[selectedImage] && (
                <div
                    onClick={closeLightbox}
                    className="fixed inset-0 z-[2000] flex items-center justify-center bg-bg/95 backdrop-blur-md p-4 animate-fadeIn"
                >
                    <button
                        type="button"
                        onClick={closeLightbox}
                        className="absolute top-5 right-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-surface border border-border text-text hover:text-accent hover:border-accent transition-colors cursor-pointer"
                        aria-label="Close lightbox"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>

                    {currentList.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-surface/80 border border-border text-text hover:bg-surface hover:text-accent hover:border-accent transition-colors shadow-elevated cursor-pointer"
                                aria-label="Previous photo"
                            >
                                <span className="material-symbols-outlined text-2xl">chevron_left</span>
                            </button>

                            <button
                                type="button"
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-surface/80 border border-border text-text hover:bg-surface hover:text-accent hover:border-accent transition-colors shadow-elevated cursor-pointer"
                                aria-label="Next photo"
                            >
                                <span className="material-symbols-outlined text-2xl">chevron_right</span>
                            </button>
                        </>
                    )}

                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-h-[85vh] max-w-[90vw] flex flex-col items-center justify-center"
                    >
                        <img
                            src={`https://image.tmdb.org/t/p/original${currentList[selectedImage].file_path}`}
                            alt={`${movieTitle || movie?.title || "Movie"} Full Size`}
                            className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl border border-border"
                        />
                        <div className="mt-3 flex items-center gap-4 text-xs text-text-3 font-mono">
                            <span>
                                {selectedImage + 1} / {currentList.length}
                            </span>
                            <span>•</span>
                            <span>
                                {currentList[selectedImage].width} × {currentList[selectedImage].height} px
                            </span>
                            <span>•</span>
                            <a
                                href={`https://image.tmdb.org/t/p/original${currentList[selectedImage].file_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent hover:underline inline-flex items-center gap-1"
                            >
                                Original Source <span className="material-symbols-outlined text-xs">open_in_new</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default MoviePhotos;

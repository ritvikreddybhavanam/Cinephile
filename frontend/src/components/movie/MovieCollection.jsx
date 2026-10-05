import React from "react";
import { Link } from "react-router-dom";
import { getBackdropUrl, getPosterUrl } from "../../services/movieService";

function MovieCollection({ collection }) {
    if (!collection || !collection.id) return null;

    const backdrop = getBackdropUrl(collection.backdrop_path);
    const poster = getPosterUrl(collection.poster_path);

    return (
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-10 md:pb-14">
            <div className="relative overflow-hidden rounded-xl border border-border bg-surface shadow-elevated">
                {/* Background image & overlay */}
                {backdrop && (
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-20"
                        style={{ backgroundImage: `url(${backdrop})` }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-bg via-surface/90 to-transparent" />

                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8">
                    {poster && (
                        <div className="w-24 sm:w-32 aspect-[2/3] shrink-0 rounded-lg overflow-hidden border border-border shadow-card">
                            <img
                                src={poster}
                                alt={collection.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="flex-1 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                            <span className="material-symbols-outlined text-accent text-lg">
                                auto_awesome_motion
                            </span>
                            <span className="label-caps text-accent">Part of Franchise</span>
                        </div>

                        <h3 className="font-serif text-xl sm:text-2xl font-bold text-text mb-2">
                            {collection.name}
                        </h3>

                        <p className="text-xs sm:text-sm text-text-3 max-w-2xl mb-4 leading-relaxed">
                            This film is part of the legendary <strong className="text-text">{collection.name}</strong> saga. Explore more cinematic installments in the universe.
                        </p>

                        <Link
                            to={`/movies?search=${encodeURIComponent(collection.name.replace(" Collection", "").replace(" Series", ""))}`}
                            className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-2 no-underline"
                        >
                            <span>Explore Entire Franchise</span>
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default MovieCollection;

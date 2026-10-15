import { useState } from "react";
import { getPosterUrl } from "../../services/movieService";
import { Link } from "react-router-dom";

function CastSection({ cast = [] }) {
    const [showAllCast, setShowAllCast] = useState(false);
    const castList = Array.isArray(cast) ? cast : [];
    const visibleCast = showAllCast ? castList : castList.slice(0, 8);

    return (
        <section className="page-container pb-10 md:pb-14">
            <div className="section-header mb-6">
                <div>
                    <p className="label-caps mb-1">Ensemble</p>
                    <h2 className="section-title">Principal Cast</h2>
                </div>

                {castList.length > 8 && (
                    <button
                        type="button"
                        onClick={() => setShowAllCast(!showAllCast)}
                        className="btn-secondary text-xs py-1.5 px-4"
                    >
                        {showAllCast ? "Show Less" : "Full Ensemble"}
                    </button>
                )}
            </div>

            {castList.length > 0 ? (
                <div className="cast-grid-fluid">
                    {visibleCast.map((person) => {
                        const image = getPosterUrl(person.profile_path);

                        return (
                            <Link key={person.id} to={`/person/${person.id}`} className="no-underline group">
                                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-surface border border-border group-hover:border-accent/40 group-hover:shadow-card transition-all duration-200">
                                    {person.profile_path ? (
                                        <img
                                            src={image}
                                            alt={person.name}
                                            loading="lazy"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-text-3">
                                            <span className="text-3xl opacity-30">👤</span>
                                            <span className="text-[10px] mt-1">No Image</span>
                                        </div>
                                    )}
                                </div>

                                <h3 className="mt-2.5 text-xs font-semibold text-text truncate group-hover:text-accent transition-colors">
                                    {person.name}
                                </h3>
                                <p className="text-[11px] text-text-3 truncate mt-0.5">
                                    {person.character || "Unknown Role"}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <p className="text-sm text-text-3">No cast information available.</p>
            )}
        </section>
    );
}

export default CastSection;
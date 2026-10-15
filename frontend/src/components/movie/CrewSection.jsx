import { useState, useMemo } from "react";
import { getPosterUrl } from "../../services/movieService";
import { Link } from "react-router-dom";

function CrewSection({ crew = [], directors, producers, writers }) {
    const [showAllCrew, setShowAllCrew] = useState(false);

    const crewList = useMemo(() => {
        if (Array.isArray(crew) && crew.length > 0) {
            return crew;
        }

        // Fallback if raw crew array is not passed directly
        const combined = [
            ...(directors || []),
            ...(writers || []),
            ...(producers || [])
        ];

        const personMap = new Map();
        combined.forEach((person) => {
            if (!person?.id) return;
            if (!personMap.has(person.id)) {
                personMap.set(person.id, {
                    ...person,
                    jobs: person.job ? [person.job] : []
                });
            } else {
                const existing = personMap.get(person.id);
                if (person.job && !existing.jobs.includes(person.job)) {
                    existing.jobs.push(person.job);
                }
            }
        });

        return Array.from(personMap.values()).map((person) => ({
            ...person,
            job: person.jobs.slice(0, 2).join(", ") || person.job || "Crew"
        }));
    }, [crew, directors, producers, writers]);

    const visibleCrew = showAllCrew ? crewList : crewList.slice(0, 8);

    return (
        <section className="page-container pb-10 md:pb-14">
            <div className="section-header mb-6">
                <div>
                    <p className="label-caps mb-1">Production</p>
                    <h2 className="section-title">Creative Crew</h2>
                </div>

                {crewList.length > 8 && (
                    <button
                        type="button"
                        onClick={() => setShowAllCrew(!showAllCrew)}
                        className="btn-secondary text-xs py-1.5 px-4"
                    >
                        {showAllCrew ? "Show Less" : "Full Crew"}
                    </button>
                )}
            </div>

            {crewList.length > 0 ? (
                <div className="cast-grid-fluid">
                    {visibleCrew.map((person, index) => {
                        const image = getPosterUrl(person.profile_path);

                        return (
                            <Link
                                key={`${person.id}-${person.job || index}`}
                                to={`/person/${person.id}`}
                                className="no-underline group"
                            >
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
                                    {person.job || "Crew"}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <p className="text-sm text-text-3">No crew information available.</p>
            )}
        </section>
    );
}

export default CrewSection;
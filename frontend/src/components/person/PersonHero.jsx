import { useState } from "react";

function PersonHero({ person }) {
    const [following, setFollowing] = useState(false);

    const profileImage = person?.profile_path
        ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
        : null;

    const knownForDepartment =
        person?.known_for_department || "Filmmaker";

    const departmentText =
        person?.known_for_department === "Directing"
            ? "Director"
            : person?.known_for_department === "Acting"
                ? "Actor"
                : person?.known_for_department === "Writing"
                    ? "Writer"
                    : "Filmmaker";

    return (
        <section className="bg-surface border border-border rounded-lg p-6 md:p-8 mb-10 shadow-card relative overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between relative">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-8 w-full lg:w-auto">
                    <div className="relative group shrink-0">
                        <div className="w-36 h-48 sm:w-44 sm:h-56 md:w-48 md:h-64 rounded-lg overflow-hidden bg-surface-2 border border-border shadow-card transition-transform duration-300 group-hover:scale-[1.02]">
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt={person?.name || "Person"}
                                    className="w-full h-full object-cover object-top"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-text-3">
                                    <span className="material-symbols-outlined text-6xl opacity-30">
                                        person
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="absolute -bottom-3 -right-3 bg-surface border border-border px-3 py-1 rounded-full shadow-card flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                            <span className="label-caps text-[10px]">
                                {knownForDepartment}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center space-y-3">
                        <div className="flex flex-wrap items-center gap-2.5">
                            {person?.place_of_birth && (
                                <span className="label-caps text-[10px] text-text-3 px-2.5 py-0.5 rounded-full bg-surface-2 border border-border">
                                    {person.place_of_birth}
                                </span>
                            )}

                            {person?.popularity !== undefined && (
                                <span className="badge badge-accent">
                                    <span className="material-symbols-outlined text-[13px]">
                                        trending_up
                                    </span>
                                    Popularity {Number(person.popularity).toFixed(1)}
                                </span>
                            )}
                        </div>

                        <div>
                            <h1 className="text-text font-serif text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-tight mb-1 break-words">
                                {person?.name}
                            </h1>

                            <p className="text-accent text-sm sm:text-base font-medium tracking-wide">
                                {departmentText}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                            {person?.birthday && (
                                <div className="flex items-center gap-2 bg-surface-2 border border-border px-3 py-1.5 rounded-lg">
                                    <span className="material-symbols-outlined text-text-3 text-[16px]">
                                        cake
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="label-caps text-[9px]">Born</span>
                                        <span className="text-xs font-medium text-text">
                                            {person.birthday}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {person?.birthday && (
                                <div className="flex items-center gap-2 bg-surface-2 border border-border px-3 py-1.5 rounded-lg">
                                    <span className="material-symbols-outlined text-text-3 text-[16px]">
                                        history_edu
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="label-caps text-[9px]">Career</span>
                                        <span className="text-xs font-medium text-text">
                                            {person?.deathday
                                                ? `${person.birthday} – ${person.deathday}`
                                                : `${person.birthday} – Present`}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0 self-stretch lg:self-center">
                    <button
                        type="button"
                        onClick={() => setFollowing(!following)}
                        className={following ? "btn-secondary text-xs py-2.5 px-6" : "btn-primary text-xs py-2.5 px-6"}
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            {following ? "bookmark_added" : "bookmark_add"}
                        </span>
                        {following ? "Following" : "Follow Filmmaker"}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            navigator.clipboard?.writeText(window.location.href);
                        }}
                        className="btn-secondary text-xs py-2.5 px-6"
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            share
                        </span>
                        Share Profile
                    </button>
                </div>
            </div>
        </section>
    );
}

export default PersonHero;
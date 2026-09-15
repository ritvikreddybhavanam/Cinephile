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
        <section className="bg-[#181c20] rounded-xl p-6 md:p-8 mb-10 shadow-xl relative overflow-hidden">

            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#43fe6d]/10 via-transparent to-transparent pointer-events-none rounded-tr-xl" />

            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between relative">

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-8 w-full lg:w-auto">

                    <div className="relative group shrink-0">

                        <div className="w-36 h-48 sm:w-44 sm:h-56 md:w-48 md:h-64 rounded-xl overflow-hidden bg-[#31353a] shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]">

                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt={person?.name || "Person"}
                                    className="w-full h-full object-cover object-top"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#99AABB]">
                                    <span className="material-symbols-outlined text-6xl">
                                        person
                                    </span>
                                </div>
                            )}

                        </div>

                        <div className="absolute -bottom-3 -right-3 bg-[#1c2024] px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">

                            <span className="w-2 h-2 rounded-full bg-[#43fe6d] animate-pulse" />

                            <span className="font-mono text-[11px] text-[#e0e3e8] font-semibold uppercase">
                                {knownForDepartment}
                            </span>

                        </div>

                    </div>

                    <div className="flex flex-col justify-center space-y-3">

                        <div className="flex flex-wrap items-center gap-2.5">

                            {person?.place_of_birth && (
                                <span className="font-mono text-[11px] uppercase tracking-wider text-[#99AABB] px-2.5 py-1 rounded-full bg-[#262a2f]">
                                    {person.place_of_birth}
                                </span>
                            )}

                            {person?.popularity !== undefined && (
                                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#00390f] bg-[#43fe6d] px-2 py-1 rounded-full font-semibold">

                                    <span className="material-symbols-outlined text-[14px]">
                                        trending_up
                                    </span>

                                    TMDB {Number(person.popularity).toFixed(2)}

                                </span>
                            )}

                        </div>

                        <div>

                            <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight leading-none mb-2">
                                {person?.name}
                            </h1>

                            <p className="text-[#43fe6d] text-lg font-semibold tracking-wide">
                                {departmentText}
                            </p>

                        </div>

                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 pt-2">

                            {person?.birthday && (
                                <div className="flex items-center gap-2 bg-[#1c2024] px-3 py-1.5 rounded-lg">

                                    <span className="material-symbols-outlined text-[#99AABB] text-[18px]">
                                        cake
                                    </span>

                                    <div className="flex flex-col">

                                        <span className="font-mono text-[10px] text-[#99AABB] uppercase">
                                            Born
                                        </span>

                                        <span className="text-[13px] font-semibold text-white">
                                            {person.birthday}
                                        </span>

                                    </div>

                                </div>
                            )}

                            {person?.place_of_birth && (
                                <div className="flex items-center gap-2 bg-[#1c2024] px-3 py-1.5 rounded-lg">

                                    <span className="material-symbols-outlined text-[#99AABB] text-[18px]">
                                        location_on
                                    </span>

                                    <div className="flex flex-col">

                                        <span className="font-mono text-[10px] text-[#99AABB] uppercase">
                                            Birthplace
                                        </span>

                                        <span className="text-[13px] font-semibold text-white">
                                            {person.place_of_birth}
                                        </span>

                                    </div>

                                </div>
                            )}

                            {person?.birthday && (
                                <div className="flex items-center gap-2 bg-[#1c2024] px-3 py-1.5 rounded-lg">

                                    <span className="material-symbols-outlined text-[#99AABB] text-[18px]">
                                        history_edu
                                    </span>

                                    <div className="flex flex-col">

                                        <span className="font-mono text-[10px] text-[#99AABB] uppercase">
                                            Active
                                        </span>

                                        <span className="text-[13px] font-semibold text-white">
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

                <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0 self-end lg:self-center">

                    <button
                        type="button"
                        onClick={() => setFollowing(!following)}
                        className={`flex-1 lg:flex-none flex items-center justify-center gap-2 font-body-sm font-bold px-6 py-3 rounded-lg transition-all active:scale-95 shadow-lg ${
                            following
                                ? "bg-[#2C3440] text-[#43fe6d]"
                                : "bg-[#43fe6d] hover:bg-[#00e054] text-[#00390f]"
                        }`}
                    >

                        <span className="material-symbols-outlined text-[20px]">
                            {following
                                ? "bookmark_added"
                                : "bookmark_add"}
                        </span>

                        {following
                            ? "Following"
                            : "Follow Person"}

                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            navigator.clipboard?.writeText(
                                window.location.href
                            );
                        }}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-[#2C3440] hover:bg-[#31353a] text-white px-5 py-3 rounded-lg transition-all active:scale-95"
                    >

                        <span className="material-symbols-outlined text-[20px]">
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
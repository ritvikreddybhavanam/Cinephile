import { useState } from "react";
import { getPosterUrl } from "../../services/movieService";
import {Link} from "react-router-dom";

function CastSection({ cast }) {
    const [showAllCast, setShowAllCast] =
        useState(false);

    const visibleCast = showAllCast
        ? cast
        : cast.slice(0, 8);

    return (
        <section className="max-w-7xl mx-auto px-6 py-14">

            <div className="flex items-center justify-between mb-7">

                <h2 className="text-2xl md:text-3xl font-black">
                    Top Cast
                </h2>

                {cast.length > 8 && (
                    <button
                        type="button"
                        onClick={() =>
                            setShowAllCast(
                                !showAllCast
                            )
                        }
                        className="px-4 py-2 rounded-lg bg-[#161c24] border border-[#303946] text-sm font-bold text-[#00e054] hover:bg-[#00e054] hover:text-[#070a0d] transition-all"
                    >
                        {showAllCast
                            ? "Show Less"
                            : "Full Cast"}
                    </button>
                )}

            </div>

            {cast.length > 0 ? (

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-5">

                    {visibleCast.map((person) => {

                        const image =
                            getPosterUrl(
                                person.profile_path
                            );

                        return (
                            <Link key={person.id} to={`/person/${person.id}`}>
                                <div
                                    key={`${person.id}-${person.character}`}
                                    className="group"
                                >

                                    <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[#161c24] border border-[#212936]">

                                        {person.profile_path ? (
                                            <img
                                                src={image}
                                                alt={person.name}
                                                loading="lazy"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">

                                                <span className="text-4xl">
                                                    👤
                                                </span>

                                                <span className="text-xs mt-2">
                                                    No Image
                                                </span>

                                            </div>
                                        )}

                                    </div>

                                    <h3 className="mt-3 text-sm font-bold truncate">
                                        {person.name}
                                    </h3>

                                    <p className="text-xs text-gray-500 truncate mt-1">
                                        {person.character ||
                                            "Unknown Character"}
                                    </p>

                                </div>
                            </Link>
                        );
                    })}

                </div>

            ) : (

                <p className="text-gray-500">
                    No cast information available.
                </p>

            )}

        </section>
    );
}

export default CastSection;
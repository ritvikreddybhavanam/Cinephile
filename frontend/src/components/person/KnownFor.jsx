import { useNavigate } from "react-router-dom";

function KnownFor({ credits }) {
    const navigate = useNavigate();

    const movies = [...(credits?.cast || []), ...(credits?.crew || [])]
        .filter(
            (movie, index, array) =>
                array.findIndex(
                    (item) => item.id === movie.id
                ) === index
        )
        .filter((movie) => movie.poster_path)
        .sort(
            (a, b) =>
                (b.popularity || 0) -
                (a.popularity || 0)
        )
        .slice(0, 4);

    return (
        <section className="mb-14">

            <div className="flex items-center justify-between mb-6">

                <div className="flex items-center gap-2">

                    <span className="w-1.5 h-4 rounded bg-[#43fe6d]" />

                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        KNOWN FOR
                    </h2>

                </div>

                <span className="font-mono text-[11px] text-[#99AABB] uppercase tracking-wider">
                    TMDB Filmography
                </span>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

                {movies.map((movie) => (
                    <div
                        key={movie.id}
                        onClick={() =>
                            navigate(`/movies/${movie.id}`)
                        }
                        className="group flex flex-col bg-[#181c20] rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-1.5 cursor-pointer"
                    >

                        <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#1c2024]">

                            <img
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                alt={movie.title || movie.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />

                            <div className="absolute top-2.5 right-2.5 bg-[#0B0D0F]/80 backdrop-blur-md px-2 py-0.5 rounded flex items-center gap-1">

                                <span className="material-symbols-outlined text-[#FFCC00] text-[16px]">
                                    star
                                </span>

                                <span className="text-[13px] font-bold text-white">
                                    {movie.vote_average
                                        ? Number(movie.vote_average).toFixed(1)
                                        : "N/A"}
                                </span>

                            </div>

                            <div className="absolute inset-0 bg-[#0B0D0F]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">

                                <span className="w-10 h-10 rounded-full bg-[#43fe6d] text-[#00390f] flex items-center justify-center">
                                    <span className="material-symbols-outlined">
                                        open_in_new
                                    </span>
                                </span>

                            </div>

                        </div>

                        <div className="p-3.5">

                            <span className="text-[16px] font-bold text-white truncate block group-hover:text-[#43fe6d] transition-colors">
                                {movie.title || movie.name}
                            </span>

                            <div className="flex items-center justify-between text-[#99AABB] text-[13px] mt-1">

                                <span>
                                    {(
                                        movie.release_date ||
                                        movie.first_air_date ||
                                        ""
                                    ).substring(0, 4)}
                                </span>

                                <span className="text-[11px]">
                                    {movie.media_type === "tv"
                                        ? "TV"
                                        : "Film"}
                                </span>

                            </div>

                        </div>

                    </div>
                ))}

            </div>

        </section>
    );
}

export default KnownFor;
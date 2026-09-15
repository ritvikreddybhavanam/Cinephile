import { Link } from "react-router-dom";

function MovieTile({ movie }) {
    return (
        <div className="flex flex-col min-w-0">
            <Link
                to={`/movies/${movie.id}`}
                className="poster-item aspect-[2/3] bg-[#14181c] rounded-[2px] overflow-hidden border border-[#2b333c] flex flex-col justify-end p-1.5 cursor-pointer shadow-sm relative"
            >
                {movie.poster ? (
                    <img
                        src={movie.poster}
                        alt={movie.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div
                        className={`absolute inset-0 bg-gradient-to-b ${movie.gradient || "from-slate-800 to-black"} flex items-center justify-center p-2`}
                    >
                        <span className="text-[9px] font-black text-white/80 tracking-tight uppercase text-center leading-tight">
                            {movie.title}
                        </span>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>
            </Link>

            <div className="text-[10px] text-[#00e054] leading-none mt-1 truncate">
                {movie.rating != null ? movie.rating : "Not Rated"}

                {movie.listCount && (
                    <span className="text-[#455260] text-[8px] ml-1">
                        ≡
                    </span>
                )}
            </div>
        </div>
    );
}

export default MovieTile;
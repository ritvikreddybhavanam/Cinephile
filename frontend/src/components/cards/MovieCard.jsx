import { useState } from "react";
import { useNavigate } from "react-router-dom";

function MovieCard({ movie }) {
    const [imageError, setImageError] = useState(false);
    const navigate = useNavigate();

    const ratingColor =
        Number(movie.rating) >= 8
            ? "bg-[#00e054] text-[#070a0d]"
            : "bg-[#070a0d]/80 text-[#f5c518]";

    const showPlaceholder = !movie.image || imageError;

    const handleClick = () => {
        navigate(`/movie/${movie.id}`);
    };

    return (
        <article
            onClick={handleClick}
            className="flex flex-col group cursor-pointer"
        >
            <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-[#161c24] shadow-[0_12px_28px_-6px_rgba(0,0,0,0.75)] border border-[#212936]/60 transition-all duration-300 ease-out group-hover:-translate-y-[7px] group-hover:scale-[1.02] group-hover:shadow-[0_16px_30px_-6px_rgba(0,0,0,0.85),0_0_16px_-2px_rgba(0,224,84,0.3)]">

                {showPlaceholder ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#161c24] text-gray-500">
                        <span className="text-5xl mb-3">🎬</span>

                        <span className="text-xs font-semibold">
                            No Image Available
                        </span>
                    </div>
                ) : (
                    <img
                        src={movie.image}
                        alt={`${movie.title} Movie Poster`}
                        loading="lazy"
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover"
                    />
                )}

                <div
                    className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-black backdrop-blur-sm border border-[#212936] ${ratingColor}`}
                >
                    ★ {movie.rating}
                </div>

                <div className="absolute inset-0 bg-[#070a0d]/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <button
                        onClick={(event) => {
                            event.stopPropagation();
                            handleClick();
                        }}
                        className="cursor-pointer w-full py-2 bg-[#00e054] text-[#070a0d] text-xs font-bold rounded-lg shadow-[0_0_25px_-5px_rgba(0,224,84,0.35)]"
                    >
                        Quick Details
                    </button>
                </div>
            </div>

            <div className="mt-2.5 px-0.5">
                <h3 className="font-bold text-sm text-white group-hover:text-[#00e054] transition-colors truncate">
                    {movie.title}
                </h3>

                <p className="text-[11px] text-gray-400 truncate mt-0.5 font-medium">
                    {movie.genre} • {movie.year}
                </p>
            </div>
        </article>
    );
}

export default MovieCard;
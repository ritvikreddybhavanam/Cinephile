import { useNavigate } from "react-router-dom";
import Icon from "../common/Icon";

function LikedMovieCard({ movie, onUnlike }) {
    const navigate = useNavigate();

    const handleTrailerClick = () => {
        navigate(`/movies/${movie.id}?section=trailer`);
    };

    const handleReviewClick = () => {
        navigate(`/movies/${movie.id}?section=review`);
    };

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#181c20] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#00e054]/50 hover:shadow-2xl">
            <div className="relative aspect-[2/3] overflow-hidden bg-[#080a0d]">
                <img
                    src={movie.poster}
                    alt={movie.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#080a0d] via-transparent to-black/60" />

                <div className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-md border border-white/10 bg-black/75 px-2 py-0.5 font-mono text-[11px] font-bold text-yellow-500 backdrop-blur-md">
                    <Icon
                        className="text-[13px]"
                        style={{
                            fontVariationSettings: "'FILL' 1",
                        }}
                    >
                        star
                    </Icon>

                    {movie.rating.toFixed(1)}
                </div>

                <button
                    type="button"
                    onClick={() => onUnlike(movie.id)}
                    className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border border-rose-500/40 bg-black/70 text-rose-500 backdrop-blur-md transition-transform hover:scale-110"
                    title={`Liked on ${movie.likedDate}. Click to unlike`}
                >
                    <Icon
                        className="text-[18px]"
                        style={{
                            fontVariationSettings: "'FILL' 1",
                        }}
                    >
                        favorite
                    </Icon>
                </button>

                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#080a0d]/85 p-3 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <button
                        type="button"
                        onClick={handleTrailerClick}
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#00e054] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#00390f] transition-colors hover:bg-[#43fe6d]"
                    >
                        <Icon className="text-[15px]">
                            play_circle
                        </Icon>

                        Trailer
                    </button>

                    <button
                        type="button"
                        onClick={handleReviewClick}
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#181c20] px-3 py-1.5 font-mono text-xs text-white transition-colors hover:bg-[#22272d]"
                    >
                        <Icon className="text-[15px]">
                            rate_review
                        </Icon>

                        Review
                    </button>
                </div>
            </div>

            <div className="flex flex-grow flex-col justify-between p-3.5">
                <div>
                    <div className="mb-1 flex items-center justify-between gap-2 font-mono text-[10px] text-[#8d9ba8]">
                        <span>{movie.year}</span>

                        <span className="truncate text-[#00e054]">
                            {movie.genre}
                        </span>
                    </div>

                    <h3 className="line-clamp-1 font-bold text-sm text-white transition-colors group-hover:text-[#00e054] sm:text-base">
                        {movie.title}
                    </h3>
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-white/[0.08] pt-2 font-mono text-[10px] text-[#8d9ba8]">
                    <span>Liked {movie.likedDate}</span>

                    <span className="font-bold text-emerald-400">
                        #{movie.rank}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default LikedMovieCard;

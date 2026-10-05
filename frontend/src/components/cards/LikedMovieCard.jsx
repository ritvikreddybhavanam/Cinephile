import { useNavigate } from "react-router-dom";
import Icon from "../common/Icon";

function LikedMovieCard({ movie, onUnlike }) {
    const navigate = useNavigate();

    const handleTrailerClick = () => navigate(`/movies/${movie.id}?section=trailer`);
    const handleReviewClick  = () => navigate(`/movies/${movie.id}?section=review`);

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-accent/30 hover:shadow-card-hover">
            <div className="relative aspect-[2/3] overflow-hidden">
                <img
                    src={movie.poster}
                    alt={movie.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent" />

                {/* Rating badge */}
                <div className="absolute left-2.5 top-2.5 badge badge-accent backdrop-blur-sm">
                    <Icon className="text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</Icon>
                    {movie.rating.toFixed(1)}
                </div>

                {/* Unlike button */}
                <button
                    type="button"
                    onClick={() => onUnlike(movie.id)}
                    className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full border border-wine/40 bg-bg/70 text-wine backdrop-blur-sm transition-transform hover:scale-110 hover:bg-wine/20"
                    title={`Liked on ${movie.likedDate}. Click to unlike`}
                >
                    <Icon className="text-[17px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</Icon>
                </button>

                {/* Hover overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-bg/85 p-3 text-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <button
                        type="button"
                        onClick={handleTrailerClick}
                        className="btn-primary w-full text-xs py-2 rounded-lg"
                    >
                        <Icon className="text-[14px]">play_circle</Icon>
                        Trailer
                    </button>
                    <button
                        type="button"
                        onClick={handleReviewClick}
                        className="btn-secondary w-full text-xs py-2 rounded-lg"
                    >
                        <Icon className="text-[14px]">rate_review</Icon>
                        Review
                    </button>
                </div>
            </div>

            <div className="flex flex-grow flex-col justify-between p-3">
                <div>
                    <div className="mb-1 flex items-center justify-between gap-2 text-[10px] text-text-3">
                        <span>{movie.year}</span>
                        <span className="truncate text-accent text-[10px]">{movie.genre}</span>
                    </div>
                    <h3 className="line-clamp-1 text-sm font-medium text-text transition-colors group-hover:text-accent">
                        {movie.title}
                    </h3>
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-[10px] text-text-3">
                    <span>Liked {movie.likedDate}</span>
                    <span className="font-semibold text-accent">#{movie.rank}</span>
                </div>
            </div>
        </div>
    );
}

export default LikedMovieCard;

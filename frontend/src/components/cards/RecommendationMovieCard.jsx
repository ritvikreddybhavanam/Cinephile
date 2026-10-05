import Icon from "../common/Icon";

function RecommendationMovieCard({ movie }) {
    return (
        <div className="poster-card cursor-pointer">
            <img
                src={movie.image}
                alt={movie.title}
                loading="lazy"
                className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

            <div className="absolute bottom-0 left-0 w-full translate-y-full p-3 transition-transform duration-200 group-hover:translate-y-0">
                <h4 className="truncate text-sm font-medium text-text">{movie.title}</h4>
                <div className="mt-1 flex items-center gap-1 text-xs text-accent">
                    <Icon className="text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</Icon>
                    {movie.rating}
                </div>
            </div>
        </div>
    );
}

export default RecommendationMovieCard;

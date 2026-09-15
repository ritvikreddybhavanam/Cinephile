import Icon from "../common/Icon";

function RecommendationMovieCard({ movie }) {
    return (
        <div className="movie-card group relative aspect-[2/3] cursor-pointer overflow-hidden rounded-xl border border-[#262626] bg-[#121212] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_40px_-10px_rgba(0,0,0,0.5)]">
            <img
                src={movie.image}
                alt={movie.title}
                className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0F] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="absolute bottom-0 left-0 w-full translate-y-full p-3 transition-transform duration-300 group-hover:translate-y-0">
                <h4 className="truncate text-sm font-semibold text-white">
                    {movie.title}
                </h4>

                <div className="mt-1 flex items-center text-xs text-[#43fe6d]">
                    <Icon
                        className="mr-1 text-[14px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                        star
                    </Icon>
                    {movie.rating}
                </div>
            </div>
        </div>
    );
}

export default RecommendationMovieCard;

const TrendingMovieCard = ({ movie }) => {
    return (
        <div className="group relative aspect-[16/9] cursor-pointer overflow-hidden rounded-xl border border-[#262626] bg-[#101418] transition-all duration-300 hover:-translate-y-2 hover:border-[#4f4633] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
            <img
                src={movie.image}
                alt={movie.title}
                className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,10,0.95)] via-[rgba(10,10,10,0.4)] to-transparent opacity-90 transition-opacity group-hover:opacity-100" />

            <div className="absolute bottom-0 left-0 flex w-full flex-col justify-end p-4">
                <h4 className="truncate text-lg font-semibold text-[#e0e3e8] drop-shadow-md">
                    {movie.title}
                </h4>

                <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider text-gray-300">
                        {movie.genre}
                    </span>

                    <div className="flex items-center text-[#eab308] drop-shadow">
                        <span className="material-symbols-outlined filled text-sm">
                            star
                        </span>

                        <span className="ml-1 text-xs font-semibold">
                            {movie.rating}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrendingMovieCard;

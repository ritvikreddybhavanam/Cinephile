import Icon from "../common/Icon";

function SpotlightCard({ movie }) {
    return (
        <div className="relative flex min-h-[300px] flex-1 flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-[#181c20] p-6 shadow-lg group">
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${movie.image}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080a0d] via-[#080a0d]/80 to-transparent" />
            <div className="absolute left-4 top-4 z-10">
                <span className="font-headline text-6xl font-black leading-none text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.25)]">
                    {String(movie.rank).padStart(2, "0")}
                </span>
            </div>
            <div className="absolute right-4 top-4 z-10">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-[#080a0d]/80 px-2.5 py-1 font-mono text-[11px] font-semibold text-primary backdrop-blur">
                    {movie.trend}
                </span>
            </div>
            <div className="relative z-20">
                <div className="mb-1.5 flex items-center gap-2 text-xs text-[#8d9ba8]">
                    <span>{movie.year}</span>
                    <span>•</span>
                    <span>{movie.genre}</span>
                    <div className="ml-auto flex items-center gap-1 text-[#ffc107]">
                        <Icon className="text-[15px]">star</Icon>
                        <span className="text-xs font-bold text-white">{movie.rating}</span>
                        <span className="text-[10px] text-[#8d9ba8]">({movie.audience})</span>
                    </div>
                </div>
                <h3 className="mb-2 truncate font-headline text-2xl font-bold text-white transition-colors group-hover:text-primary">
                    {movie.title}
                </h3>
                <p className="mb-4 line-clamp-2 text-xs font-light text-gray-300">
                    {movie.description}
                </p>
                <div className="flex items-center gap-2">
                    <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-[#22272d]/90 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-primary hover:text-[#00390f]">
                        <Icon className="text-[16px]">bookmark_add</Icon>
                        Watchlist
                    </button>
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#22272d]/90 text-white transition-colors hover:bg-white/20">
                        <Icon className="text-[18px]">play_arrow</Icon>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SpotlightCard;

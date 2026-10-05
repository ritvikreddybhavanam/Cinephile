import RatingStars from "../common/RatingStars";

const ActivityCard = ({ movie }) => {
    return (
        <article className="group overflow-hidden rounded-lg border border-border bg-surface transition-all duration-200 hover:border-accent/30 hover:shadow-card">
            <div className="flex flex-col md:flex-row">
                <div className="relative h-48 flex-shrink-0 md:h-auto md:w-1/4 overflow-hidden">
                    <img
                        src={movie.image}
                        alt={`${movie.title} poster`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                </div>

                <div className="flex flex-col justify-between p-5 md:w-3/4">
                    <div>
                        <div className="mb-2 flex items-start justify-between">
                            <h4 className="text-base font-semibold text-text">
                                {movie.title}{" "}
                                <span className="text-sm font-normal text-text-3">{movie.year}</span>
                            </h4>
                            <span className="text-[11px] text-text-3">{movie.time}</span>
                        </div>

                        <div className="mb-3">
                            <RatingStars rating={movie.rating} />
                        </div>

                        <p className="mb-4 text-sm italic leading-relaxed text-text-2">
                            "{movie.review}"
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button className="flex items-center gap-1 text-xs text-text-3 transition-colors hover:text-accent">
                            <span className="material-symbols-outlined text-sm">thumb_up</span>
                            {movie.likes}
                        </button>
                        <button className="flex items-center gap-1 text-xs text-text-3 transition-colors hover:text-accent">
                            <span className="material-symbols-outlined text-sm">chat_bubble</span>
                            {movie.comments}
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default ActivityCard;

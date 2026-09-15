import RatingStars from "../common/RatingStars";

const ActivityCard = ({ movie }) => {
    return (
        <article className="group overflow-hidden rounded-xl border border-[#262626] bg-[#101418] transition-colors hover:border-[#3c4b3a]">
            <div className="flex flex-col md:flex-row">
                <div className="relative h-48 flex-shrink-0 md:h-auto md:w-1/4">
                    <img
                        src={movie.image}
                        alt={`${movie.title} poster`}
                        className="h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-transparent" />
                </div>

                <div className="flex flex-col justify-between p-6 md:w-3/4">
                    <div>
                        <div className="mb-2 flex items-start justify-between">
                            <h4 className="text-xl font-bold text-[#e0e3e8]">
                                {movie.title}{" "}
                                <span className="text-sm font-normal text-[#a0a0a0]">
                                    {movie.year}
                                </span>
                            </h4>

                            <span className="text-xs font-medium text-[#a0a0a0]">
                                {movie.time}
                            </span>
                        </div>

                        <div className="mb-4">
                            <RatingStars rating={movie.rating} />
                        </div>

                        <p className="mb-4 text-base italic leading-6 text-[#bacbb6]">
                            "{movie.review}"
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button className="flex items-center gap-1 text-sm text-[#a0a0a0] transition-colors hover:text-[#43fe6d]">
                            <span className="material-symbols-outlined text-sm">
                                thumb_up
                            </span>
                            {movie.likes}
                        </button>

                        <button className="flex items-center gap-1 text-sm text-[#a0a0a0] transition-colors hover:text-[#43fe6d]">
                            <span className="material-symbols-outlined text-sm">
                                chat_bubble
                            </span>
                            {movie.comments}
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default ActivityCard;

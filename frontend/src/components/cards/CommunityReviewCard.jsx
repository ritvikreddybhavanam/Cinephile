import Icon from "../common/Icon";

function CommunityReviewCard({ review }) {
    return (
        <div className="mc-card flex flex-col justify-between p-4">
            <div>
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {review.avatar ? (
                            <img
                                src={review.avatar}
                                alt={review.name}
                                className="h-8 w-8 rounded-full object-cover border border-border"
                            />
                        ) : (
                            <div className="h-8 w-8 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center text-xs font-semibold text-accent">
                                {review.name?.substring(0, 2)?.toUpperCase() || "?"}
                            </div>
                        )}
                        <div>
                            <div className="text-xs font-medium text-text">{review.name}</div>
                            <div className="text-[10px] text-text-3">
                                Reviewing{" "}
                                <span className="text-text-2">{review.movie}</span>
                            </div>
                        </div>
                    </div>
                    <div className="badge badge-accent text-[10px]">★ {review.rating}</div>
                </div>

                <p className="text-xs italic leading-relaxed text-text-2">"{review.text}"</p>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11px] text-text-3">
                <span className="flex items-center gap-1">
                    <Icon className="text-[13px] text-accent">favorite</Icon>
                    {review.likes} likes
                </span>
                <span>{review.time}</span>
            </div>
        </div>
    );
}

export default CommunityReviewCard;

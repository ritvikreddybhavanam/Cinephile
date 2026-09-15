import Icon from "../common/Icon";

function CommunityReviewCard({ review }) {
    return (
        <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#101418] p-4 transition-colors hover:border-primary/40">
            <div>
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img
                            src={review.avatar}
                            alt={review.name}
                            className="h-7 w-7 rounded-full object-cover"
                        />
                        <div>
                            <div className="text-xs font-semibold text-white">
                                {review.name}
                            </div>
                            <div className="font-mono text-[10px] text-[#8d9ba8]">
                                Reviewing{" "}
                                <span className="text-gray-300">
                                    {review.movie}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-xs text-[#ffc107]">
                        {review.rating}
                    </div>
                </div>
                <p className="text-xs italic leading-relaxed text-gray-300">
                    “{review.text}”
                </p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-[#8d9ba8]">
                <span className="flex items-center gap-1">
                    <Icon className="text-[13px]">favorite</Icon>
                    {review.likes} likes
                </span>
                <span className="font-mono">{review.time}</span>
            </div>
        </div>
    );
}

export default CommunityReviewCard;

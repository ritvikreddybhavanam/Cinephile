import { Link } from "react-router-dom";

function ReviewCard({ review }) {
    return (
        <article className="rounded-xl border border-white/10 bg-[#181c20] p-6 transition-colors hover:border-[#00e054]/40">

            <div className="mb-3 flex items-start justify-between gap-4">

                <div>

                    <Link
                        to={`/movies/${review.movieId}`}
                        className="text-xl font-bold text-white transition-colors hover:text-[#00e054]"
                    >
                        {review.title}

                        <span className="ml-2 text-sm font-normal text-slate-400">
                            {review.year}
                        </span>
                    </Link>

                    <div className="mt-1 flex items-center gap-2">

                        <div className="flex text-sm text-[#eab308]">
                            {review.stars}
                        </div>

                        <span className="text-xs font-semibold text-slate-400">
                            {review.rating} / 5
                        </span>

                        <span className="text-xs text-slate-500">
                            • Reviewed {review.reviewedDate}
                        </span>

                    </div>

                </div>


            </div>

            <p className="text-sm leading-relaxed text-slate-300">
                {review.review}
            </p>

        </article>
    );
}

export default ReviewCard;
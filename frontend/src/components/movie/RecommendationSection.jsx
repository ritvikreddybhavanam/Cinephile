import { Link } from "react-router-dom";
import { getPosterUrl } from "../../services/movieService";

function RecommendationSection({
                                   recommendations
                               }) {
    if (
        !recommendations ||
        recommendations.length === 0
    ) {
        return null;
    }

    return (
        <section className="max-w-7xl mx-auto px-6 pb-16">

            <h2 className="text-2xl md:text-3xl font-black mb-7">
                You May Also Like
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">

                {recommendations
                    .slice(0, 10)
                    .map(
                        (
                            recommendedMovie
                        ) => (

                            <Link
                                key={
                                    recommendedMovie.id
                                }
                                to={`/movies/${recommendedMovie.id}`}
                                className="group"
                            >

                                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[#161c24] border border-[#212936]">

                                    {recommendedMovie.poster_path ? (

                                        <img
                                            src={getPosterUrl(
                                                recommendedMovie.poster_path
                                            )}
                                            alt={
                                                recommendedMovie.title
                                            }
                                            loading="lazy"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />

                                    ) : (

                                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                                            No Image
                                        </div>

                                    )}

                                </div>

                                <h3 className="mt-3 text-sm font-bold truncate group-hover:text-[#00e054] transition-colors">
                                    {
                                        recommendedMovie.title
                                    }
                                </h3>

                                <p className="text-xs text-gray-500 mt-1">

                                    {recommendedMovie.release_date
                                        ? recommendedMovie.release_date.substring(
                                            0,
                                            4
                                        )
                                        : "N/A"}{" "}
                                    • ★{" "}
                                    {recommendedMovie.vote_average
                                        ? Number(
                                            recommendedMovie.vote_average
                                        ).toFixed(1)
                                        : "N/A"}

                                </p>

                            </Link>

                        )
                    )}

            </div>

        </section>
    );
}

export default RecommendationSection;
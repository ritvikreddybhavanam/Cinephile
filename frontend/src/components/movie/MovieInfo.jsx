function MovieInfo({
                       movie,
                       runtime,
                       budget,
                       revenue
                   }) {
    return (
        <section className="max-w-7xl mx-auto px-6 pb-14">

            <h2 className="text-2xl md:text-3xl font-black mb-7">
                Movie Information
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                {/* RELEASE DATE */}
                <div className="bg-[#161c24] border border-[#212936] rounded-xl p-5">

                    <p className="text-xs text-gray-500 uppercase font-bold">
                        Release Date
                    </p>

                    <p className="mt-2 font-bold">
                        {movie.release_date ||
                            "N/A"}
                    </p>

                </div>

                {/* RUNTIME */}
                <div className="bg-[#161c24] border border-[#212936] rounded-xl p-5">

                    <p className="text-xs text-gray-500 uppercase font-bold">
                        Runtime
                    </p>

                    <p className="mt-2 font-bold">
                        {runtime}
                    </p>

                </div>

                {/* BUDGET */}
                <div className="bg-[#161c24] border border-[#212936] rounded-xl p-5">

                    <p className="text-xs text-gray-500 uppercase font-bold">
                        Budget
                    </p>

                    <p className="mt-2 font-bold">
                        {budget}
                    </p>

                </div>

                {/* REVENUE */}
                <div className="bg-[#161c24] border border-[#212936] rounded-xl p-5">

                    <p className="text-xs text-gray-500 uppercase font-bold">
                        Revenue
                    </p>

                    <p className="mt-2 font-bold">
                        {revenue}
                    </p>

                </div>

            </div>

        </section>
    );
}

export default MovieInfo;
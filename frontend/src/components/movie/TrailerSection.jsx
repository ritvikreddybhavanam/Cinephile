function TrailerSection({
                            trailer,
                            movieTitle,
                            sectionRef
                        }) {
    return (
        <section
            ref={sectionRef}
            id="trailer"
            className="max-w-7xl mx-auto px-6 py-14 scroll-mt-24"
        >

            <h2 className="text-2xl md:text-3xl font-black mb-7">
                Trailer
            </h2>

            {trailer ? (
                <div className="overflow-hidden rounded-2xl border border-[#212936] bg-[#161c24] shadow-2xl">

                    <div className="aspect-video w-full">

                        <iframe
                            src={`https://www.youtube.com/embed/${trailer.key}?rel=0`}
                            title={`${movieTitle} Trailer`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />

                    </div>

                </div>
            ) : (
                <div className="bg-[#161c24] border border-[#212936] rounded-2xl p-8 text-center text-gray-500">
                    No trailer available for this movie.
                </div>
            )}

        </section>
    );
}

export default TrailerSection;
function TrailerSection({ trailer, movieTitle, sectionRef }) {
    return (
        <section
            ref={sectionRef}
            id="trailer"
            className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 md:py-14 scroll-mt-24"
        >
            <div className="section-header mb-6">
                <div>
                    <p className="label-caps mb-1">Preview</p>
                    <h2 className="section-title">Official Trailer</h2>
                </div>
            </div>

            {trailer ? (
                <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-elevated">
                    <div className="aspect-video w-full">
                        <iframe
                            src={`https://www.youtube.com/embed/${trailer.key}?rel=0`}
                            title={`${movieTitle} Official Trailer`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />
                    </div>
                </div>
            ) : (
                <div className="bg-surface border border-border rounded-lg p-8 text-center text-sm text-text-3">
                    No official trailer currently available for this film.
                </div>
            )}
        </section>
    );
}

export default TrailerSection;
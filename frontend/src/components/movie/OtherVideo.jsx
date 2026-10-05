function OtherVideo({ video, movieTitle }) {
    if (!video) {
        return null;
    }

    return (
        <div className="group w-full overflow-hidden rounded-lg border border-border bg-surface shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card-hover">
            <div className="relative aspect-video w-full bg-black">
                <iframe
                    src={`https://www.youtube.com/embed/${video.key}?rel=0`}
                    title={`${movieTitle} - ${video.name}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                />
            </div>

            <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="label-caps">
                        {video.type}
                    </span>

                    {video.official && (
                        <span className="badge badge-accent text-[10px]">
                            Official
                        </span>
                    )}
                </div>

                <h3 className="text-sm font-semibold text-text leading-5 line-clamp-2 group-hover:text-accent transition-colors">
                    {video.name}
                </h3>
            </div>
        </div>
    );
}

export default OtherVideo;
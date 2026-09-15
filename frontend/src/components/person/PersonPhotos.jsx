function PersonPhotos({ images }) {
    const photos = images?.profiles || [];

    if (photos.length === 0) {
        return null;
    }

    return (
        <section className="mb-14">

            <div className="flex items-center justify-between mb-6">

                <div className="flex items-center gap-2">

                    <span className="w-1.5 h-4 rounded bg-[#43fe6d]" />

                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        PHOTOS
                    </h2>

                </div>

                <span className="font-mono text-[11px] text-[#99AABB] uppercase tracking-wider">
                    TMDB Photo Archive
                </span>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                {photos.slice(0, 6).map((photo, index) => (
                    <div
                        key={`${photo.file_path}-${index}`}
                        className="group relative aspect-[16/10] rounded-xl overflow-hidden bg-[#1c2024] shadow-md"
                    >

                        <img
                            src={`https://image.tmdb.org/t/p/w780${photo.file_path}`}
                            alt="Person"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0F]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">

                            <span className="text-sm font-bold text-white">
                                TMDB Photo {index + 1}
                            </span>

                        </div>

                    </div>
                ))}

            </div>

        </section>
    );
}

export default PersonPhotos;
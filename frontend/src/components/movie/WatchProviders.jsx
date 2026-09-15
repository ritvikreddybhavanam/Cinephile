function WatchProviders({ watchProviders }) {
    const indiaProviders =
        watchProviders?.results?.IN || null;

    const streamingProviders =
        indiaProviders?.flatrate || [];

    const rentProviders =
        indiaProviders?.rent || [];

    const buyProviders =
        indiaProviders?.buy || [];

    const getProviderLink = (provider) => {
        switch (provider.provider_name) {
            case "Netflix":
                return "https://www.netflix.com/in/";

            case "Amazon Prime Video":
                return "https://www.primevideo.com/";

            case "Disney Plus":
                return "https://www.disneyplus.com/";

            case "JioHotstar":
                return "https://www.hotstar.com/in/";

            case "YouTube":
                return "https://www.youtube.com/";

            default:
                return "";
        }
    };

    const renderProvider = (
        provider,
        type
    ) => {
        const providerLink =
            getProviderLink(provider);

        const content = (
            <>
                {provider.logo_path ? (
                    <img
                        src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                        alt={provider.provider_name}
                        className="w-10 h-10 rounded-lg object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-lg bg-[#212936] flex items-center justify-center text-xs">
                        OTT
                    </div>
                )}

                <span className="font-bold">
                    {provider.provider_name}
                </span>
            </>
        );

        const key =
            `${type}-${provider.provider_id}`;

        if (providerLink) {
            return (
                <a
                    key={key}
                    href={providerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-[#070a0d] border border-[#303946] rounded-xl px-4 py-3 hover:border-[#00e054] hover:bg-[#00e054]/10 transition-all cursor-pointer"
                >
                    {content}
                </a>
            );
        }

        return (
            <div
                key={key}
                className="flex items-center gap-3 bg-[#070a0d] border border-[#303946] rounded-xl px-4 py-3"
            >
                {content}
            </div>
        );
    };

    const hasProviders =
        streamingProviders.length > 0 ||
        rentProviders.length > 0 ||
        buyProviders.length > 0;

    return (
        <section className="max-w-7xl mx-auto px-6 pb-14">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-7">

                <h2 className="text-2xl md:text-3xl font-black">
                    Where to Watch
                </h2>

                <span className="text-sm text-gray-500">
                    Availability in India
                </span>

            </div>

            {indiaProviders ? (

                <div className="bg-[#161c24] border border-[#212936] rounded-2xl p-6">

                    {/* STREAMING */}
                    {streamingProviders.length > 0 && (
                        <div className="mb-7">

                            <h3 className="text-lg font-bold mb-4">
                                Streaming
                            </h3>

                            <div className="flex flex-wrap gap-5">

                                {streamingProviders.map(
                                    (provider) =>
                                        renderProvider(
                                            provider,
                                            "stream"
                                        )
                                )}

                            </div>

                        </div>
                    )}

                    {/* RENT */}
                    {rentProviders.length > 0 && (
                        <div className="mb-7">

                            <h3 className="text-lg font-bold mb-4">
                                Rent
                            </h3>

                            <div className="flex flex-wrap gap-5">

                                {rentProviders.map(
                                    (provider) =>
                                        renderProvider(
                                            provider,
                                            "rent"
                                        )
                                )}

                            </div>

                        </div>
                    )}

                    {/* BUY */}
                    {buyProviders.length > 0 && (
                        <div>

                            <h3 className="text-lg font-bold mb-4">
                                Buy
                            </h3>

                            <div className="flex flex-wrap gap-5">

                                {buyProviders.map(
                                    (provider) =>
                                        renderProvider(
                                            provider,
                                            "buy"
                                        )
                                )}

                            </div>

                        </div>
                    )}

                    {!hasProviders && (
                        <p className="text-gray-500">
                            No streaming information
                            available in India.
                        </p>
                    )}

                    {hasProviders && (
                        <p className="text-sm text-gray-500 mt-6">
                            Click a provider to visit its
                            streaming platform.
                        </p>
                    )}

                </div>

            ) : (

                <div className="bg-[#161c24] border border-[#212936] rounded-2xl p-6">

                    <p className="text-gray-500">
                        No streaming information available
                        in India.
                    </p>

                </div>

            )}

        </section>
    );
}

export default WatchProviders;
function WatchProviders({ watchProviders }) {
    const indiaProviders = watchProviders?.results?.IN || null;
    const streamingProviders = indiaProviders?.flatrate || [];
    const rentProviders = indiaProviders?.rent || [];
    const buyProviders = indiaProviders?.buy || [];

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

    const renderProvider = (provider, type) => {
        const providerLink = getProviderLink(provider);
        const content = (
            <>
                {provider.logo_path ? (
                    <img
                        src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                        alt={provider.provider_name}
                        className="w-8 h-8 rounded object-cover"
                    />
                ) : (
                    <div className="w-8 h-8 rounded bg-surface-2 flex items-center justify-center text-[10px] text-text-3 font-semibold">
                        OTT
                    </div>
                )}
                <span className="text-sm font-medium text-text group-hover:text-accent transition-colors">
                    {provider.provider_name}
                </span>
            </>
        );

        const key = `${type}-${provider.provider_id}`;

        if (providerLink) {
            return (
                <a
                    key={key}
                    href={providerLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 bg-surface border border-border rounded-lg px-4 py-2.5 hover:border-accent/40 hover:bg-surface-2 transition-all cursor-pointer no-underline"
                >
                    {content}
                </a>
            );
        }

        return (
            <div
                key={key}
                className="flex items-center gap-3 bg-surface border border-border rounded-lg px-4 py-2.5"
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
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-10 md:pb-14">
            <div className="section-header mb-6">
                <div>
                    <p className="label-caps mb-1">Availability</p>
                    <h2 className="section-title">Where to Curate & Experience</h2>
                </div>
                <span className="text-xs text-text-3">India Region</span>
            </div>

            {indiaProviders ? (
                <div className="bg-surface border border-border rounded-lg p-6 sm:p-8">
                    {/* STREAMING */}
                    {streamingProviders.length > 0 && (
                        <div className="mb-6">
                            <h3 className="label-caps mb-3">Subscription</h3>
                            <div className="flex flex-wrap gap-3">
                                {streamingProviders.map((provider) =>
                                    renderProvider(provider, "stream")
                                )}
                            </div>
                        </div>
                    )}

                    {/* RENT */}
                    {rentProviders.length > 0 && (
                        <div className="mb-6">
                            <h3 className="label-caps mb-3">Rent</h3>
                            <div className="flex flex-wrap gap-3">
                                {rentProviders.map((provider) =>
                                    renderProvider(provider, "rent")
                                )}
                            </div>
                        </div>
                    )}

                    {/* BUY */}
                    {buyProviders.length > 0 && (
                        <div>
                            <h3 className="label-caps mb-3">Purchase</h3>
                            <div className="flex flex-wrap gap-3">
                                {buyProviders.map((provider) =>
                                    renderProvider(provider, "buy")
                                )}
                            </div>
                        </div>
                    )}

                    {!hasProviders && (
                        <p className="text-sm text-text-3">
                            No streaming distribution information available in this territory.
                        </p>
                    )}
                </div>
            ) : (
                <div className="bg-surface border border-border rounded-lg p-6 text-center">
                    <p className="text-sm text-text-3">
                        No distribution information available for this territory.
                    </p>
                </div>
            )}
        </section>
    );
}

export default WatchProviders;
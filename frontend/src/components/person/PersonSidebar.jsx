function PersonSidebar({ person, externalIds }) {
    const links = [
        {
            name: "IMDb",
            url: externalIds?.imdb_id
                ? `https://www.imdb.com/name/${externalIds.imdb_id}/`
                : null,
            icon: "rating"
        },
        {
            name: "Facebook",
            url: externalIds?.facebook_id
                ? `https://www.facebook.com/${externalIds.facebook_id}`
                : null,
            icon: "public"
        },
        {
            name: "Instagram",
            url: externalIds?.instagram_id
                ? `https://www.instagram.com/${externalIds.instagram_id}/`
                : null,
            icon: "photo_camera"
        },
        {
            name: "X",
            url: externalIds?.twitter_id
                ? `https://twitter.com/${externalIds.twitter_id}`
                : null,
            icon: "alternate_email"
        }
    ].filter((link) => link.url);

    const aliases = person?.also_known_as || [];

    return (
        <aside className="lg:col-span-4 flex flex-col gap-6">

            {aliases.length > 0 && (
                <div className="bg-[#181c20] rounded-xl p-6 shadow-md">

                    <div className="flex items-center gap-2 mb-4">

                        <span className="w-1.5 h-4 rounded bg-[#43fe6d]" />

                        <h3 className="text-xl font-bold text-white">
                            ALSO KNOWN AS
                        </h3>

                    </div>

                    <div className="flex flex-col gap-2">

                        {aliases.map((name) => (
                            <div
                                key={name}
                                className="bg-[#1c2024] px-3.5 py-2 rounded-lg text-[13px] text-[#e0e3e8]"
                            >
                                {name}
                            </div>
                        ))}

                    </div>

                </div>
            )}

            {links.length > 0 && (
                <div className="bg-[#181c20] rounded-xl p-6 shadow-md">

                    <div className="flex items-center gap-2 mb-4">

                        <span className="w-1.5 h-4 rounded bg-[#ffb787]" />

                        <h3 className="text-xl font-bold text-white">
                            EXTERNAL LINKS
                        </h3>

                    </div>

                    <div className="grid grid-cols-2 gap-2.5">

                        {links.map((link) => (
                            <a
                                key={link.name}
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2.5 bg-[#1c2024] hover:bg-[#2C3440] px-3 py-2 rounded-lg text-[#e0e3e8] transition-colors"
                            >

                                <span className="w-2 h-2 rounded-full bg-[#43fe6d]" />

                                <span className="text-[13px] font-medium">
                                    {link.name}
                                </span>

                                <span className="material-symbols-outlined text-[14px] text-[#99AABB] ml-auto">
                                    open_in_new
                                </span>

                            </a>
                        ))}

                    </div>

                </div>
            )}

            {person?.biography && (
                <div className="bg-[#181c20] rounded-xl p-6 shadow-md relative overflow-hidden">

                    <span className="material-symbols-outlined text-[#43fe6d]/10 text-[80px] absolute -bottom-4 -right-2">
                        format_quote
                    </span>

                    <span className="font-mono text-[11px] text-[#43fe6d] uppercase font-bold tracking-wider mb-2 block">
                        TMDB Biography
                    </span>

                    <blockquote className="text-[16px] text-[#e0e3e8] relative z-10 leading-relaxed">
                        {person.biography}
                    </blockquote>

                </div>
            )}

        </aside>
    );
}

export default PersonSidebar;
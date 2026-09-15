import Icon from "../common/Icon";

function ViewingDetails({
    watchedDate,
    setWatchedDate,
    viewingFormat,
    setViewingFormat,
    rewatch,
    setRewatch,
}) {
    return (
        <div className="bg-[#181c20] rounded-xl p-5 md:p-6 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2">
                <Icon className="text-[#43fe6d] text-[20px]">
                    calendar_clock
                </Icon>

                <h3 className="text-xl leading-7 text-white font-bold">
                    Viewing Details
                </h3>
            </div>

            <div>
                <label className="text-xs tracking-wider text-[#99AABB] uppercase block mb-2">
                    Date Watched
                </label>

                <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bacbb6] text-[18px] pointer-events-none">
                        event
                    </Icon>

                    <input
                        type="date"
                        value={watchedDate}
                        onChange={(e) => setWatchedDate(e.target.value)}
                        className="w-full bg-[#0B0D0F] text-[#e0e3e8] text-sm pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:bg-[#1c2024] transition-all cursor-pointer"
                    />
                </div>
            </div>

            <div>
                <label className="text-xs tracking-wider text-[#99AABB] uppercase block mb-2">
                    Viewing Format & Venue
                </label>

                <div className="grid grid-cols-2 gap-2">
                    {[
                        ["imax", "IMAX 70mm"],
                        ["dolby", "Dolby Cinema"],
                        ["oled", "4K HDR OLED"],
                        ["35mm", "35mm Print"],
                    ].map(([value, label]) => (
                        <label
                            key={value}
                            className="cursor-pointer"
                        >
                            <input
                                type="radio"
                                name="format"
                                value={value}
                                checked={viewingFormat === value}
                                onChange={(e) =>
                                    setViewingFormat(e.target.value)
                                }
                                className="sr-only peer"
                            />

                            <div className="p-2.5 rounded-lg bg-[#0B0D0F] peer-checked:bg-[#31353a] peer-checked:text-[#43fe6d] text-[#99AABB] text-center text-[13px] transition-all">
                                {label}
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div className="pt-2">
                <label className="flex items-center justify-between p-3 rounded-lg bg-[#0B0D0F] cursor-pointer hover:bg-[#1c2024] transition-colors">
                    <div className="flex items-center gap-3">
                        <Icon className="text-[#ffb787] text-[20px]">
                            repeat
                        </Icon>

                        <div>
                            <div className="text-sm text-white font-medium">
                                Rewatch
                            </div>

                            <div className="text-[13px] text-[#99AABB]">
                                I have watched this film before
                            </div>
                        </div>
                    </div>

                    <input
                        type="checkbox"
                        checked={rewatch}
                        onChange={(e) => setRewatch(e.target.checked)}
                        className="w-4 h-4 accent-[#43fe6d] rounded cursor-pointer"
                    />
                </label>
            </div>
        </div>
    );
}

export default ViewingDetails;

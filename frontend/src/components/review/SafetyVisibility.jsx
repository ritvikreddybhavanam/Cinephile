import Icon from "../common/Icon";

function SafetyVisibility({
    spoilers,
    setSpoilers,
    visibility,
    setVisibility,
}) {
    return (
        <div className="bg-[#181c20] rounded-xl p-5 md:p-6 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2">
                <Icon className="text-[#ffb787] text-[20px]">
                    shield
                </Icon>

                <h3 className="text-xl leading-7 text-white font-bold">
                    Safety & Visibility
                </h3>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0B0D0F] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Icon className="text-[#ffb4ab] text-[20px]">
                            warning
                        </Icon>

                        <span className="text-sm text-white font-medium">
                            Contains Spoilers
                        </span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={spoilers}
                            onChange={(e) =>
                                setSpoilers(e.target.checked)
                            }
                            className="sr-only peer"
                        />

                        <div className="w-10 h-5 bg-[#31353a] rounded-full peer peer-checked:bg-[#ff8000] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                </div>

                <p className="text-[13px] leading-[18px] text-[#99AABB]">
                    Applies a spoiler shield blur to protect community
                    readers until toggled open.
                </p>
            </div>

            <div>
                <label className="text-xs tracking-wider text-[#99AABB] uppercase block mb-2">
                    Visibility Tier
                </label>

                <div className="relative">
                    <select
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value)}
                        className="w-full bg-[#0B0D0F] text-[#e0e3e8] text-sm pl-4 pr-10 py-2.5 rounded-lg focus:outline-none focus:bg-[#1c2024] appearance-none cursor-pointer"
                    >
                        <option value="public">
                            Public (Show in global activity feed)
                        </option>

                        <option value="followers">
                            Followers & Critics Only
                        </option>

                        <option value="unlisted">
                            Unlisted (Accessible via link)
                        </option>

                        <option value="private">
                            Private Journal Entry (Only me)
                        </option>
                    </select>

                    <Icon className="absolute right-3 top-1/2 -translate-y-1/2 text-[#99AABB] pointer-events-none text-[18px]">
                        expand_more
                    </Icon>
                </div>
            </div>
        </div>
    );
}

export default SafetyVisibility;

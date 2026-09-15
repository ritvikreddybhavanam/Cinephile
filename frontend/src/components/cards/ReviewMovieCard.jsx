import Icon from "../common/Icon";

function ReviewMovieCard() {
    return (
        <div className="mt-8 rounded-xl bg-[#181c20] p-4 md:p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#ff8000]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
                <div className="relative flex-shrink-0 group overflow-hidden rounded-lg shadow-md aspect-[2/3] w-24 sm:w-28">
                    <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        alt="Blade Runner 2049 poster"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqIMNhiyXsgb5_OnuA3q7cO-KyLrFUrSWQE4xDwu1Gu2udE-_579j1MMlJwh4iNNHUF7TKJ7iJQIXuT_OdFqng-p3c7lIttPF-QlASLyWqtauyytF90YLT9XbDU0Mnlh7eCCmMfdBGdAEfFIezoaaD6eRYQKrqqe5u0oqJK22MQGSnbK1sG22dZY-T0B3TRGN8slLIyJJoXvbXcGJTAq10Y7bpZOWlhvUVZDPe9Tiq6nilCb-1pnHh"
                    />

                    <div className="absolute inset-0 bg-[#0B0D0F]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Icon className="text-white text-[22px]">
                            visibility
                        </Icon>
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-xs px-2 py-0.5 rounded bg-[#2C3440] text-white">
                            Sci-Fi
                        </span>

                        <span className="text-xs px-2 py-0.5 rounded bg-[#2C3440] text-white">
                            Neo-Noir
                        </span>

                        <span className="text-xs px-2 py-0.5 rounded bg-[#2C3440] text-[#99AABB]">
                            Mystery
                        </span>

                        <span className="text-xs text-[#99AABB] ml-2 flex items-center gap-1">
                            <Icon className="text-[14px]">
                                schedule
                            </Icon>
                            164 mins
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                        <h2 className="text-xl leading-7 text-white font-bold tracking-tight">
                            Blade Runner 2049
                        </h2>

                        <span className="text-sm leading-5 text-[#99AABB]">
                            2017 • Directed by{" "}
                            <span className="text-[#e0e3e8] font-medium">
                                Denis Villeneuve
                            </span>
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 pt-3 text-[#99AABB] text-[13px] leading-[18px]">
                        <div>
                            <span className="text-[#99AABB]/70">
                                Cinematography:
                            </span>{" "}
                            <span className="text-[#e0e3e8]">
                                Roger Deakins, ASC
                            </span>
                        </div>

                        <div>
                            <span className="text-[#99AABB]/70">
                                Score:
                            </span>{" "}
                            <span className="text-[#e0e3e8]">
                                Hans Zimmer & Benjamin Wallfisch
                            </span>
                        </div>

                        <div>
                            <span className="text-[#99AABB]/70">
                                Starring:
                            </span>{" "}
                            <span className="text-[#e0e3e8]">
                                Ryan Gosling, Harrison Ford, Ana de Armas
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0 self-stretch sm:self-center flex sm:flex-col justify-end items-end gap-2 pt-2 sm:pt-0">
                    <button
                        type="button"
                        className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#262a2f] hover:bg-[#2C3440] text-white text-sm flex items-center justify-center gap-1.5 transition-all"
                    >
                        <Icon className="text-[16px]">
                            sync_alt
                        </Icon>
                        Change Film
                    </button>

                    <a
                        href="#"
                        className="text-[13px] text-[#43fe6d] hover:underline flex items-center gap-1"
                    >
                        Film info
                        <Icon className="text-[14px]">
                            open_in_new
                        </Icon>
                    </a>
                </div>
            </div>
        </div>
    );
}

export default ReviewMovieCard;

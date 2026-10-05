import Icon from "../common/Icon";

function ReviewMovieCard() {
    return (
        <div className="mt-8 rounded-lg bg-surface border border-border p-4 md:p-6 shadow-card relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">

                {/* Poster */}
                <div className="relative flex-shrink-0 group overflow-hidden rounded-lg shadow-card aspect-[2/3] w-24 sm:w-28">
                    <img
                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                        alt="Blade Runner 2049 poster"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqIMNhiyXsgb5_OnuA3q7cO-KyLrFUrSWQE4xDwu1Gu2udE-_579j1MMlJwh4iNNHUF7TKJ7iJQIXuT_OdFqng-p3c7lIttPF-QlASLyWqtauyytF90YLT9XbDU0Mnlh7eCCmMfdBGdAEfFIezoaaD6eRYQKrqqe5u0oqJK22MQGSnbK1sG22dZY-T0B3TRGN8slLIyJJoXvbXcGJTAq10Y7bpZOWlhvUVZDPe9Tiq6nilCb-1pnHh"
                    />
                    <div className="absolute inset-0 bg-bg/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Icon className="text-text text-[20px]">visibility</Icon>
                    </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="badge badge-accent">Sci-Fi</span>
                        <span className="badge badge-accent">Neo-Noir</span>
                        <span className="text-[11px] text-text-3 flex items-center gap-1">
                            <Icon className="text-[13px]">schedule</Icon>
                            164 min
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                        <h2 className="text-lg font-serif font-semibold text-text tracking-tight">
                            Blade Runner 2049
                        </h2>
                        <span className="text-sm text-text-3">
                            2017 · Directed by{" "}
                            <span className="text-text-2 font-medium">Denis Villeneuve</span>
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 pt-3 border-t border-border text-[12px]">
                        <div>
                            <span className="text-text-3">Cinematography: </span>
                            <span className="text-text-2">Roger Deakins, ASC</span>
                        </div>
                        <div>
                            <span className="text-text-3">Score: </span>
                            <span className="text-text-2">Hans Zimmer & Benjamin Wallfisch</span>
                        </div>
                        <div>
                            <span className="text-text-3">Starring: </span>
                            <span className="text-text-2">Ryan Gosling, Harrison Ford, Ana de Armas</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 self-stretch sm:self-center flex sm:flex-col justify-end items-end gap-2 pt-2 sm:pt-0">
                    <button
                        type="button"
                        className="btn-secondary text-xs py-2 px-4"
                    >
                        <Icon className="text-[14px]">sync_alt</Icon>
                        Change Film
                    </button>
                    <a
                        href="#"
                        className="text-[12px] text-accent hover:text-accent-hover flex items-center gap-1 no-underline transition-colors"
                    >
                        Film info
                        <Icon className="text-[13px]">open_in_new</Icon>
                    </a>
                </div>
            </div>
        </div>
    );
}

export default ReviewMovieCard;

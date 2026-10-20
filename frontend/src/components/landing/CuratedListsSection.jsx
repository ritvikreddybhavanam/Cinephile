import { Link, useNavigate } from "react-router-dom";
import Icon from "../common/Icon";

export default function CuratedListsSection({ lists = [], loading = false }) {
    const navigate = useNavigate();

    return (
        <section className="page-container" aria-label="Curated Watchlists and Collections">
            <div className="section-header">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-accent text-[18px]">
                            format_list_bulleted
                        </span>
                        <p className="label-caps !mb-0">Handcrafted Anthologies</p>
                    </div>
                    <h2 className="section-title">Curated Watchlists & Collections</h2>
                    <p className="text-xs text-text-3 mt-1">
                        Thematic marathons, auteur retrospectives, and essential film canons
                    </p>
                </div>
                <Link to="/lists" className="section-link">
                    <span>Browse All Lists</span>
                    <Icon className="text-sm">arrow_forward</Icon>
                </Link>
            </div>

            {loading ? (
                <div className="card-grid-fluid gap-4 sm:gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="mc-card p-5 space-y-4">
                            <div className="h-24 w-full skeleton rounded-lg" />
                            <div className="h-4 w-3/4 skeleton rounded" />
                            <div className="h-3 w-1/2 skeleton rounded" />
                        </div>
                    ))}
                </div>
            ) : (!lists || lists.length === 0) ? (
                <div className="p-8 rounded-xl border border-border bg-surface text-center text-xs text-text-3">
                    No curated lists found.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {lists.map((list) => (
                        <div
                            key={list.id}
                            onClick={() => {
                                if (list.isUserList) {
                                    navigate(`/lists/${list.id}`);
                                } else if (list.genreId) {
                                    navigate(`/genres`);
                                } else {
                                    navigate(`/lists`);
                                }
                            }}
                            className="mc-card group flex flex-col justify-between p-5 cursor-pointer hover:border-accent/40 transition-all duration-200"
                        >
                            <div>
                                {/* Multi-poster collage with distinctive posters */}
                                <div className="mb-5 flex items-center justify-center -space-x-5 overflow-hidden py-2">
                                    {list.posters && list.posters.length > 0 ? (
                                        list.posters.map((poster, idx) => (
                                            <img
                                                key={idx}
                                                src={poster}
                                                alt="List poster"
                                                loading="lazy"
                                                className={`h-24 w-16 rounded-md object-cover border-2 border-surface shadow-md transition-transform duration-300 group-hover:scale-105 ${
                                                    idx === 1
                                                        ? "z-10 -translate-y-2 scale-[1.08] shadow-xl"
                                                        : "opacity-75"
                                                }`}
                                            />
                                        ))
                                    ) : (
                                        <div className="h-24 w-48 rounded-md bg-surface-2 flex items-center justify-center text-xs text-text-3">
                                            Curated Anthology
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-accent/15 text-accent font-semibold">
                                        {list.tag || "Cinephile Editorial"}
                                    </span>
                                </div>

                                <h3 className="mb-2 text-sm sm:text-base font-semibold text-text transition-colors group-hover:text-accent leading-snug">
                                    {list.title}
                                </h3>
                                <p className="text-xs text-text-3 line-clamp-2 leading-relaxed">
                                    {list.description}
                                </p>
                            </div>

                            <div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-[11px] text-text-3">
                                <span className="font-mono">
                                    {list.filmsCount} films {list.curator ? `· by ${list.curator}` : ""}
                                </span>
                                <span className="text-accent font-semibold tracking-wider group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                                    <span>Explore</span>
                                    <span>→</span>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

import { Link } from "react-router-dom";

export default function JoinCommunityCta({ token }) {
    return (
        <section className="page-container pb-8" aria-label="Join Cinephile Community">
            <div className="relative overflow-hidden rounded-2xl border border-accent/25 bg-surface p-8 sm:p-12 md:p-16 text-center shadow-elevated">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,168,106,0.08)_0%,transparent_70%)] pointer-events-none" />

                <div className="relative z-10 mx-auto max-w-2xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-semibold uppercase tracking-wider mb-4">
                        <span className="material-symbols-outlined text-[15px]">movie</span>
                        <span>Cinema Culture & Community</span>
                    </div>

                    <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-text tracking-tight mb-5 leading-tight">
                        Begin Your Film Journal
                    </h2>

                    <p className="text-sm sm:text-base text-text-2 leading-relaxed max-w-xl mx-auto mb-8 font-sans">
                        Rate and log every film you watch. Express your critical voice with detailed reviews, assemble thematic watchlists, and connect with people who revere the craft of cinema.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left max-w-xl mx-auto">
                        <div className="p-3.5 rounded-xl bg-surface-2 border border-border/80">
                            <span className="material-symbols-outlined text-accent text-xl mb-1.5">
                                edit_calendar
                            </span>
                            <h4 className="text-xs font-bold text-text mb-0.5">Personal Diary</h4>
                            <p className="text-[11px] text-text-3">Log watch dates, venues, rewatches, and private notes.</p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-surface-2 border border-border/80">
                            <span className="material-symbols-outlined text-accent text-xl mb-1.5">
                                bookmark
                            </span>
                            <h4 className="text-xs font-bold text-text mb-0.5">Curated Watchlists</h4>
                            <p className="text-[11px] text-text-3">Save films by mood, streaming service, or auteur.</p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-surface-2 border border-border/80">
                            <span className="material-symbols-outlined text-accent text-xl mb-1.5">
                                groups
                            </span>
                            <h4 className="text-xs font-bold text-text mb-0.5">Cinema Community</h4>
                            <p className="text-[11px] text-text-3">Follow reviewers with aligned taste and join discussions.</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                        {token ? (
                            <Link to="/movies" className="btn-primary px-8 py-3.5 text-xs sm:text-sm shadow-lg shadow-accent/20">
                                Discover Films Catalog
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn-primary px-8 py-3.5 text-xs sm:text-sm shadow-lg shadow-accent/20">
                                    Create Free Cinephile Account
                                </Link>
                                <Link to="/movies" className="btn-secondary px-8 py-3.5 text-xs sm:text-sm">
                                    Browse Public Catalog
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

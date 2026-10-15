import React from "react";
import { Link } from "react-router-dom";

function MovieKeywords({ keywords = [] }) {
    const list = Array.isArray(keywords) ? keywords : [];
    if (list.length === 0) return null;

    return (
        <section className="page-container pb-10 md:pb-14">
            <div className="section-header mb-4">
                <div>
                    <p className="label-caps mb-1">Taxonomy</p>
                    <h2 className="section-title">Story Themes & Keywords</h2>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {list.map((kw) => (
                    <Link
                        key={kw.id || kw.name}
                        to={`/movies?search=${encodeURIComponent(kw.name)}`}
                        className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-2 transition-all duration-200 hover:border-accent/50 hover:bg-surface-2 hover:text-accent no-underline"
                    >
                        <span className="material-symbols-outlined text-[13px] text-text-3 group-hover:text-accent">
                            tag
                        </span>
                        <span className="font-medium capitalize">{kw.name}</span>
                    </Link>
                ))}
            </div>
        </section>
    );
}

export default MovieKeywords;

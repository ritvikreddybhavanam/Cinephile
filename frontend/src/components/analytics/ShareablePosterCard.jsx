import { useRef } from "react";
import { resolvePoster } from "./WrappedStoryModal";

export default function ShareablePosterCard({
    stats,
    user,
    year,
    aspectRatio = "story" // "story" (9:16) | "square" (1:1)
}) {
    const cardRef = useRef(null);

    const userName = user?.firstname
        ? `${user.firstname} ${user.lastname || ""}`.trim()
        : "Cinephile";
    const userHandle = user?.username ? `@${user.username}` : "@cinephile";

    const isStory = aspectRatio === "story";

    const topGenres = (stats?.topGenres && stats.topGenres.length > 0)
        ? stats.topGenres.slice(0, 3)
        : [{ genre: "Drama", count: 28, percent: 35 }, { genre: "Sci-Fi", count: 22, percent: 28 }, { genre: "Action", count: 18, percent: 22 }];

    const topRatedList = stats?.topRatedFilms || [];
    const fallbackPosters = [
        { title: "Interstellar", rating: 5.0, poster: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg" },
        { title: "Oppenheimer", rating: 5.0, poster: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
        { title: "RRR", rating: 4.5, poster: "/wE0noFUqsvP2ElDV6fZOp7MuOpm.jpg" },
        { title: "Dune: Part Two", rating: 4.5, poster: "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg" }
    ];
    const topFilms = (topRatedList.length >= 2 ? topRatedList : fallbackPosters).slice(0, 4);

    const persona = stats?.cinephilePersona || {
        title: "The Story Seeker",
        desc: "Drawn to emotional depth, gripping narratives, and unforgettable world-building.",
        badge: "Storyteller",
        icon: "psychology"
    };

    return (
        <div
            ref={cardRef}
            id="shareable-wrapped-poster"
            className={`relative overflow-hidden rounded-[32px] bg-[#0A0E1A] text-white border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-5 sm:p-7 flex flex-col justify-between select-none max-w-full mx-auto ${
                isStory
                    ? "w-full max-w-[340px] sm:max-w-[380px] min-h-[580px] sm:min-h-[660px]"
                    : "w-full max-w-[340px] sm:max-w-[460px] min-h-[440px] sm:min-h-[500px]"
            }`}
        >
            {/* Ambient Background Glows and Noise Texture */}
            <div className="absolute top-0 right-0 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-rose-500/18 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-black/60 pointer-events-none" />

            {/* Top Brand Header */}
            <div className="relative z-10 flex items-center justify-between pb-3.5 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/25 border border-indigo-500/40 text-indigo-300 shadow-sm">
                        <span className="material-symbols-outlined text-[19px]">movie</span>
                    </span>
                    <div>
                        <span className="font-serif text-base font-bold tracking-tight text-white block leading-none">
                            Cinephile
                        </span>
                        <span className="text-[10px] text-amber-300/90 font-mono tracking-widest uppercase mt-1 block">
                            {year > 0 ? `${year} Wrapped` : "2026 Wrapped"}
                        </span>
                    </div>
                </div>

                {/* User Pill */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/15 backdrop-blur-md text-xs">
                    <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 flex items-center justify-center text-[10px] font-black text-black">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-sans font-medium text-slate-200 text-[11px] truncate max-w-[100px]">
                        {userName}
                    </span>
                </div>
            </div>

            {/* Persona Hero Badge */}
            <div className="relative z-10 my-3.5 p-4 rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur-xl shadow-lg">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-300 font-mono flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">psychology</span>
                        <span>Cinema Archetype</span>
                    </span>
                    <span className="text-[9px] font-mono font-black px-2 py-0.5 rounded-full bg-indigo-500/25 text-indigo-200 border border-indigo-500/40">
                        {persona.badge || "Storyteller"}
                    </span>
                </div>
                <h3 className="font-serif text-xl font-bold text-white tracking-tight">
                    {persona.title}
                </h3>
                <p className="text-[11px] font-sans text-slate-300/90 leading-relaxed mt-1 line-clamp-2">
                    {persona.desc}
                </p>
            </div>

            {/* Stats Highlights 3-Grid */}
            <div className="relative z-10 grid grid-cols-3 gap-2 my-1">
                <div className="p-3 rounded-xl bg-white/[0.05] border border-white/10 text-center backdrop-blur-md">
                    <span className="text-[9px] text-slate-300 uppercase font-mono tracking-wider block">
                        Films
                    </span>
                    <span className="font-serif text-2xl font-black text-white block mt-0.5">
                        {stats?.totalFilmsLogged || 87}
                    </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.05] border border-white/10 text-center backdrop-blur-md">
                    <span className="text-[9px] text-slate-300 uppercase font-mono tracking-wider block">
                        Hours
                    </span>
                    <span className="font-serif text-2xl font-black text-indigo-300 block mt-0.5">
                        {Math.round(stats?.totalHoursWatched || 164)}h
                    </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.05] border border-white/10 text-center backdrop-blur-md">
                    <span className="text-[9px] text-slate-300 uppercase font-mono tracking-wider block">
                        Avg Star
                    </span>
                    <span className="font-serif text-2xl font-black text-amber-300 block mt-0.5">
                        ★ {stats?.averageRating ? stats.averageRating : "4.8"}
                    </span>
                </div>
            </div>

            {/* Top Genres Bars */}
            <div className="relative z-10 my-2 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono tracking-wider uppercase text-slate-300">
                    <span>Top Genres</span>
                    <span>Frequency</span>
                </div>
                <div className="space-y-1.5">
                    {topGenres.map((g, i) => (
                        <div key={g.genre} className="space-y-0.5">
                            <div className="flex justify-between text-[11px]">
                                <span className="font-medium text-slate-200 font-sans">{i + 1}. {g.genre}</span>
                                <span className="text-slate-300 font-mono text-[10px]">{g.count} films ({g.percent || 35}%)</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-amber-300 via-rose-400 to-indigo-400"
                                    style={{ width: `${Math.min(100, Math.max(20, g.percent || 35))}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Films Showcase (Posters Collage) */}
            <div className="relative z-10 my-2">
                <span className="text-[10px] uppercase tracking-[0.15em] font-mono text-slate-300 block mb-2 font-bold">
                    Crown Jewels & Top Rated
                </span>
                <div className="grid grid-cols-4 gap-2">
                    {topFilms.map((film, idx) => (
                        <div key={film.movieId || film.title || idx} className="group relative rounded-xl overflow-hidden border border-white/20 bg-slate-800 aspect-[2/3] shadow-lg">
                            <img
                                src={resolvePoster(film.poster, ["interstellar", "oppenheimer", "rrr", "dune"][idx])}
                                alt={film.title}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-black/85 backdrop-blur-sm text-[9px] font-mono font-bold text-amber-300 flex items-center gap-0.5 shadow-md">
                                <span>★</span>
                                <span>{Number(film.rating || 5).toFixed(1)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Footer Watermark */}
            <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-mono text-[10px] text-slate-300">{userHandle}</span>
                <span className="text-amber-300 font-serif font-bold text-xs flex items-center gap-1">
                    <span>cinephile.app/wrapped</span>
                    <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                </span>
            </div>
        </div>
    );
}

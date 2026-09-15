function PersonStats({ credits }) {
    const cast = credits?.cast || [];
    const crew = credits?.crew || [];

    const directing = crew.filter(
        (movie) => movie.job === "Director"
    ).length;

    const writing = crew.filter(
        (movie) =>
            movie.department === "Writing" ||
            movie.job === "Writer" ||
            movie.job === "Screenplay" ||
            movie.job === "Story"
    ).length;

    const producing = crew.filter(
        (movie) =>
            movie.department === "Production" ||
            movie.job?.toLowerCase().includes("producer")
    ).length;

    const acting = cast.length;

    const totalCredits =
        new Set([
            ...cast.map((movie) => movie.id),
            ...crew.map((movie) => movie.id)
        ]).size;

    return (
        <section className="lg:col-span-5 bg-[#181c20] p-6 md:p-8 rounded-xl shadow-md">

            <div className="flex items-center justify-between mb-4">

                <div className="flex items-center gap-2">

                    <span className="w-1.5 h-4 rounded bg-[#ff8000]" />

                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        CAREER STATISTICS
                    </h2>

                </div>

                <span className="font-mono text-[11px] text-[#99AABB] uppercase">
                    TMDB Credits
                </span>

            </div>

            <p className="text-sm text-[#99AABB] mb-6">
                Filmography statistics calculated from the person's TMDB credits.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

                <StatCard
                    label="Total Credits"
                    value={totalCredits}
                    suffix="titles"
                    color="primary"
                />

                <StatCard
                    label="Directing"
                    value={directing}
                    suffix="films"
                    color="primary"
                />

                <StatCard
                    label="Writing"
                    value={writing}
                    suffix="credits"
                    color="orange"
                />

                <StatCard
                    label="Producing"
                    value={producing}
                    suffix="credits"
                    color="purple"
                />

                <StatCard
                    label="Acting"
                    value={acting}
                    suffix="credits"
                    color="gray"
                />

            </div>

            <div className="mt-4 pt-3 flex items-center justify-between font-mono text-[11px] text-[#99AABB]">

                <span className="flex items-center gap-1.5">

                    <span className="w-1.5 h-1.5 rounded-full bg-[#43fe6d]" />

                    TMDB Verified Credits

                </span>

            </div>

        </section>
    );
}

function StatCard({
                      label,
                      value,
                      suffix,
                      color
                  }) {
    const barColors = {
        primary: "bg-[#43fe6d]",
        orange: "bg-[#ff8000]",
        purple: "bg-[#ffd5c5]",
        gray: "bg-[#859582]"
    };

    return (
        <div className="bg-[#1c2024] p-4 rounded-lg flex flex-col justify-center">

            <span className="font-mono text-[10px] text-[#99AABB] uppercase tracking-wider">
                {label}
            </span>

            <div className="flex items-baseline gap-1 mt-1">

                <span className="text-[30px] font-extrabold text-white leading-none">
                    {value}
                </span>

                <span className="text-[13px] text-[#99AABB]">
                    {suffix}
                </span>

            </div>

            <div className="w-full bg-[#2C3440] h-1 rounded-full mt-3 overflow-hidden">

                <div
                    className={`${barColors[color]} h-full rounded-full`}
                    style={{
                        width: `${Math.min(
                            100,
                            Math.max(10, value)
                        )}%`
                    }}
                />

            </div>

        </div>
    );
}

export default PersonStats;
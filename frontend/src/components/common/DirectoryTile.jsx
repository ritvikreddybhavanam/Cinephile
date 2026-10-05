import { Link } from "react-router-dom";

function DirectoryTile({ title, to }) {
    return (
        <Link
            to={to}
            className="group relative flex min-h-[64px] w-full items-center justify-between overflow-hidden rounded-lg border border-border bg-surface px-6 py-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-card-hover no-underline"
        >
            <span className="font-serif text-base sm:text-lg font-semibold tracking-tight text-text group-hover:text-accent transition-colors">
                {title}
            </span>

            <span className="material-symbols-outlined text-text-3 group-hover:text-accent group-hover:translate-x-1 transition-all text-[20px]">
                arrow_forward
            </span>
        </Link>
    );
}

export default DirectoryTile;
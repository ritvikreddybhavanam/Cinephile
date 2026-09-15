import { Link } from "react-router-dom";

function DirectoryTile({ title, to }) {
    return (
        <Link
            to={to}
            className="group block w-full py-4 px-6 bg-[#181c20] hover:bg-[#1d2228] border border-neutral-800 hover:border-[#00e054]/50 rounded text-center transition-all duration-200 shadow-sm"
        >
            <span className="text-base md:text-lg font-medium tracking-wide text-neutral-200 group-hover:text-white">
                {title}
            </span>
        </Link>
    );
}

export default DirectoryTile;

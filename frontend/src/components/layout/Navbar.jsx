import { useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function Navbar() {
    const { token, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const navLinkClass = ({ isActive }) =>
        `relative font-body-md text-body-md no-underline transition-colors duration-200
${
    isActive
        ? "text-primary after:absolute after:left-0 after:right-0 after:-bottom-[10px] after:h-[2px] after:bg-primary"
        : "text-on-surface-variant hover:text-primary"
}`;

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="sticky top-0 z-[1000] w-full border-b border-border-subtle bg-surface">
            <div className="mx-auto flex h-20 w-full max-w-[1400px] items-center justify-between px-5 min-[701px]:px-6 min-[901px]:px-16">

                <Link
                    to="/"
                    className="whitespace-nowrap font-headline-lg text-headline-lg font-bold tracking-[-0.02em] text-primary no-underline min-[701px]:text-[26px] min-[901px]:text-[32px]"
                >
                    Cinephile 🎬
                </Link>

                <div className="hidden items-center gap-[18px] min-[701px]:flex min-[901px]:gap-8">

                    <NavLink to="/dashboard" className={navLinkClass}>
                        Dashboard
                    </NavLink>

                    <NavLink to="/movies" className={navLinkClass}>
                        Movies
                    </NavLink>

                    <NavLink to="/genres" className={navLinkClass}>
                        Genres
                    </NavLink>

                    <NavLink to="/trending" className={navLinkClass}>
                        Trending
                    </NavLink>

                    <NavLink to="/box-prediction" className={navLinkClass}>
                        Box Prediction
                    </NavLink>

                    <NavLink to="/more" className={navLinkClass}>
                        More
                    </NavLink>

                </div>

                <div className="flex items-center gap-2 min-[701px]:gap-4">

                    <NavLink to="/favorites" className={navLinkClass}>
                        Favorites
                    </NavLink>

                    <NavLink to="/watchlist" className={navLinkClass}>
                        Watchlist
                    </NavLink>

                    {token ? (
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="ml-2 cursor-pointer border-none bg-transparent font-body-md text-body-md text-on-surface-variant transition-colors duration-200 hover:text-primary"
                        >
                            Logout
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            className="ml-2 font-body-md text-body-md text-on-surface-variant no-underline transition-colors duration-200 hover:text-primary"
                        >
                            Login
                        </Link>
                    )}

                </div>

            </div>
        </nav>
    );
}

export default Navbar;

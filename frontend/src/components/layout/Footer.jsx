import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="w-full border-t border-border bg-surface mt-16">
            <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-8 px-4 py-10 text-center sm:px-6 md:flex-row md:px-10 md:text-left lg:px-12">

                {/* Brand */}
                <div>
                    <Link
                        to="/"
                        className="font-serif text-2xl font-semibold text-accent no-underline"
                        aria-label="Cinephile home"
                    >
                        Cinephile
                    </Link>
                    <p className="mt-2 text-xs text-text-3 leading-relaxed max-w-[240px] md:max-w-none">
                        A platform for serious film lovers.
                    </p>
                    <p className="mt-1 text-xs text-text-3">
                        © {new Date().getFullYear()} Cinephile. All rights reserved.
                    </p>
                </div>

                {/* Links */}
                <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-x-8 gap-y-3 md:justify-end">
                    <Link
                        to="/about"
                        className="text-sm text-text-3 no-underline transition-colors duration-200 hover:text-text"
                    >
                        About
                    </Link>
                    <Link
                        to="/community"
                        className="text-sm text-text-3 no-underline transition-colors duration-200 hover:text-text"
                    >
                        Community
                    </Link>
                    <Link
                        to="/privacy"
                        className="text-sm text-text-3 no-underline transition-colors duration-200 hover:text-text"
                    >
                        Privacy
                    </Link>
                    <Link
                        to="/terms"
                        className="text-sm text-text-3 no-underline transition-colors duration-200 hover:text-text"
                    >
                        Terms
                    </Link>
                </nav>
            </div>
        </footer>
    );
}

export default Footer;

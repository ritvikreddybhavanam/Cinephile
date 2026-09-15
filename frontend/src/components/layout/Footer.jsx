import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="w-full border-t border-[#262626] bg-[#0b0d0f]">
            <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-8 px-6 py-8 min-[801px]:px-16 max-[800px]:flex-col max-[800px]:items-center max-[800px]:text-center">

                <div className="footer-brand-section">
                    <Link
                        to="/"
                        className="font-['Hanken_Grotesk'] text-[32px] font-bold text-[#43fe6d] no-underline"
                    >
                        Cinephile 🎬
                    </Link>

                    <p className="mt-2 font-['Inter'] text-base text-[#a0a0a0]">
                        © 2026 Cinephile 🎬. All rights reserved.
                    </p>
                </div>

                <div className="flex flex-wrap gap-8 max-[800px]:justify-center max-[800px]:gap-x-6 max-[800px]:gap-y-4">
                    <Link
                        to="/about"
                        className="font-['Inter'] text-base text-[#a0a0a0] no-underline transition-colors duration-200 hover:text-[#e0e3e8]"
                    >
                        About Us
                    </Link>

                    <Link
                        to="/community"
                        className="font-['Inter'] text-base text-[#a0a0a0] no-underline transition-colors duration-200 hover:text-[#e0e3e8]"
                    >
                        Community
                    </Link>

                    <Link
                        to="/privacy"
                        className="font-['Inter'] text-base text-[#a0a0a0] no-underline transition-colors duration-200 hover:text-[#e0e3e8]"
                    >
                        Privacy Policy
                    </Link>

                    <Link
                        to="/terms"
                        className="font-['Inter'] text-base text-[#a0a0a0] no-underline transition-colors duration-200 hover:text-[#e0e3e8]"
                    >
                        Terms of Service
                    </Link>
                </div>

            </div>
        </footer>
    );
}

export default Footer;

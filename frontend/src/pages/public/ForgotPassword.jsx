import { useState } from "react";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Reset link requested for:", email);
    };

    return (
        <div className="min-h-screen bg-[#0B0D0F] text-[#E0E3E8] flex flex-col font-['Inter'] overflow-x-hidden selection:bg-[#43FE6D] selection:text-[#00390F]">
            <main className="flex-grow flex items-center justify-center relative w-full px-5 md:px-16 py-12 md:py-24">
                <div className="absolute inset-0 z-0">
                    <div
                        className="bg-cover bg-center w-full h-full opacity-30 mix-blend-luminosity"
                        style={{
                            backgroundImage:
                                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDi2IhKsw2VrQAtfYbqI5WZFtzWuv1wl2DKCTqnjmaR7VqTstf-xWuWuj8jd7Jgke4lMHFsYD9AB2n4ZdPsekWYN9qC9AGH6wDK6HJe1kMu0UHHHOtmhIZAq7mb19TIaDNosjksQVPK_0YxX7UZwoEUN1qcFUEWv4mJtKFpWbjitdGrzL9V0Es0h0QeNfhfbkUXo6yUMCUobzLrqSkBQ6gWkkVmdXEZH5uPnSxjWYF-HTCeGNmnfrKz')",
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0F] via-[#0B0D0F]/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D0F] via-transparent to-[#0B0D0F]" />
                </div>

                <div className="relative z-10 w-full max-w-md">
                    <div className="bg-[#101418]/80 backdrop-blur-md border border-[#262626] rounded-xl p-8 md:p-10 shadow-2xl flex flex-col items-center">
                        <h1 className="font-['Hanken_Grotesk'] text-2xl md:text-[32px] md:leading-[40px] font-bold text-[#43FE6D] mb-4 text-center">
                            Forgot Your Password?
                        </h1>

                        <p className="text-[#A0A0A0] text-center mb-8 font-['Inter'] text-base leading-6 max-w-sm">
                            Enter the email address associated with your account, and we'll send you a link to reset your password.
                        </p>

                        <form
                            onSubmit={handleSubmit}
                            className="w-full flex flex-col space-y-4"
                        >
                            <div className="flex flex-col space-y-2">
                                <label
                                    htmlFor="email"
                                    className="font-['Inter'] text-xs leading-4 tracking-wider font-semibold text-[#BACBB6]"
                                >
                                    Email Address
                                </label>

                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A0A0] transition-colors group-focus-within:text-[#43FE6D]">
                                        mail
                                    </span>

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="director@filmbuff.com"
                                        className="w-full bg-[#1C2024] border border-[#262626] rounded-lg py-3 pl-12 pr-4 text-[#E0E3E8] placeholder-[#A0A0A0] focus:border-[#43FE6D] focus:ring-1 focus:ring-[#43FE6D] focus:outline-none transition-all duration-300 font-['Inter'] text-base leading-6"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#00E054] text-[#005D1E] font-['Inter'] text-xs leading-4 tracking-wider font-semibold uppercase py-4 rounded-lg hover:bg-[#43FE6D] transition-colors duration-300 flex items-center justify-center gap-2 mt-4 shadow-[0_0_15px_rgba(234,179,8,0.2)] hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                            >
                                <span>Send Reset Link</span>
                                <span className="material-symbols-outlined text-[18px]">
                                    arrow_forward
                                </span>
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <a
                                href="/login"
                                className="font-['Inter'] text-xs leading-4 tracking-wider font-semibold text-[#A0A0A0] hover:text-[#43FE6D] transition-colors duration-300 flex items-center justify-center gap-1"
                            >
                                <span className="material-symbols-outlined text-[16px]">
                                    arrow_back
                                </span>
                                Back to Login
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-[#0B0D0F] border-t border-[#262626] w-full z-20 relative">
                <div className="max-w-[1400px] mx-auto px-5 md:px-16 py-8 flex flex-col md:flex-row justify-between items-center w-full">
                    <div className="font-['Hanken_Grotesk'] text-[32px] leading-[40px] font-bold text-[#43FE6D] mb-4 md:mb-0">
                        Cinephile 🎬
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 mb-4 md:mb-0">
                        <a
                            href="#"
                            className="font-['Inter'] text-base leading-6 text-[#A0A0A0] hover:text-[#E0E3E8] transition-colors cursor-pointer"
                        >
                            About Us
                        </a>
                        <a
                            href="#"
                            className="font-['Inter'] text-base leading-6 text-[#A0A0A0] hover:text-[#E0E3E8] transition-colors cursor-pointer"
                        >
                            Community
                        </a>
                        <a
                            href="#"
                            className="font-['Inter'] text-base leading-6 text-[#A0A0A0] hover:text-[#E0E3E8] transition-colors cursor-pointer"
                        >
                            Privacy Policy
                        </a>
                        <a
                            href="#"
                            className="font-['Inter'] text-base leading-6 text-[#A0A0A0] hover:text-[#E0E3E8] transition-colors cursor-pointer"
                        >
                            Terms of Service
                        </a>
                    </div>

                    <div className="font-['Inter'] text-base leading-6 text-[#A0A0A0]">
                        © 2024 Cinephile 🎬. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ForgotPassword;


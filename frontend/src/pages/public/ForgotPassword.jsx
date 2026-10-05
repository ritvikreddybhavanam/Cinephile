import { useState } from "react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Reset link requested for:", email);
    };

    return (
        <div className="min-h-screen bg-bg text-text flex flex-col font-sans overflow-x-hidden antialiased">
            <main className="flex-grow flex items-center justify-center relative w-full px-5 md:px-16 py-12 md:py-24">
                <div className="absolute inset-0 z-0">
                    <div
                        className="bg-cover bg-center w-full h-full opacity-20 mix-blend-luminosity"
                        style={{
                            backgroundImage:
                                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDi2IhKsw2VrQAtfYbqI5WZFtzWuv1wl2DKCTqnjmaR7VqTstf-xWuWuj8jd7Jgke4lMHFsYD9AB2n4ZdPsekWYN9qC9AGH6wDK6HJe1kMu0UHHHOtmhIZAq7mb19TIaDNosjksQVPK_0YxX7UZwoEUN1qcFUEWv4mJtKFpWbjitdGrzL9V0Es0h0QeNfhfbkUXo6yUMCUobzLrqSkBQ6gWkkVmdXEZH5uPnSxjWYF-HTCeGNmnfrKz')",
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-bg via-transparent to-bg" />
                </div>

                <div className="relative z-10 w-full max-w-md">
                    <div className="bg-surface/90 backdrop-blur-md border border-border rounded-lg p-8 md:p-10 shadow-elevated flex flex-col items-center">
                        <Link to="/" className="no-underline mb-6">
                            <span className="font-serif text-3xl font-semibold tracking-tight text-accent">
                                Cinephile
                            </span>
                        </Link>

                        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-text mb-3 text-center">
                            Reset Password
                        </h1>

                        <p className="text-text-3 text-center mb-8 text-sm leading-relaxed max-w-sm">
                            Enter the email address associated with your account, and we'll send you a password reset link.
                        </p>

                        <form
                            onSubmit={handleSubmit}
                            className="w-full flex flex-col space-y-4"
                        >
                            <div className="flex flex-col space-y-2">
                                <label
                                    htmlFor="email"
                                    className="label-caps"
                                >
                                    Email Address
                                </label>

                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-3 transition-colors group-focus-within:text-accent text-[18px]">
                                        mail
                                    </span>

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="director@cinephile.com"
                                        className="mc-input pl-11 rounded-lg text-sm"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn-primary w-full py-3 text-xs tracking-wider uppercase font-semibold mt-4"
                            >
                                <span>Send Reset Link</span>
                                <span className="material-symbols-outlined text-[16px] ml-1">
                                    arrow_forward
                                </span>
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <Link
                                to="/login"
                                className="text-xs text-text-3 hover:text-accent transition-colors flex items-center justify-center gap-1 no-underline font-medium"
                            >
                                <span className="material-symbols-outlined text-[16px]">
                                    arrow_back
                                </span>
                                Back to Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ForgotPassword;
